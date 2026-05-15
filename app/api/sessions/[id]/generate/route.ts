import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import OpenAI from "openai"
import { z } from "zod"

// schema
const questionSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      shortAnswer: z.string(),
    })
  ),
})

// OpenRouter init
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // DB
    const db = await getDatabase()

    const interviewSession = await db.collection("sessions").findOne({
      _id: new ObjectId(id),
      userId: session.userId,
    })

    if (!interviewSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Normalize experience
    const experienceRaw = interviewSession.experience
    const experience =
      typeof experienceRaw === "string"
        ? experienceRaw.trim().toLowerCase()
        : String(experienceRaw ?? "").trim().toLowerCase()

    const isFresher =
      experience === "fresher" ||
      experience === "0" ||
      experience === "0 years" ||
      experience === "0 year" ||
      experience === "beginner"

    const experienceText = isFresher
      ? "Fresher (0 years of experience)"
      : `${interviewSession.experience} years of experience`

    // Strong prompt
    const prompt = `Generate 10 interview questions for a ${interviewSession.title} role.

Topics: ${interviewSession.topics}
Experience Level: ${experienceText}

If the candidate is a fresher:
- Ask beginner-friendly and basic interview questions
- Focus on fundamentals, concepts, projects, internships, and common HR questions
- Avoid advanced senior-level questions

Each question MUST include a detailed answer (minimum 4-5 lines).

Answers should:
- Be clear and practical
- Include examples if possible
- Be useful for real interviews

Strictly return ONLY valid JSON.
Do NOT add any text before or after JSON.

Format:
{
  "questions": [
    {
      "question": "Full question here",
      "shortAnswer": "Detailed answer (4-5 lines explanation)"
    }
  ]
}`

    // OpenRouter call
    const completion = await client.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const text = completion.choices[0].message.content || ""
    console.log("AI RAW RESPONSE:", text)

    // Extract JSON safely
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) {
      throw new Error("No JSON found in AI response")
    }

    let parsed
    try {
      parsed = JSON.parse(match[0])
    } catch {
      throw new Error("AI returned invalid JSON")
    }

    const object = questionSchema.parse(parsed)

    // Fallback fix
    const cleanedQuestions = object.questions.map((q) => ({
      ...q,
      shortAnswer:
        q.shortAnswer && q.shortAnswer !== "..."
          ? q.shortAnswer
          : "Answer not generated properly. Please regenerate.",
    }))

    // Save to DB
    const questionsToInsert = cleanedQuestions.map((q) => ({
      sessionId: id,
      question: q.question,
      shortAnswer: q.shortAnswer,
      createdAt: new Date(),
    }))

    await db.collection("questions").insertMany(questionsToInsert)

    await db.collection("sessions").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          questionCount: questionsToInsert.length,
          lastUpdated: new Date(),
        },
      }
    )

    return NextResponse.json({
      success: true,
      questions: questionsToInsert,
    })
  } catch (error: any) {
    console.error("ERROR:", error)

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
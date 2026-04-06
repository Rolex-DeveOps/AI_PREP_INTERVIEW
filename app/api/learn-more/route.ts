import OpenAI from "openai"

export const maxDuration = 60

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      question = "",
      shortAnswer = "",
      sessionTitle = "Interview",
      messages = [],
    } = body

    const lastMessage =
      messages?.[messages.length - 1]?.content ||
      "Explain this topic in detail with examples."

    // ✅ AI CALL
    const completion = await client.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [
        {
          role: "system",
          content: `You are an expert interview coach helping candidates prepare for ${sessionTitle} roles.

Explain clearly using:
- Simple language
- Bullet points
- Examples
- Best practices`,
        },
        {
          role: "user",
          content: `
Question: ${question}

Short Answer: ${shortAnswer}

User Query: ${lastMessage}

Explain in a detailed and easy way.`,
        },
      ],
    })

    // ✅ SAFE TEXT EXTRACTION
    let text = completion?.choices?.[0]?.message?.content

    // 🔥 fallback fix
    if (!text || text.trim() === "") {
      text = "No explanation generated. Please try again."
    }

    console.log("AI RESPONSE:", text)

    // ✅ ALWAYS RETURN JSON
    return Response.json({
      content: text,
    })

  } catch (error: any) {
    console.error("Learn more error:", error)

    // ✅ NEVER return empty
    return Response.json(
      {
        content:
          "Something went wrong while generating explanation. Please try again.",
      },
      { status: 500 }
    )
  }
}
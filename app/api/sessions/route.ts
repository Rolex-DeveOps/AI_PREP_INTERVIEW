import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const sessions = await db
      .collection("sessions")
      .find({ userId: session.userId })
      .sort({ lastUpdated: -1 })
      .toArray()

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("Get sessions error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, topics, experience, description } = await request.json()

    if (!title || !topics || !experience) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const result = await db.collection("sessions").insertOne({
      userId: session.userId,
      title,
      topics,
      experience,
      description: description || "",
      questionCount: 0,
      lastUpdated: new Date(),
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      session: {
        _id: result.insertedId,
        userId: session.userId,
        title,
        topics,
        experience,
        description: description || "",
        questionCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
      },
    })
  } catch (error) {
    console.error("Create session error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("id")

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    
    // Delete the session
    await db.collection("sessions").deleteOne({
      _id: new ObjectId(sessionId),
      userId: session.userId,
    })

    // Delete all questions for this session
    await db.collection("questions").deleteMany({
      sessionId: sessionId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete session error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

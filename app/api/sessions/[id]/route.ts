import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const db = await getDatabase()
    const interviewSession = await db.collection("sessions").findOne({
      _id: new ObjectId(id),
      userId: session.userId,
    })

    if (!interviewSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const questions = await db
      .collection("questions")
      .find({ sessionId: id })
      .sort({ createdAt: 1 })
      .toArray()

    return NextResponse.json({
      session: interviewSession,
      questions,
    })
  } catch (error) {
    console.error("Get session error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

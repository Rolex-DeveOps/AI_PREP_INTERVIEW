import { ObjectId } from "mongodb"

export interface InterviewSession {
  _id: ObjectId
  userId: string
  title: string
  topics: string
  experience: string
  description?: string
  questionCount: number
  lastUpdated: Date
  createdAt: Date
}

export interface Question {
  _id: ObjectId
  sessionId: string
  question: string
  shortAnswer: string
  createdAt: Date
}

export interface SessionWithQuestions extends InterviewSession {
  questions: Question[]
}

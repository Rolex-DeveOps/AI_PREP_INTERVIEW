import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { getDatabase } from "./mongodb"
import { ObjectId } from "mongodb"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
)

export interface User {
  _id: ObjectId
  fullName: string
  email: string
  password: string
  profileImage?: string
  createdAt: Date
}

export interface Session {
  userId: string
  
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createSession(user: User): Promise<string> {
  const token = await new SignJWT({
    userId: user._id.toString(),   // ✅ ONLY THIS
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET)

  const cookieStore = await cookies()   // ✅ NO await

  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  return token
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as Session
  } catch {
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

export async function createUser(
  fullName: string,
  email: string,
  password: string,
  profileImage?: string
): Promise<User> {
  const db = await getDatabase()
  const hashedPassword = await hashPassword(password)

  const existingUser = await db.collection("users").findOne({ email })
  if (existingUser) {
    throw new Error("User already exists")
  }

  const result = await db.collection("users").insertOne({
    fullName,
    email,
    password: hashedPassword,
    profileImage,
    createdAt: new Date(),
  })

  return {
    _id: result.insertedId,
    fullName,
    email,
    password: hashedPassword,
    profileImage,
    createdAt: new Date(),
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDatabase()
  const user = await db.collection("users").findOne({ email })
  return user as User | null
}

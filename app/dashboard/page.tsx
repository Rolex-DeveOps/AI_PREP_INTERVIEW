"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { SessionCard } from "@/components/session-card"
import { CreateSessionModal } from "@/components/create-session-modal"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface Session {
  _id: string
  title: string
  topics: string
  experience: string
  description?: string
  questionCount: number
  lastUpdated: string
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions")
      const data = await res.json()
      console.log("API KEY:", process.env.GOOGLE_GENERATIVE_AI_API_KEY);
      if (data.sessions) {
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    } else if (user) {
      fetchSessions()
    }
  }, [user, authLoading, router, fetchSessions])

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return

    try {
      await fetch(`/api/sessions?id=${id}`, { method: "DELETE" })
      setSessions(sessions.filter((s) => s._id !== id))
    } catch (error) {
      console.error("Failed to delete session:", error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground mb-4">
              You don&apos;t have any interview sessions yet.
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Session
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <SessionCard
                key={session._id}
                id={session._id}
                title={session.title}
                topics={session.topics}
                experience={session.experience}
                questionCount={session.questionCount}
                lastUpdated={session.lastUpdated}
                description={session.description}
                onDelete={handleDeleteSession}
              />
            ))}
          </div>
        )}

        {/* Floating Add Button */}
        <Button
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-8 right-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full h-14 px-6 shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New
        </Button>
      </main>

      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchSessions}
      />
    </div>
  )
}

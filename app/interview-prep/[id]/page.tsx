"use client"

import { useState, useEffect, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { QAAccordion } from "@/components/qa-accordion"
import { LearnMorePanel } from "@/components/learn-more-panel"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"

interface Question {
  _id: string
  question: string
  shortAnswer: string
}

interface Session {
  _id: string
  title: string
  topics: string
  experience: string
  description?: string
  questionCount: number
  lastUpdated: string
}

export default function InterviewPrepPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [session, setSession] = useState<Session | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${id}`)
      const data = await res.json()
      if (data.session) {
        setSession(data.session)
        setQuestions(data.questions || [])
      }
    } catch (error) {
      console.error("Failed to fetch session:", error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    } else if (user) {
      fetchSession()
    }
  }, [user, authLoading, router, fetchSession])

  const handleRegenerateQuestions = async () => {
    setRegenerating(true)
    try {
      const res = await fetch(`/api/sessions/${id}/generate`, {
        method: "POST",
      })
      if (res.ok) {
        await fetchSession()
      }
    } catch (error) {
      console.error("Failed to regenerate questions:", error)
    } finally {
      setRegenerating(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
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

  if (!user || !session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className={`container mx-auto px-4 py-8 transition-all duration-300 ${selectedQuestion ? "mr-[32rem]" : ""}`}>
        {/* Back button and session info */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="bg-gradient-to-r from-orange-50/50 via-green-50/30 to-blue-50/30 rounded-2xl p-6 border border-border">
            <h1 className="text-3xl font-bold text-foreground mb-2">{session.title}</h1>
            <p className="text-muted-foreground mb-4">{session.topics}</p>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                Experience: {session.experience}
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200">
                {session.questionCount} Q&A
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200">
                Last Updated: {formatDate(session.lastUpdated)}
              </span>
            </div>
          </div>
        </div>

        {/* Q&A Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Interview Q & A</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateQuestions}
              disabled={regenerating}
              className="text-muted-foreground"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? "animate-spin" : ""}`} />
              {regenerating ? "Regenerating..." : "Regenerate Questions"}
            </Button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground mb-4">No questions generated yet.</p>
              <Button
                onClick={handleRegenerateQuestions}
                disabled={regenerating}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {regenerating ? "Generating..." : "Generate Questions"}
              </Button>
            </div>
          ) : (
            <QAAccordion questions={questions} onLearnMore={setSelectedQuestion} />
          )}
        </div>

        {/* Load More Button */}
        {questions.length > 0 && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleRegenerateQuestions}
              disabled={regenerating}
              className="px-8"
            >
              {regenerating ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </main>

      {/* Learn More Panel */}
      <LearnMorePanel
        question={selectedQuestion}
        sessionTitle={session.title}
        onClose={() => setSelectedQuestion(null)}
      />
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { X, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

// 🔥 NEW IMPORTS
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

interface Question {
  _id: string
  question: string
  shortAnswer: string
}

interface LearnMorePanelProps {
  question: Question | null
  sessionTitle: string
  onClose: () => void
}

export function LearnMorePanel({
  question,
  sessionTitle,
  onClose,
}: LearnMorePanelProps) {
  const [answer, setAnswer] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const fetchAnswer = async () => {
    if (!question) return

    try {
      setLoading(true)

      const res = await fetch("/api/learn-more", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.question,
          shortAnswer: question.shortAnswer,
          sessionTitle,
        }),
      })

      let data
      try {
        data = await res.json()
      } catch {
        data = { content: "Invalid response from server" }
      }

      setAnswer(data?.content || "No explanation found.")
    } catch (error) {
      console.error("Fetch error:", error)
      setAnswer("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnswer()
  }, [question?._id])

  if (!question) return null

  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-background border-l border-border shadow-xl z-50 flex flex-col">

      {/* 🔹 Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold text-foreground text-sm leading-snug">
          {question.question}
        </h2>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigator.clipboard.writeText(answer)}
            title="Copy"
          >
            <Copy className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 🔹 Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">
            Loading explanation...
          </p>
        ) : (
          <div
            className="
              prose prose-sm max-w-none 
              dark:prose-invert
              leading-relaxed
              prose-p:mb-3
              prose-li:mb-1
              prose-headings:mt-4 prose-headings:mb-2
            "
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "")

                  return !inline ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match?.[1] || "javascript"}
                      PreTag="div"
                      className="rounded-lg text-sm"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-gray-200 px-1 py-0.5 rounded text-pink-500">
                      {children}
                    </code>
                  )
                },
              }}
            >
              {answer}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
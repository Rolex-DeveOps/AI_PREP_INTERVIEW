"use client"

import { useState } from "react"
import { ChevronDown, MessageSquare, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Question {
  _id: string
  question: string
  shortAnswer: string
}

interface QAAccordionProps {
  questions: Question[]
  onLearnMore: (question: Question) => void
}

export function QAAccordion({ questions, onLearnMore }: QAAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <div className="space-y-3">
      {questions.map((q) => {
        const isOpen = openItems.has(q._id)
        return (
          <div
            key={q._id}
            className="border border-border rounded-lg bg-card overflow-hidden"
          >
            <button
              onClick={() => toggleItem(q._id)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
            >
              <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="flex-1 font-medium text-foreground">{q.question}</span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            <div
              className={cn(
                "grid transition-all duration-200 ease-in-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-4 pt-2 border-t border-border">
                  <div className="flex items-center justify-end gap-2 mb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigator.clipboard.writeText(q.shortAnswer)
                      }}
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        onLearnMore(q)
                      }}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Learn More
                    </Button>
                  </div>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    {q.shortAnswer.split("\n").map((paragraph, idx) => (
                      <p key={idx} className="mb-2 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

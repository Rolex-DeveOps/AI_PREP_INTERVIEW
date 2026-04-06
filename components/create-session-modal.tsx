"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CreateSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateSessionModal({ isOpen, onClose, onSuccess }: CreateSessionModalProps) {
  const [title, setTitle] = useState("")
  const [experience, setExperience] = useState("")
  const [topics, setTopics] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        credentials: "include", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, experience, topics, description }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create session")
      }

      // Generate questions for the new session
      await fetch(`/api/sessions/${data.session._id}/generate`, {
        method: "POST",
        credentials: "include", 
      })

      resetForm()
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setExperience("")
    setTopics("")
    setDescription("")
    setError("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Start a New Interview Journey
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Fill out a few quick details and unlock your personalized set of interview questions!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Target Role</Label>
            <Input
              id="title"
              type="text"
              placeholder="(e.g., Frontend Developer, UI/UX Designer, etc.)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Years of Experience</Label>
            <Input
              id="experience"
              type="text"
              placeholder="(e.g., 1 year, 3 years, 5+ years)"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topics">Topics to Focus On</Label>
            <Input
              id="topics"
              type="text"
              placeholder="(Comma-separated, e.g., React, Node.js, MongoDB)"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="(Any specific goals or notes for this session)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-foreground text-background hover:bg-foreground/90"
            disabled={loading}
          >
            {loading ? "Creating Session..." : "Create Session"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

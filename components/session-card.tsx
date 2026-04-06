"use client"

import Link from "next/link"
import { Trash2 } from "lucide-react"

interface SessionCardProps {
  id: string
  title: string
  topics: string
  experience: string
  questionCount: number
  lastUpdated: string
  description?: string
  onDelete?: (id: string) => void
}

export function SessionCard({
  id,
  title,
  topics,
  experience,
  questionCount,
  lastUpdated,
  description,
  onDelete,
}: SessionCardProps) {
  const getInitials = (title: string) => {
    return title
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDelete) {
      onDelete(id)
    }
  }

  return (
    <Link href={`/interview-prep/${id}`}>
      <div className="group relative bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:border-orange-200 transition-all duration-200 cursor-pointer">
        {onDelete && (
          <button
            onClick={handleDelete}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
            title="Delete session"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
            <span className="text-sm font-semibold text-orange-600">{getInitials(title)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-lg truncate">{title}</h3>
            <p className="text-sm text-muted-foreground truncate">{topics}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            Experience: {experience}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
            {questionCount} Q&A
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
            Last Updated: {formatDate(lastUpdated)}
          </span>
        </div>

        {description && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}
      </div>
    </Link>
  )
}

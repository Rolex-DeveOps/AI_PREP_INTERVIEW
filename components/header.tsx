"use client"

import Link from "next/link"
import { useAuth } from "./auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
  onLoginClick?: () => void
}

export function Header({ onLoginClick }: HeaderProps) {
  const { user, logout } = useAuth()

  const getInitials = (name?: string) => {
  if (!name) return "U" // fallback

  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-foreground">AI Prep Interview </span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.profileImage} alt={user.fullName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user.fullName}</p>
                  <button
                    onClick={logout}
                    className="text-xs text-orange-500 hover:text-orange-600 hover:underline"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              onClick={onLoginClick}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6"
            >
              Login / Sign Up
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

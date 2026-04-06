"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { AuthModal } from "@/components/auth-modal"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import Image from "next/image"

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard")
    } else {
      setShowAuthModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onLoginClick={() => setShowAuthModal(true)} />

      <main className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-600">AI Powered</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              Ace Interviews with{" "}
              <span className="text-orange-500">AI-Powered</span> Learning
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              Get role-specific questions, expand answers when you need them, dive deeper into
              concepts, and organize everything your way. From preparation to mastery - your
              ultimate interview toolkit is here.
            </p>

            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 px-8 py-6 text-lg rounded-lg"
            >
              Get Started
            </Button>
          </div>

          {/* Right side - App preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 via-green-50/30 to-blue-50/30 rounded-3xl blur-3xl" />
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-background rounded-md text-xs text-muted-foreground">
                    https://interviewprepai.com/interview-prep
                  </div>
                </div>
              </div>

              {/* App content preview */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-semibold text-foreground">Interview Prep AI</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-orange-600">MW</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">Mike William</p>
                      <p className="text-xs text-orange-500">Logout</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Frontend Developer</h3>
                    <p className="text-sm text-muted-foreground">React.js, DOM manipulation, CSS Flexbox</p>
                  </div>

                  <div className="flex gap-2">
                    <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">Experience: 2 Years</span>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">10 Q&A</span>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">Last Updated: 30th Apr 2025</span>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-sm font-medium text-foreground mb-3">Interview Q & A</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">Q</span>
                        <span className="text-sm text-foreground">What is JSX? Explain its role in React.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side panel preview */}
              <div className="absolute right-0 top-12 w-64 h-64 bg-card border-l border-border shadow-lg rounded-l-lg p-4 transform translate-x-1/3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground">CSS Flexbox: A Beginner&apos;s Guide</h4>
                  <X className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  CSS Flexbox is a powerful layout model in CSS. It&apos;s designed to make it easier to
                  design flexible and responsive web page layouts without having to rely on floats or
                  positioning...
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

function X({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { FcGoogle } from "react-icons/fc"
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState("")

  const { signIn, signInWithGoogle } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAuthError("")

    try {
      const user = await signIn(email, password)
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.displayName || user.email}!`,
      })

      // Redirect based on role
      if (user.role === "manager") {
        router.push("/manager")
      } else {
        router.push("/worker")
      }
    } catch (error) {
      console.error("Login error:", error)
      setAuthError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setAuthError("")
      const user = await signInWithGoogle()
      toast({
        title: "Login successful",
        description: `Welcome, ${user.displayName || user.email}!`,
      })

      // Redirect based on role
      if (user.role === "manager") {
        router.push("/manager")
      } else {
        router.push("/worker")
      }
    } catch (error) {
      console.error("Google sign-in error:", error)
      if ((error as Error).message === "Role is required for new users") {
        // Redirect to role selection page
        router.push("/signup/role?provider=google")
      } else if ((error as Error).message.includes("auth/unauthorized-domain")) {
        setAuthError("This domain is not authorized for authentication. Please add it to your Firebase Auth settings.")
      } else {
        setAuthError((error as Error).message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-bold text-white tracking-tight"
          >
            Time Tracking System
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-gray-400 mt-2"
          >
            Location-based time tracking for care workers
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-white">Login</CardTitle>
              <CardDescription className="text-gray-400">Enter your credentials to access your account</CardDescription>
            </CardHeader>

            {authError && (
              <div className="px-6">
                <Alert variant="destructive" className="bg-red-900/30 border-red-800 text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-600"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-300">
                      Password
                    </Label>
                    <Link href="/forgot-password" className="text-xs text-blue-500 hover:text-blue-400 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-600"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10 text-gray-500 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800"></div>
                  </div>
                  <div className="relative bg-gray-900 px-4 text-sm text-gray-500">Or continue with</div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-gray-700 bg-gray-800/50 text-white hover:bg-gray-700 hover:text-white"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <FcGoogle className="mr-2 h-5 w-5" />
                  Google
                </Button>
              </CardContent>
            </form>
            <CardFooter className="flex justify-center border-t border-gray-800 pt-4">
              <p className="text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-blue-500 hover:text-blue-400 hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>

        {authError && authError.includes("auth/unauthorized-domain") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
          >
            <h3 className="text-white font-medium mb-2">How to fix the unauthorized domain error:</h3>
            <ol className="list-decimal pl-5 text-gray-400 space-y-1 text-sm">
              <li>
                Go to the{" "}
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Firebase Console
                </a>
              </li>
              <li>Select your project</li>
              <li>Go to Authentication &gt; Settings &gt; Authorized domains</li>
              <li>Add your domain to the list of authorized domains</li>
              <li>Save changes and try again</li>
            </ol>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}


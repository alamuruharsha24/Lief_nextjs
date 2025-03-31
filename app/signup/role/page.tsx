"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { User, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function RoleSelectionPage() {
  const [role, setRole] = useState<"manager" | "worker">("worker")
  const [isLoading, setIsLoading] = useState(false)

  const { signInWithGoogle } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const provider = searchParams.get("provider")

  const handleContinue = async () => {
    if (provider !== "google") {
      router.push("/signup")
      return
    }

    setIsLoading(true)

    try {
      const user = await signInWithGoogle(role)
      toast({
        title: "Account created",
        description: "Your account has been created successfully.",
      })

      // Redirect based on role
      if (user.role === "manager") {
        router.push("/manager")
      } else {
        router.push("/worker")
      }
    } catch (error) {
      toast({
        title: "Signup failed",
        description: (error as Error).message,
        variant: "destructive",
      })
      router.push("/signup")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 p-4">
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
            className="text-3xl font-bold text-gray-900 dark:text-white"
          >
            Time Tracking System
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-gray-600 dark:text-gray-400 mt-2"
          >
            Location-based time tracking for care workers
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Select your role</CardTitle>
              <CardDescription>Choose your role to complete your account setup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    role === "worker"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                  }`}
                  onClick={() => setRole("worker")}
                >
                  <div
                    className={`p-3 rounded-full mb-3 ${
                      role === "worker" ? "bg-blue-100 dark:bg-blue-800" : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <User
                      className={`h-8 w-8 ${
                        role === "worker" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                  </div>
                  <span
                    className={`font-medium text-lg ${
                      role === "worker" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Care Worker
                  </span>
                  <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
                    Clock in and out at designated locations, track your work hours
                  </p>
                </div>
                <div
                  className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    role === "manager"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                  }`}
                  onClick={() => setRole("manager")}
                >
                  <div
                    className={`p-3 rounded-full mb-3 ${
                      role === "manager" ? "bg-purple-100 dark:bg-purple-800" : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <Users
                      className={`h-8 w-8 ${
                        role === "manager" ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                  </div>
                  <span
                    className={`font-medium text-lg ${
                      role === "manager" ? "text-purple-600 dark:text-purple-400" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Manager
                  </span>
                  <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
                    Set location perimeters, view staff data, and analyze work patterns
                  </p>
                </div>
              </div>
              <Button onClick={handleContinue} className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">This will complete your account setup</p>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}


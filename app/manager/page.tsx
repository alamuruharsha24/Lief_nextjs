"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, MapPin, Users, LogOut } from "lucide-react"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ManagerDashboard } from "@/components/manager-dashboard"
import { PerimeterSettings } from "@/components/perimeter-settings"
import { StaffTable } from "@/components/staff-table"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"

export default function ManagerPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [clockInData, setClockInData] = useState([])
  const { user, signOut } = useAuth()

  useEffect(() => {
    const fetchClockInData = async () => {
      if (!user) return

      try {
        // Get today's date at mid_night
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Get all clock-in records for today
        const clockInQuery = query(
          collection(db, "clockRecords"),
          where("timestamp", ">=", today.toISOString()),
          orderBy("timestamp", "desc"),
        )

        const querySnapshot = await getDocs(clockInQuery)
        const records = []

        querySnapshot.forEach((doc) => {
          records.push({
            id: doc.id,
            ...doc.data(),
          })
        })

        setClockInData(records)
      } catch (error) {
        console.error("Error fetching clock-in data:", error)
      }
    }

    fetchClockInData()
    // Set up a refresh interval - every 5 minutes ;
    const intervalId = setInterval(fetchClockInData, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [user])

  return (
    <ProtectedRoute allowedRoles={["manager"]}>
      <div className="flex min-h-screen flex-col">
        <header className="border-b">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Back to Home</span>
                </Link>
              </Button>
              <h1 className="text-xl font-bold">Manager Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2">
                  {user.photoURL && (
                    <img
                      src={user.photoURL || "/placeholder.svg"}
                      alt={user.displayName || "User"}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium hidden md:inline-block">{user.displayName || user.email}</span>
                </div>
              )}
              <Button variant="ghost" size="icon" onClick={signOut} title="Sign Out">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Sign Out</span>
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto flex-1 px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="staff" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Staff</span>
                </TabsTrigger>
                <TabsTrigger value="perimeter" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Perimeter</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Dashboard</CardTitle>
                  <CardDescription>Overview of staff clock-in/out patterns and statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ManagerDashboard clockInData={clockInData} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="staff" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Staff Clock-in/out Data</CardTitle>
                  <CardDescription>View and manage staff time tracking records</CardDescription>
                </CardHeader>
                <CardContent>
                  <StaffTable clockInData={clockInData} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="perimeter" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Location Perimeter Settings</CardTitle>
                  <CardDescription>Set and manage location perimeters for clock-in eligibility</CardDescription>
                </CardHeader>
                <CardContent>
                  <PerimeterSettings />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  )
}


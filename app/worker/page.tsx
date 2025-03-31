"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, MapPin, LogOut, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { collection, addDoc, query, where, orderBy, getDocs, limit } from "firebase/firestore"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ClockInOutHistory } from "@/components/clock-in-out-history"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { Badge } from "@/components/ui/badge"

export default function WorkerPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isWithinPerimeter, setIsWithinPerimeter] = useState(false)
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [clockInTime, setClockInTime] = useState<Date | null>(null)
  const [clockInLocation, setClockInLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [clockInId, setClockInId] = useState<string | null>(null)
  const [perimeters, setPerimeters] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [locationStatus, setLocationStatus] = useState<"success" | "warning" | "error" | "loading">("loading")

  const { user, signOut } = useAuth()

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in km
    return distance
  }

  // Check if user is within any perimeter
  const checkPerimeters = (userLat: number, userLng: number) => {
    if (perimeters.length === 0) {
      setLocationStatus("warning")
      return false
    }

    for (const perimeter of perimeters) {
      const distance = calculateDistance(userLat, userLng, perimeter.latitude, perimeter.longitude)
      if (distance <= perimeter.radius) {
        setLocationStatus("success")
        return true
      }
    }
    setLocationStatus("error")
    return false
  }

  // Fetch perimeters from Firestore
  useEffect(() => {
    const fetchPerimeters = async () => {
      try {
        const perimeterCollection = collection(db, "perimeters")
        const perimeterSnapshot = await getDocs(perimeterCollection)
        const perimeterList = perimeterSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setPerimeters(perimeterList)
      } catch (error) {
        console.error("Error fetching perimeters:", error)
        setError("Failed to load location perimeters.")
        setLocationStatus("warning")
      }
    }

    fetchPerimeters()
  }, [])

  // Check if user is already clocked in
  useEffect(() => {
    const checkClockInStatus = async () => {
      if (!user) return

      try {
        // Get today's date at midnight
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Check if user has an active clock-in record
        // Modified query to fix the Firestore index error
        const clockInQuery = query(
          collection(db, "clockRecords"),
          where("userId", "==", user.uid),
          where("timestamp", ">=", today.toISOString()),
          limit(10), // Add limit to avoid complex index requirements
        )

        const querySnapshot = await getDocs(clockInQuery)

        // Filter results client-side to find records with null clockOutTime
        const activeRecord = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .find((record) => record.clockOutTime === null)

        if (activeRecord) {
          setIsClockedIn(true)
          setClockInId(activeRecord.id)
          setClockInTime(new Date(activeRecord.timestamp))
          setClockInLocation(activeRecord.location)
        }

        // Fetch user's clock-in history
        const historyQuery = query(
          collection(db, "clockRecords"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc"),
          limit(20), // Limit to 20 most recent records
        )

        const historySnapshot = await getDocs(historyQuery)
        const historyData = historySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setHistory(historyData)
      } catch (error) {
        console.error("Error checking clock-in status:", error)
        setError("Error checking clock-in status. Please refresh the page.")
      }
    }

    checkClockInStatus()
  }, [user])

  // Get current location and check if within perimeter
  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const currentLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            setLocation(currentLocation)

            // Check if within any perimeter
            const withinPerimeter = checkPerimeters(currentLocation.lat, currentLocation.lng)
            setIsWithinPerimeter(withinPerimeter)
            setError("")
          },
          (error) => {
            setError("Unable to retrieve your location. Please enable location services.")
            setLocationStatus("warning")
          },
        )
      } else {
        setError("Geolocation is not supported by your browser.")
        setLocationStatus("warning")
      }
    }

    getLocation()
    const intervalId = setInterval(getLocation, 30000) // Update location every 30 seconds

    return () => clearInterval(intervalId)
  }, [perimeters])

  const handleClockIn = async () => {
    if (!user || !location) return

    if (!isWithinPerimeter) {
      setError("You cannot clock in outside the designated perimeter.")
      return
    }

    setIsLoading(true)

    try {
      const now = new Date()

      // Create a new clock-in record
      const clockInData = {
        userId: user.uid,
        userName: user.displayName || user.email,
        timestamp: now.toISOString(),
        location: location,
        note: note,
        clockOutTime: null,
        clockOutLocation: null,
        clockOutNote: null,
      }

      const docRef = await addDoc(collection(db, "clockRecords"), clockInData)

      setIsClockedIn(true)
      setClockInTime(now)
      setClockInLocation(location)
      setClockInId(docRef.id)
      setNote("")
      setError("")

      // Update history
      setHistory([{ id: docRef.id, ...clockInData }, ...history])
    } catch (error) {
      console.error("Error clocking in:", error)
      setError("Failed to clock in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!user || !location || !clockInId) return

    setIsLoading(true)

    try {
      const now = new Date()

      // Update the existing clock-in record with clock-out data
      const clockOutData = {
        clockOutTime: now.toISOString(),
        clockOutLocation: location,
        clockOutNote: note,
      }

      // Update the document in Firestore
      await fetch(`/api/clock-out?id=${clockInId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clockOutData),
      })

      setIsClockedIn(false)
      setClockInTime(null)
      setClockInLocation(null)
      setClockInId(null)
      setNote("")

      // Update history
      const updatedHistory = history.map((record) => {
        if (record.id === clockInId) {
          return { ...record, ...clockOutData }
        }
        return record
      })

      setHistory(updatedHistory)
    } catch (error) {
      console.error("Error clocking out:", error)
      setError("Failed to clock out. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = () => {
    switch (locationStatus) {
      case "success":
        return (
          <Badge
            variant="outline"
            className="bg-green-900/30 text-green-400 border-green-700 flex items-center gap-1.5"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Within perimeter
          </Badge>
        )
      case "error":
        return (
          <Badge variant="outline" className="bg-red-900/30 text-red-400 border-red-700 flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5" />
            Outside perimeter
          </Badge>
        )
      case "warning":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-900/30 text-yellow-400 border-yellow-700 flex items-center gap-1.5"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Location issue
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-800 text-gray-400 border-gray-700 flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-gray-500 animate-pulse" />
            Checking location...
          </Badge>
        )
    }
  }

  return (
    <ProtectedRoute allowedRoles={["worker"]}>
      <div className="flex min-h-screen flex-col bg-gray-950">
        <header className="border-b border-gray-800 bg-gray-900">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Back to Home</span>
                </Link>
              </Button>
              <h1 className="text-xl font-bold text-white">Lief Care Worker Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2">
                  {user.photoURL && (
                    <img
                      src={user.photoURL || "/placeholder.svg"}
                      alt={user.displayName || "User"}
                      className="h-8 w-8 rounded-full border border-gray-700"
                    />
                  )}
                  <span className="text-sm font-medium hidden md:inline-block text-gray-300">
                    {user.displayName || user.email}
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                title="Sign Out"
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Sign Out</span>
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto flex-1 px-4 py-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-1"
            >
              <Card className="border-gray-800 bg-gray-900 shadow-lg h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">{isClockedIn ? "Clock Out" : "Clock In"}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {isClockedIn
                          ? "Record when you finish your shift"
                          : "Record when you start your shift at a designated location"}
                      </CardDescription>
                    </div>
                    {getStatusBadge()}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span>
                      {location
                        ? `Current location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
                        : "Retrieving location..."}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span>Current time: {new Date().toLocaleTimeString()}</span>
                  </div>

                  {isClockedIn && clockInTime && (
                    <div className="rounded-md bg-gray-800/50 border border-gray-700 p-3">
                      <p className="text-sm font-medium text-white">
                        Clocked in at: {clockInTime.toLocaleTimeString()}
                      </p>
                      {clockInLocation && (
                        <p className="text-sm text-gray-400">
                          Location: {clockInLocation.lat.toFixed(6)}, {clockInLocation.lng.toFixed(6)}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <Textarea
                      placeholder="Add an optional note..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="resize-none bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-600"
                    />
                  </div>

                  {error && <p className="text-sm font-medium text-red-400">{error}</p>}

                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        locationStatus === "success"
                          ? "bg-green-500 animate-pulse"
                          : locationStatus === "error"
                            ? "bg-red-500 animate-pulse"
                            : "bg-yellow-500 animate-pulse"
                      }`}
                    />
                    <span className="text-sm text-gray-400">
                      {locationStatus === "success"
                        ? "You are within the designated perimeter"
                        : locationStatus === "error"
                          ? "You are outside the designated perimeter"
                          : "There is an issue with your location"}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  {isClockedIn ? (
                    <Button
                      onClick={handleClockOut}
                      className="w-auto px-8 bg-red-600 hover:bg-red-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Processing...
                        </>
                      ) : (
                        "Clock Out"
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleClockIn}
                      disabled={!isWithinPerimeter || isLoading}
                      className={`w-auto px-8 ${
                        isWithinPerimeter ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 cursor-not-allowed"
                      } text-white`}
                    >
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Processing...
                        </>
                      ) : (
                        "Clock In"
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="lg:col-span-2"
            >
              <Card className="border-gray-800 bg-gray-900 shadow-lg h-full">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                  <CardDescription className="text-gray-400">Your recent clock-in/out history</CardDescription>
                </CardHeader>
                <CardContent>
                  <ClockInOutHistory history={history} />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}


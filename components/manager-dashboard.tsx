"use client"

import { useEffect, useState } from "react"
import { BarChart, LineChart } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, ArrowDownRight, Users, Clock, CalendarClock } from "lucide-react"
import { motion } from "framer-motion"

interface ClockRecord {
  id: string
  userId: string
  userName: string
  timestamp: string
  location: { lat: number; lng: number }
  note: string
  clockOutTime: string | null
  clockOutLocation: { lat: number; lng: number } | null
  clockOutNote: string | null
}

interface ManagerDashboardProps {
  clockInData: ClockRecord[]
}

export function ManagerDashboard({ clockInData }: ManagerDashboardProps) {
  const [dailyClockInsData, setDailyClockInsData] = useState([])
  const [avgHoursData, setAvgHoursData] = useState([])
  const [staffHoursData, setStaffHoursData] = useState([])
  const [activeStaffCount, setActiveStaffCount] = useState(0)
  const [totalHoursToday, setTotalHoursToday] = useState(0)
  const [avgHoursPerShift, setAvgHoursPerShift] = useState(0)
  const [timeRange, setTimeRange] = useState("week")

  useEffect(() => {
    if (!clockInData.length) return

    // Process data for charts
    processChartData()
    calculateSummaryMetrics()
  }, [clockInData, timeRange])

  const calculateSummaryMetrics = () => {
    // Count active staff (clocked in but not out)
    const active = clockInData.filter((record) => !record.clockOutTime).length
    setActiveStaffCount(active)

    // Calculate total hours worked today
    const today = new Date().toISOString().split("T")[0]
    let totalHours = 0
    let completedShifts = 0

    clockInData.forEach((record) => {
      const recordDate = new Date(record.timestamp).toISOString().split("T")[0]

      if (recordDate === today && record.clockOutTime) {
        const clockInTime = new Date(record.timestamp).getTime()
        const clockOutTime = new Date(record.clockOutTime).getTime()
        const hoursWorked = (clockOutTime - clockInTime) / (1000 * 60 * 60)
        totalHours += hoursWorked
        completedShifts++
      }
    })

    setTotalHoursToday(Number.parseFloat(totalHours.toFixed(1)))
    setAvgHoursPerShift(completedShifts > 0 ? Number.parseFloat((totalHours / completedShifts).toFixed(1)) : 0)
  }

  const processChartData = () => {
    // Determine date range based on selected time range
    const days = []
    const today = new Date()
    const daysToShow = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 14

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      days.push({
        date,
        name:
          timeRange === "month" ? date.getDate().toString() : date.toLocaleDateString("en-US", { weekday: "short" }),
        fullDate: date.toISOString().split("T")[0],
      })
    }

    // Count daily clock-ins
    const dailyClockIns = days.map((day) => {
      const count = clockInData.filter((record) => {
        const recordDate = new Date(record.timestamp).toISOString().split("T")[0]
        return recordDate === day.fullDate
      }).length

      return {
        name: day.name,
        value: count,
      }
    })

    // Calculate average hours per day
    const avgHours = days.map((day) => {
      const dayRecords = clockInData.filter((record) => {
        const recordDate = new Date(record.timestamp).toISOString().split("T")[0]
        return recordDate === day.fullDate && record.clockOutTime
      })

      if (dayRecords.length === 0) return { name: day.name, value: 0 }

      let totalHours = 0
      dayRecords.forEach((record) => {
        if (record.clockOutTime) {
          const clockInTime = new Date(record.timestamp).getTime()
          const clockOutTime = new Date(record.clockOutTime).getTime()
          const hoursWorked = (clockOutTime - clockInTime) / (1000 * 60 * 60)
          totalHours += hoursWorked
        }
      })

      return {
        name: day.name,
        value: dayRecords.length > 0 ? Number.parseFloat((totalHours / dayRecords.length).toFixed(1)) : 0,
      }
    })

    // Calculate total hours per staff over the selected time range
    const staffMap = new Map()

    clockInData.forEach((record) => {
      if (record.clockOutTime) {
        const recordDate = new Date(record.timestamp)
        const rangeDate = new Date()
        rangeDate.setDate(rangeDate.getDate() - daysToShow)

        if (recordDate >= rangeDate) {
          const clockInTime = new Date(record.timestamp).getTime()
          const clockOutTime = new Date(record.clockOutTime).getTime()
          const hoursWorked = (clockOutTime - clockInTime) / (1000 * 60 * 60)

          if (staffMap.has(record.userName)) {
            staffMap.set(record.userName, staffMap.get(record.userName) + hoursWorked)
          } else {
            staffMap.set(record.userName, hoursWorked)
          }
        }
      }
    })

    const staffHours = Array.from(staffMap.entries())
      .map(([name, hours]) => ({
        name,
        value: Number.parseFloat(hours.toFixed(1)),
      }))
      .sort((a, b) => b.value - a.value) // Sort by hours in descending order
      .slice(0, 10) // Limit to top 10 staff members

    setDailyClockInsData(dailyClockIns)
    setAvgHoursData(avgHours)
    setStaffHoursData(staffHours)
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="border-gray-800 bg-gradient-to-br from-blue-900/40 to-blue-950/60 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-400">Active Staff</CardDescription>
              <CardTitle className="text-2xl flex items-center justify-between text-white">
                {activeStaffCount}
                <Users className="h-5 w-5 text-blue-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-blue-400 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Currently clocked in
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-gray-800 bg-gradient-to-br from-green-900/40 to-green-950/60 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-green-400">Hours Today</CardDescription>
              <CardTitle className="text-2xl flex items-center justify-between text-white">
                {totalHoursToday}
                <Clock className="h-5 w-5 text-green-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-green-400 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Total hours logged today
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-gray-800 bg-gradient-to-br from-purple-900/40 to-purple-950/60 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-400">Avg. Shift</CardDescription>
              <CardTitle className="text-2xl flex items-center justify-between text-white">
                {avgHoursPerShift} hrs
                <CalendarClock className="h-5 w-5 text-purple-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-purple-400 flex items-center">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                Average hours per shift
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="week" value={timeRange} onValueChange={setTimeRange} className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">Activity Overview</h3>
          <TabsList className="bg-gray-800">
            <TabsTrigger value="week" className="data-[state=active]:bg-gray-700">
              Week
            </TabsTrigger>
            <TabsTrigger value="fortnight" className="data-[state=active]:bg-gray-700">
              Fortnight
            </TabsTrigger>
            <TabsTrigger value="month" className="data-[state=active]:bg-gray-700">
              Month
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-gray-800 bg-gray-900 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-md text-white">Daily Clock-ins</CardTitle>
                <CardDescription className="text-gray-400">Number of staff clocking in each day</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px] w-full">
                  <BarChart
                    data={dailyClockInsData}
                    index="name"
                    categories={["value"]}
                    colors={["hsl(215, 100%, 50%)"]}
                    valueFormatter={(value) => `${value} staff`}
                    showLegend={false}
                    showXAxis
                    showYAxis
                    showGridLines
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-gray-800 bg-gray-900 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-md text-white">Average Hours</CardTitle>
                <CardDescription className="text-gray-400">
                  Average hours staff are spending clocked in each day
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px] w-full">
                  <LineChart
                    data={avgHoursData}
                    index="name"
                    categories={["value"]}
                    colors={["hsl(142, 76%, 36%)"]}
                    valueFormatter={(value) => `${value} hours`}
                    showLegend={false}
                    showXAxis
                    showYAxis
                    showGridLines
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Tabs>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-gray-800 bg-gray-900 shadow-lg">
          <CardHeader>
            <CardTitle className="text-md text-white">Total Hours Per Staff</CardTitle>
            <CardDescription className="text-gray-400">
              Total hours clocked in per staff over the selected time period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <BarChart
                data={staffHoursData}
                index="name"
                categories={["value"]}
                colors={["hsl(262, 83%, 58%)"]}
                valueFormatter={(value) => `${value} hours`}
                showLegend={false}
                showXAxis
                showYAxis
                showGridLines
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


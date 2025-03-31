"use client"

import { useState, useEffect } from "react"
import { Calendar, Filter, Search, FileText, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

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

interface StaffTableProps {
  clockInData: ClockRecord[]
}

export function StaffTable({ clockInData }: StaffTableProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredStaff, setFilteredStaff] = useState<ClockRecord[]>([])
  const [dateFilter, setDateFilter] = useState("")
  const [selectedRecord, setSelectedRecord] = useState<ClockRecord | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!clockInData.length) return

    const filtered = clockInData.filter((record) => {
      const matchesSearch = record.userName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        activeTab === "all" ||
        (activeTab === "active" && !record.clockOutTime) ||
        (activeTab === "inactive" && record.clockOutTime)

      const matchesDate = !dateFilter || new Date(record.timestamp).toISOString().split("T")[0] === dateFilter

      return matchesSearch && matchesStatus && matchesDate
    })

    setFilteredStaff(filtered)
  }, [clockInData, searchTerm, activeTab, dateFilter])

  // Calculate duration between clock in and clock out
  const calculateDuration = (clockIn: string, clockOut: string | null) => {
    if (!clockOut) return "-"

    const start = new Date(clockIn).getTime()
    const end = new Date(clockOut).getTime()
    const durationMs = end - start

    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  const handleOpenNote = (record: ClockRecord) => {
    setSelectedRecord(record)
    setOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="all" className="data-[state=active]:bg-gray-700">
              All Staff
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-gray-700">
              Currently Active
            </TabsTrigger>
            <TabsTrigger value="inactive" className="data-[state=active]:bg-gray-700">
              Inactive
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:w-[200px] bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-gray-700 bg-gray-800 hover:bg-gray-700 hover:text-white"
              >
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] bg-gray-900 border-gray-800" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-gray-300">
                    Date
                  </Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <Input
                      id="date"
                      type="date"
                      className="h-8 bg-gray-800 border-gray-700 text-white"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDateFilter("")}
                  className="border-gray-700 bg-gray-800 hover:bg-gray-700 hover:text-white"
                >
                  Clear Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Card className="border-gray-800 bg-gray-900">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 bg-gray-800/50">
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Clock In</TableHead>
                <TableHead className="text-gray-400">Clock Out</TableHead>
                <TableHead className="text-gray-400">Duration</TableHead>
                <TableHead className="text-gray-400">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length === 0 ? (
                <TableRow className="border-gray-800">
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((record) => (
                  <TableRow key={record.id} className="border-gray-800 group hover:bg-gray-800/50 transition-colors">
                    <TableCell className="font-medium text-gray-300">{record.userName}</TableCell>
                    <TableCell>
                      {!record.clockOutTime ? (
                        <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-800">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-900/30 text-red-400 border-red-800">
                          <div className="h-2 w-2 rounded-full bg-red-500 mr-1.5" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-300">
                          {new Date(record.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-gray-500 cursor-help">
                          {new Date(record.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.clockOutTime ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-300">
                            {new Date(record.clockOutTime).toLocaleTimeString()}
                          </div>
                          <div className="text-xs text-gray-500 cursor-help">
                            {new Date(record.clockOutTime).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {calculateDuration(record.timestamp, record.clockOutTime)}
                    </TableCell>
                    <TableCell>
                      {record.note || record.clockOutNote ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center text-gray-400 hover:text-blue-400 p-1 h-auto"
                          onClick={() => handleOpenNote(record)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          <span className="text-xs">View Notes</span>
                        </Button>
                      ) : (
                        <span className="text-gray-500 text-xs">No notes</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center justify-between">
              Staff Notes
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full text-gray-400 hover:text-white absolute right-4 top-4"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedRecord && (
                <>
                  <span className="font-medium text-gray-300">{selectedRecord.userName}</span> -{" "}
                  {new Date(selectedRecord.timestamp).toLocaleDateString()}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4 py-2">
              {selectedRecord.note && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-400">Clock-in Note:</h4>
                  <div className="p-3 bg-gray-800 rounded-md text-gray-300 text-sm">{selectedRecord.note}</div>
                </div>
              )}

              {selectedRecord.clockOutNote && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-400">Clock-out Note:</h4>
                  <div className="p-3 bg-gray-800 rounded-md text-gray-300 text-sm">{selectedRecord.clockOutNote}</div>
                </div>
              )}

              {!selectedRecord.note && !selectedRecord.clockOutNote && (
                <div className="text-center text-gray-500 py-4">No notes available for this record.</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


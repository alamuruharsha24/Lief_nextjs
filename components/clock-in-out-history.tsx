"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ClockRecord {
  id: string
  timestamp: string
  clockOutTime: string | null
  note?: string
  clockOutNote?: string
}

interface ClockInOutHistoryProps {
  history: ClockRecord[]
}

export function ClockInOutHistory({ history }: ClockInOutHistoryProps) {
  const [selectedRecord, setSelectedRecord] = useState<ClockRecord | null>(null)
  const [open, setOpen] = useState(false)

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
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800">
            <TableHead className="text-gray-400">Date</TableHead>
            <TableHead className="text-gray-400">Clock In</TableHead>
            <TableHead className="text-gray-400">Clock Out</TableHead>
            <TableHead className="text-gray-400">Duration</TableHead>
            <TableHead className="text-gray-400">Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.length === 0 ? (
            <TableRow className="border-gray-800">
              <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                No clock-in/out history found.
              </TableCell>
            </TableRow>
          ) : (
            history.map((record) => (
              <TableRow key={record.id} className="border-gray-800 hover:bg-gray-800/50 transition-colors">
                <TableCell className="font-medium text-gray-300">
                  {new Date(record.timestamp).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-gray-300">{new Date(record.timestamp).toLocaleTimeString()}</TableCell>
                <TableCell>
                  {record.clockOutTime ? (
                    <span className="text-gray-300">{new Date(record.clockOutTime).toLocaleTimeString()}</span>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center justify-between">
              Notes
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
              {selectedRecord && new Date(selectedRecord.timestamp).toLocaleDateString()} -{" "}
              {selectedRecord && calculateDuration(selectedRecord.timestamp, selectedRecord.clockOutTime)}
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


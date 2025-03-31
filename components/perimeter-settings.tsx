"use client"

import { useState, useEffect } from "react"
import { MapPin, Plus, Save, X } from "lucide-react"
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"

interface Perimeter {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number
}

export function PerimeterSettings() {
  const [perimeters, setPerimeters] = useState<Perimeter[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newPerimeter, setNewPerimeter] = useState({
    name: "",
    latitude: "",
    longitude: "",
    radius: "",
  })

  const { toast } = useToast()

  // Fetch perimeters from Firestore
  useEffect(() => {
    const fetchPerimeters = async () => {
      try {
        const perimeterCollection = collection(db, "perimeters")
        const perimeterSnapshot = await getDocs(perimeterCollection)
        const perimeterList = perimeterSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Perimeter[]
        setPerimeters(perimeterList)
      } catch (error) {
        console.error("Error fetching perimeters:", error)
        toast({
          title: "Error",
          description: "Failed to load location perimeters.",
          variant: "destructive",
        })
      }
    }

    fetchPerimeters()
  }, [toast])

  const handleAddPerimeter = async () => {
    if (!newPerimeter.name || !newPerimeter.latitude || !newPerimeter.longitude || !newPerimeter.radius) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const perimeterToAdd = {
        name: newPerimeter.name,
        latitude: Number.parseFloat(newPerimeter.latitude),
        longitude: Number.parseFloat(newPerimeter.longitude),
        radius: Number.parseFloat(newPerimeter.radius),
      }

      // Add to Firestore
      const docRef = await addDoc(collection(db, "perimeters"), perimeterToAdd)

      // Update local state
      setPerimeters([...perimeters, { id: docRef.id, ...perimeterToAdd }])

      setNewPerimeter({
        name: "",
        latitude: "",
        longitude: "",
        radius: "",
      })

      setIsAdding(false)

      toast({
        title: "Success",
        description: "Perimeter added successfully.",
      })
    } catch (error) {
      console.error("Error adding perimeter:", error)
      toast({
        title: "Error",
        description: "Failed to add perimeter.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePerimeter = async (id: string) => {
    setIsLoading(true)

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "perimeters", id))

      // Update local state
      setPerimeters(perimeters.filter((perimeter) => perimeter.id !== id))

      toast({
        title: "Success",
        description: "Perimeter deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting perimeter:", error)
      toast({
        title: "Error",
        description: "Failed to delete perimeter.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewPerimeter({
            ...newPerimeter,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          toast({
            title: "Error",
            description: "Failed to get current location.",
            variant: "destructive",
          })
        },
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">Location Perimeters</h3>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Perimeter
          </Button>
        )}
      </div>

      {isAdding && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Location Name</Label>
                <Input
                  id="name"
                  value={newPerimeter.name}
                  onChange={(e) => setNewPerimeter({ ...newPerimeter, name: e.target.value })}
                  placeholder="e.g., Main Office"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="radius">Radius (km)</Label>
                <Input
                  id="radius"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={newPerimeter.radius}
                  onChange={(e) => setNewPerimeter({ ...newPerimeter, radius: e.target.value })}
                  placeholder="e.g., 2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  value={newPerimeter.latitude}
                  onChange={(e) => setNewPerimeter({ ...newPerimeter, latitude: e.target.value })}
                  placeholder="e.g., 51.5074"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  value={newPerimeter.longitude}
                  onChange={(e) => setNewPerimeter({ ...newPerimeter, longitude: e.target.value })}
                  placeholder="e.g., -0.1278"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleGetCurrentLocation}>
                <MapPin className="mr-2 h-4 w-4" />
                Use Current Location
              </Button>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsAdding(false)} disabled={isLoading}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddPerimeter} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Perimeter
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Coordinates</TableHead>
            <TableHead>Radius</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {perimeters.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                No perimeters found. Add your first location perimeter.
              </TableCell>
            </TableRow>
          ) : (
            perimeters.map((perimeter) => (
              <TableRow key={perimeter.id}>
                <TableCell className="font-medium">{perimeter.name}</TableCell>
                <TableCell>
                  {perimeter.latitude.toFixed(6)}, {perimeter.longitude.toFixed(6)}
                </TableCell>
                <TableCell>{perimeter.radius} km</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePerimeter(perimeter.id)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}


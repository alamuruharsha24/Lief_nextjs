import { type NextRequest, NextResponse } from "next/server"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing record ID" }, { status: 400 })
    }

    const data = await request.json()

    // Update the document in Firestore
    const docRef = doc(db, "clockRecords", id)
    await updateDoc(docRef, data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating clock record:", error)
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 })
  }
}


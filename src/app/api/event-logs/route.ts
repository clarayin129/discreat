import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/app/lib/mongodb"
import { EventLog } from "@/types/eventLog"

export async function GET(req: NextRequest) {
    const client = await clientPromise
    const db = client.db("safehub")
    const logs = db.collection<EventLog>("event_logs")
  
    const url = new URL(req.url!)
    const reportId = url.searchParams.get("reportId")
  
    let query = {}
    if (reportId) {
      query = { reportId }
    }
  
    const all = await logs.find(query).sort({ timestamp: -1 }).toArray()
    return NextResponse.json(all)
  }

export async function POST(req: NextRequest) {
  const client = await clientPromise
  const db = client.db("safehub")
  const logs = db.collection<EventLog>("event_logs")

  const body = await req.json()
  const newEvent: EventLog = {
    ...body,
    timestamp: new Date().toISOString()
  }

  const result = await logs.insertOne(newEvent)
  return NextResponse.json({ insertedId: result.insertedId })
}

export async function PATCH(req: NextRequest) {
  const client = await clientPromise
  const db = client.db("safehub")
  const logs = db.collection<EventLog>("event_logs")

  const { id, ...updates } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing event log ID" }, { status: 400 })

  const result = await logs.updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  )

  return NextResponse.json({ modifiedCount: result.modifiedCount })
}

export async function DELETE(req: NextRequest) {
  const client = await clientPromise
  const db = client.db("safehub")
  const logs = db.collection<EventLog>("event_logs")

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing event log ID" }, { status: 400 })

  const result = await logs.deleteOne({ _id: new ObjectId(id) })
  return NextResponse.json({ deleted: result.deletedCount > 0, deletedId: id })
}

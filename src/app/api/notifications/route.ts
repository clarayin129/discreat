import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/app/lib/mongodb"
import { Notification } from "@/types/notification"

export async function POST(req: NextRequest) {
  const client = await clientPromise
  const db = client.db("safehub")
  const notifications = db.collection<Notification>("notifications")

  const body = await req.json()
  const newNotification: Notification = {
    ...body,
    responded: false,
    timestamp: new Date().toISOString()
  }

  const result = await notifications.insertOne(newNotification)
  return NextResponse.json({ insertedId: result.insertedId })
}

export async function GET(req: NextRequest) {
  const client = await clientPromise
  const db = client.db("safehub")
  const notifications = db.collection<Notification>("notifications")

  const url = new URL(req.url!)
  const reportId = url.searchParams.get("reportId")

  let query = {}
  if (reportId) {
    query = { reportId }
  }

  const all = await notifications.find(query).sort({ timestamp: -1 }).toArray()
  return NextResponse.json(all)
}

export async function PATCH(req: NextRequest) {
  const client = await clientPromise
  const db = client.db("safehub")
  const notifications = db.collection<Notification>("notifications")

  const { id, ...updates } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing notification ID" }, { status: 400 })

  const result = await notifications.updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  )

  return NextResponse.json({ modifiedCount: result.modifiedCount })
}

export async function DELETE(req: NextRequest) {
  const client = await clientPromise
  const db = client.db("safehub")
  const notifications = db.collection<Notification>("notifications")

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing notification ID" }, { status: 400 })

  const result = await notifications.deleteOne({ _id: new ObjectId(id) })
  return NextResponse.json({ deleted: result.deletedCount > 0, deletedId: id })
}

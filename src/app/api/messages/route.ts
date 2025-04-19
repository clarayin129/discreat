import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import clientPromise from "@/app/lib/mongodb"
import { Message } from "@/types/message"

export async function GET(req: NextRequest) {
  const client = await clientPromise
  const db = client.db("safehub")
  const messages = db.collection<Message>("messages")

  const reportId = req.nextUrl.searchParams.get("reportId")
  if (!reportId) return NextResponse.json({ error: "Missing reportId" }, { status: 400 })

  const all = await messages
    .find({ reportId })
    .sort({ timestamp: 1 })
    .toArray()

  return NextResponse.json(all)
}

export async function POST(req: NextRequest) {
  const client = await clientPromise
  const db = client.db("safehub")
  const messages = db.collection<Message>("messages")

  const body = await req.json()
  const newMsg: Message = {
    reportId: body.reportId,
    sender: body.sender,
    text: body.text,
    timestamp: new Date().toISOString()
  }

  const result = await messages.insertOne(newMsg)
  return NextResponse.json({ insertedId: result.insertedId })
}

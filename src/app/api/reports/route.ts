import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/app/lib/mongodb"
import { Report } from "@/types/report"

export async function GET(req: NextRequest) {
  const client = await clientPromise
  const db = client.db("safehub")
  const reports = db.collection<Report>("reports")

  const { searchParams } = new URL(req.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  if (lat && lng) {
    const nearby = await reports
      .find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: 1000 // 1 km
          }
        }
      })
      .toArray()

    return NextResponse.json(nearby)
  }

  const all = await reports.find().sort({ createdAt: -1 }).toArray()
  return NextResponse.json(all)
}

export async function POST(req: NextRequest) {
  const client = await clientPromise
  const db = client.db("safehub")
  const reports = db.collection<Report>("reports")

  const body = await req.json()
  const newReport: Report = {
    address: body.address,
    city: body.city,
    country: body.country,
    policeDepartment: body.policeDepartment,
    createdAt: new Date().toISOString(),
    status: "pending",
    location: body.location, // must include GeoJSON { type: "Point", coordinates: [lng, lat] }
    responseTime: undefined,
    resolutionTime: undefined
  }

  const result = await reports.insertOne(newReport)
  return NextResponse.json({ insertedId: result.insertedId })
}

export async function PATCH(req: NextRequest) {
  const client = await clientPromise
  const db = client.db("safehub")
  const reports = db.collection<Report>("reports")

  const { id, ...updates } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing report ID" }, { status: 400 })

  const result = await reports.updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  )

  return NextResponse.json({ modifiedCount: result.modifiedCount })
}

export async function DELETE(req: NextRequest) {
  const client = await clientPromise
  const db = client.db("safehub")
  const reports = db.collection<Report>("reports")

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing report ID" }, { status: 400 })

  const result = await reports.deleteOne({ _id: new ObjectId(id) })

  return NextResponse.json({
    deleted: result.deletedCount > 0,
    deletedId: id
  })
}
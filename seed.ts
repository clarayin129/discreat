import "dotenv/config"
import { MongoClient } from "mongodb"
import { Report } from "./src/types/report"
import { EventLog } from "./src/types/eventLog"
import { Notification } from "./src/types/notification"

const uri = process.env.MONGODB_URI!
const client = new MongoClient(uri)

async function seed() {
  try {
    await client.connect()
    const db = client.db("safehub")

    const reports = db.collection<Report>("reports")
    const eventLogs = db.collection<EventLog>("event_logs")
    const notifications = db.collection<Notification>("notifications")

    // Create 2dsphere index for geospatial queries
    await reports.createIndex({ location: "2dsphere" })

    await reports.deleteMany({})
    await eventLogs.deleteMany({})
    await notifications.deleteMany({})

    const now = new Date()

    const ucDavisCoords = [
      { lat: 38.5382, lng: -121.7617 },
      { lat: 38.5388, lng: -121.7621 },
      { lat: 38.5390, lng: -121.7630 },
      { lat: 38.5379, lng: -121.7600 },
      { lat: 38.5365, lng: -121.7580 }
    ]

    const capitolCoords = [
      { lat: 38.5767, lng: -121.4934 },
      { lat: 38.5770, lng: -121.4941 },
      { lat: 38.5759, lng: -121.4929 },
      { lat: 38.5761, lng: -121.4915 },
      { lat: 38.5755, lng: -121.4930 }
    ]

    const coords = [...ucDavisCoords, ...capitolCoords]

    const sampleReports: Report[] = coords.map((coord, i) => {
      const offset = i * 300000 // 5 min apart
      return {
        address: `${100 + i} Test St`,
        city: i < 5 ? "Davis" : "Sacramento",
        country: "USA",
        createdAt: new Date(now.getTime() + offset).toISOString(),
        status: ["pending", "in progress", "resolved"][i % 3] as Report["status"],
        policeDepartment: i < 5 ? "UC Davis PD" : "Sacramento PD",
        location: {
          type: "Point",
          coordinates: [coord.lng, coord.lat]
        },
        responseTime: i % 3 !== 0 ? 5 + i : undefined,
        resolutionTime: i % 3 === 2 ? 10 + i : undefined
      }
    })

    const inserted = await reports.insertMany(sampleReports)
    const ids = Object.values(inserted.insertedIds).map((id) => id.toString())

    const eventSamples: EventLog[] = ids.flatMap((id, i) => {
      const base = now.getTime() + i * 300000
      const coord = coords[i]
      const logs: EventLog[] = [
        {
          reportId: id,
          type: "help_requested",
          timestamp: new Date(base).toISOString(),
          note: "Initial request submitted",
          location: coord
        },
        {
          reportId: id,
          type: "responded",
          timestamp: new Date(base + 300000).toISOString(),
          responderId: `responder_${i}`,
          location: coord
        }
      ]

      if (i % 3 === 2) {
        logs.push({
          reportId: id,
          type: "resolved",
          timestamp: new Date(base + 600000).toISOString(),
          note: "Case closed",
          location: coord
        })
      }

      return logs
    })

    const notifSamples: Notification[] = ids.map((id, i) => ({
      reportId: id,
      message: i % 2 === 0 ? "Help is on the way 🚓" : "Are you safe?",
      type: i % 2 === 0 ? "help_on_the_way" : "check_in",
      responded: i % 2 === 0,
      timestamp: new Date(now.getTime() + i * 300000 + 120000).toISOString()
    }))

    await eventLogs.insertMany(eventSamples)
    await notifications.insertMany(notifSamples)

    console.log("✅ Seeded 10 reports around UC Davis and Sacramento with event logs and notifications")
  } catch (err) {
    console.error("❌ Seed error:", err)
  } finally {
    await client.close()
  }
}

seed()

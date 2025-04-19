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

    await reports.deleteMany({})
    await eventLogs.deleteMany({})
    await notifications.deleteMany({})

    const now = new Date()

    const sampleReports: Report[] = Array.from({ length: 10 }, (_, i) => {
      const offset = i * 300000 // 5 min apart
      return {
        address: `${100 + i} Test St`,
        city: ["Rivertown", "Hillcrest", "Oakridge"][i % 3],
        country: "USA",
        createdAt: new Date(now.getTime() + offset).toISOString(),
        status: ["pending", "in progress", "resolved"][i % 3] as Report["status"],
        policeDepartment: `${["Rivertown", "Hillcrest", "Oakridge"][i % 3]} PD`,
        responseTime: i % 3 !== 0 ? 5 + i : undefined,
        resolutionTime: i % 3 === 2 ? 10 + i : undefined
      }
    })

    const inserted = await reports.insertMany(sampleReports)
    const ids = Object.values(inserted.insertedIds).map((id) => id.toString())

    const eventSamples: EventLog[] = ids.flatMap((id, i) => {
      const base = now.getTime() + i * 300000
      const logs: EventLog[] = [
        {
          reportId: id,
          type: "help_requested",
          timestamp: new Date(base).toISOString(),
          note: "Initial request submitted"
        },
        {
          reportId: id,
          type: "responded",
          timestamp: new Date(base + 300000).toISOString(),
          responderId: `responder_${i}`
        }
      ]

      if (i % 3 === 2) {
        logs.push({
          reportId: id,
          type: "resolved",
          timestamp: new Date(base + 600000).toISOString(),
          note: "Case closed"
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

    console.log("✅ Seeded 10 reports with event logs and notifications")
  } catch (err) {
    console.error("❌ Seed error:", err)
  } finally {
    await client.close()
  }
}

seed()
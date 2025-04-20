import "dotenv/config"
import { MongoClient } from "mongodb"
import { Report } from "./src/types/report"
import { EventLog } from "./src/types/eventLog"
import { Notification } from "./src/types/notification"

const uri = process.env.MONGODB_URI!
const client = new MongoClient(uri)

function randomDateBetween(yearStart: number, yearEnd: number) {
  const start = new Date(`${yearStart}-01-01`).getTime()
  const end = new Date(`${yearEnd}-12-31`).getTime()
  return new Date(start + Math.random() * (end - start))
}

function jitter(coord: { lat: number; lng: number }) {
  const offsetLat = (Math.random() - 0.5) * 0.02
  const offsetLng = (Math.random() - 0.5) * 0.02
  return {
    lat: coord.lat + offsetLat,
    lng: coord.lng + offsetLng
  }
}

async function seed() {
  try {
    await client.connect()
    const db = client.db("safehub")

    const reports = db.collection<Report>("reports")
    const eventLogs = db.collection<EventLog>("event_logs")
    const notifications = db.collection<Notification>("notifications")

    await reports.createIndex({ location: "2dsphere" })
    await reports.deleteMany({})
    await eventLogs.deleteMany({})
    await notifications.deleteMany({})

    const coordGroups = [
      { city: "Davis", coords: [{ lat: 38.5382, lng: -121.7617 }], pd: "UC Davis PD", count: 20 },
      { city: "Sacramento", coords: [{ lat: 38.5767, lng: -121.4934 }], pd: "Sacramento PD", count: 15 },
      { city: "San Francisco", coords: [{ lat: 37.7749, lng: -122.4194 }], pd: "SFPD", count: 10 },
      { city: "San Jose", coords: [{ lat: 37.3382, lng: -121.8863 }], pd: "San Jose PD", count: 5 }
    ]

    const allReports: Report[] = []

    for (const group of coordGroups) {
      for (let i = 0; i < group.count; i++) {
        const baseCoord = group.coords[0]
        const coord = jitter(baseCoord)
        const createdAt = randomDateBetween(2023, 2025).toISOString()

        allReports.push({
          address: `${100 + i} ${group.city} St`,
          city: group.city,
          country: "USA",
          createdAt,
          status: ["pending", "in progress", "resolved"][i % 3] as Report["status"],
          policeDepartment: group.pd,
          location: { type: "Point", coordinates: [coord.lng, coord.lat] },
          responseTime: i % 3 !== 0 ? 5 + i : undefined,
          resolutionTime: i % 3 === 2 ? 10 + i : undefined
        })
      }
    }

    const inserted = await reports.insertMany(allReports)
    const ids = Object.values(inserted.insertedIds).map(id => id.toString())

    const now = new Date()

    const eventSamples: EventLog[] = ids.map((id, i) => {
      const report = allReports[i]
      const base = new Date(report.createdAt).getTime()
      const [baseLng, baseLat] = report.location.coordinates
      const randomOffset = () => (Math.random() - 0.5) * 0.004
      const trail = Array.from({ length: 4 }, () => ({
        lat: baseLat + randomOffset(),
        lng: baseLng + randomOffset()
      }))

      const logs: EventLog[] = [
        { reportId: id, type: "help_requested", timestamp: new Date(base).toISOString(), note: "Initial request submitted", location: trail[0] },
        { reportId: id, type: "responded", timestamp: new Date(base + 300000).toISOString(), responderId: `responder_${i}`, location: trail[1] },
        { reportId: id, type: "arrived", timestamp: new Date(base + 600000).toISOString(), note: "Arrived at the scene", location: trail[2] }
      ]

      if (i % 3 === 2) {
        logs.push({
          reportId: id,
          type: "resolved",
          timestamp: new Date(base + 900000).toISOString(),
          note: "Case closed",
          location: trail[3]
        })
      }

      return logs
    }).flat()

    const notifSamples: Notification[] = ids.map((id, i) => ({
      reportId: id,
      message: i % 2 === 0 ? "Help is on the way 🚓" : "Are you safe?",
      type: i % 2 === 0 ? "help_on_the_way" : "check_in",
      responded: i % 2 === 0,
      timestamp: new Date(now.getTime() + i * 300000 + 120000).toISOString()
    }))

    await eventLogs.insertMany(eventSamples)
    await notifications.insertMany(notifSamples)

    console.log("✅ Seeded 50 diverse reports across Davis, Sacramento, SF, and San Jose")
  } catch (err) {
    console.error("❌ Seed error:", err)
  } finally {
    await client.close()
  }
}

seed()


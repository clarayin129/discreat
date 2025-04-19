/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useGoogleMapsReady } from "@/hooks/useGoogleMapsReady"

export default function ReportDetails({ id }: { id: string }) {
  const router = useRouter()
  const googleReady = useGoogleMapsReady()
  const mapRef = useRef<HTMLDivElement>(null)

  const [report, setReport] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  // Load report + logs + notifications
  useEffect(() => {
    fetch(`/api/reports/${id}`).then(res => res.json()).then(setReport)
    fetch(`/api/event-logs?reportId=${id}`).then(res => res.json()).then(setLogs)
    fetch(`/api/notifications?reportId=${id}`).then(res => res.json()).then(setNotifications)
  }, [id])

  // Render map when ready
  useEffect(() => {
    if (!googleReady || logs.length === 0) return
  
    const timeout = setTimeout(() => {
      const container = mapRef.current
      if (!container || container.offsetHeight === 0) {
        console.warn("❌ mapRef not visible yet")
        return
      }
  
      const trailCoords = logs
        .filter(log => log.location)
        .map(log => ({
          lat: log.location.lat,
          lng: log.location.lng
        }))
  
      if (!trailCoords.length) return
  
      const map = new google.maps.Map(container, {
        center: trailCoords[0],
        zoom: 14,
      })
  
      new google.maps.Polyline({
        path: trailCoords,
        geodesic: true,
        strokeColor: "#4285F4",
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map,
      })
  
      trailCoords.forEach((pos, i) => {
        new google.maps.Marker({
          position: pos,
          map,
          label: `${i + 1}`,
        })
      })
    }, 100)
  
    return () => clearTimeout(timeout)
  }, [googleReady, logs])  

  if (!report) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300"
        >
          ← Back to Dashboard
        </button>
        <button
          onClick={() => router.push(`/chat/${report._id}`)}
          className="px-4 py-2 bg-blue-100 text-sm rounded hover:bg-blue-200"
        >
          💬 Open Chat
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Report Details</h1>
      <p><strong>ID:</strong> {report._id}</p>
      <p><strong>Address:</strong> {report.address}</p>
      <p><strong>City:</strong> {report.city}</p>
      <p><strong>Country:</strong> {report.country}</p>
      <p><strong>Status:</strong> {report.status}</p>
      <p><strong>Police Department:</strong> {report.policeDepartment}</p>
      <p><strong>Created:</strong> {new Date(report.createdAt).toLocaleString()}</p>
      {report.responseTime && <p><strong>Response Time:</strong> {report.responseTime} min</p>}
      {report.resolutionTime && <p><strong>Resolution Time:</strong> {report.resolutionTime} min</p>}

      <h2 className="text-xl font-semibold mt-8 mb-2">Event Logs</h2>
      <table className="w-full border text-sm mb-6">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Type</th>
            <th className="p-2">Time</th>
            <th className="p-2">Location (latitude, longitude)</th>
            <th className="p-2">Responder</th>
            <th className="p-2">Note</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id} className="border-t">
              <td className="p-2">{log.type}</td>
              <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
              <td className="p-2">{log.location.lat.toFixed(4)}, {log.location.lng.toFixed(4)}</td>
              <td className="p-2">{log.responderId || "—"}</td>
              <td className="p-2">{log.note || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {logs.some(log => log.location) && (
        <>
          <h2 className="text-xl font-semibold mb-2">Location Trail</h2>
          <div ref={mapRef} className="w-full h-[400px] rounded border mb-10" />
        </>
      )}

      <h2 className="text-xl font-semibold mb-2">Notifications</h2>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Message</th>
            <th className="p-2">Type</th>
            <th className="p-2">Time</th>
            <th className="p-2">Responded</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map(note => (
            <tr key={note._id} className="border-t">
              <td className="p-2">{note.message}</td>
              <td className="p-2">{note.type}</td>
              <td className="p-2">{new Date(note.timestamp).toLocaleString()}</td>
              <td className="p-2">{note.responded ? "✅" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

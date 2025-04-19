/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ReportDetails({ id }: { id: string }) {
  const router = useRouter()
  const [report, setReport] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    fetch(`/api/reports/${id}`)
      .then(res => res.json())
      .then(setReport)

    fetch(`/api/event-logs?reportId=${id}`)
      .then(res => res.json())
      .then(setLogs)

    fetch(`/api/notifications?reportId=${id}`)
      .then(res => res.json())
      .then(setNotifications)
  }, [id])

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

      <div className="mb-6">
        <p><strong>Report ID:</strong> {report._id}</p>
        <p><strong>Address:</strong> {report.address}</p>
        <p><strong>City:</strong> {report.city}</p>
        <p><strong>Country:</strong> {report.country}</p>
        <p><strong>Police Department:</strong> {report.policeDepartment}</p>
        <p><strong>Status:</strong> {report.status}</p>
        <p><strong>Created At:</strong> {new Date(report.createdAt).toLocaleString()}</p>
        {report.responseTime !== undefined && (
          <p><strong>Response Time:</strong> {report.responseTime} min</p>
        )}
        {report.resolutionTime !== undefined && (
          <p><strong>Resolution Time:</strong> {report.resolutionTime} min</p>
        )}
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-2">Event Logs</h2>
      <table className="w-full border mb-8">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Type</th>
            <th className="p-2">Timestamp</th>
            <th className="p-2">Responder</th>
            <th className="p-2">Note</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id} className="border-t">
              <td className="p-2">{log.type}</td>
              <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
              <td className="p-2">{log.responderId || "—"}</td>
              <td className="p-2">{log.note || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-semibold mb-2">Notifications</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Message</th>
            <th className="p-2">Type</th>
            <th className="p-2">Timestamp</th>
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


/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"

export default function ReportDetails({ id }: { id: string }) {
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
      <h1 className="text-2xl font-bold mb-4">Report Details</h1>
      <p><strong>Caller:</strong> {report.callerId}</p>
      <p><strong>Status:</strong> {report.status}</p>
      <p><strong>Created:</strong> {new Date(report.createdAt).toLocaleString()}</p>

      <h2 className="text-xl font-semibold mt-6">Event Logs</h2>
      <ul className="list-disc pl-6">
        {logs.map(log => (
          <li key={log._id}>
            <strong>{log.type}</strong> @ {new Date(log.timestamp).toLocaleString()}
            {log.note && <> {log.note}</>}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-6">Notifications</h2>
      <ul className="list-disc pl-6">
        {notifications.map(note => (
          <li key={note._id}>
            {note.message} <em>{note.type}</em> {note.responded ? "✅" : "❌"}
          </li>
        ))}
      </ul>
    </div>
  )
}


/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const router = useRouter()
  const [reports, setReports] = useState([])

  useEffect(() => {
    fetch("/api/reports")
      .then(res => res.json())
      .then(data => setReports(data))
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Reports</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Caller</th>
            <th className="p-2">Status</th>
            <th className="p-2">Created</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r: any) => (
            <tr key={r._id} className="border-t">
              <td className="p-2">{r.callerId}</td>
              <td className="p-2">{r.status}</td>
              <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
              <td className="p-2">
                <button
                    onClick={() => router.push(`/dashboard/${r._id}`)}
                    className="text-blue-500 underline"
                >
                View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

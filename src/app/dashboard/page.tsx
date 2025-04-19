"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const router = useRouter()
  const [reports, setReports] = useState([])
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")

  const fetchAllReports = () => {
    fetch("/api/reports")
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setReports(sorted)
      })
  }

  useEffect(() => {
    fetchAllReports()
  }, [])

  const fetchNearbyReports = () => {
    if (!lat || !lng) return
    fetch(`/api/reports?lat=${lat}&lng=${lng}`)
      .then(res => res.json())
      .then(setReports)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Reports</h1>

      <div className="mb-6 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium">Latitude</label>
          <input
            type="number"
            value={lat}
            onChange={e => setLat(e.target.value)}
            className="border p-2 rounded w-40"
            placeholder="e.g. 37.7749"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Longitude</label>
          <input
            type="number"
            value={lng}
            onChange={e => setLng(e.target.value)}
            className="border p-2 rounded w-40"
            placeholder="e.g. -122.4194"
          />
        </div>
        <button
          onClick={fetchNearbyReports}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Find Nearby (1km)
        </button>
        <button
          onClick={fetchAllReports}
          className="px-4 py-2 bg-gray-300 text-sm rounded hover:bg-gray-400"
        >
          Reset View
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Id</th>
            <th className="p-2">Police Department</th>
            <th className="p-2">Status</th>
            <th className="p-2">Requested At</th>
            <th className="p-2">Actions</th>
            <th className="p-2">Live Chat</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r: any) => (
            <tr key={r._id} className="border-t">
              <td className="p-2">{r._id}</td>
              <td className="p-2">{r.policeDepartment}</td>
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
              <td className="p-2">
                <button
                  onClick={() => router.push(`/chat/${r._id}`)}
                  className="text-green-500 underline"
                >
                  Open Chat
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


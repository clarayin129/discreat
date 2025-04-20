/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ReportHeatMap from "../../components/ReportHeatMap"

export default function DashboardPage() {
  const router = useRouter()
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/reports")
      .then(res => res.json())
      .then(data => setReports(data))
  }, [])

  const recentReports = reports.slice(0, 3)

  return (
    <div className="p-6 max-w-7xl mx-auto my-auto">
      <h1 className="text-3xl font-bold mb-6">Discreat Dashboard</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-[300px]">
          <div className="bg-white shadow rounded p-4 mb-6 border">
            <h2 className="text-xl font-semibold">Total Reports</h2>
            <p className="text-4xl mt-2 text-blue-600 font-bold">{reports.length}</p>
          </div>

          <div className="bg-white shadow rounded p-4 border mb-6">
            <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
            {recentReports.map((r) => (
              <div
                key={r._id}
                className="border-b py-2 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{r.policeDepartment}</p>
                  <p className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleString()}</p>
                  <p className="text-sm text-gray-800">Status: {r.status}</p>
                </div>
                <button
                  onClick={() => router.push(`/reports/${r._id}`)}
                  className="text-blue-600 underline text-sm"
                >
                  View
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push("/reports")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            View All Reports →
          </button>
          <button
            onClick={() => router.push("/historical")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2"
            >
            View Historical Data →
          </button>
        </div>

        <div className="flex-1 min-w-[400px]">
          <h2 className="text-xl font-semibold mb-4">Reports by City</h2>
          <div className="h-[400px] bg-white border rounded shadow">
            <ReportHeatMap />
          </div>
        </div>
      </div>
    </div>
  )
}


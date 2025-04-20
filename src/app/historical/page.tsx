"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ResponsiveLine } from "@nivo/line"
import { ResponsiveBar } from "@nivo/bar"

export default function HistoricalCharts() {
  const [reports, setReports] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch("/api/reports")
      .then(res => res.json())
      .then(setReports)
  }, [])

  const lineData = () => {
    const counts: Record<string, number> = {}
    reports.forEach((r) => {
      const year = new Date(r.createdAt).getFullYear().toString()
      counts[year] = (counts[year] || 0) + 1
    })
    return [
      {
        id: "Reports",
        data: Object.entries(counts).map(([year, count]) => ({
          x: year,
          y: count
        })).sort((a, b) => a.x.localeCompare(b.x))
      }
    ]
  }

  const barData = () => {
    const cities: Record<string, { total: number; count: number }> = {}
    reports.forEach((r) => {
      if (typeof r.responseTime === "number") {
        const city = r.city || "Unknown"
        if (!cities[city]) cities[city] = { total: 0, count: 0 }
        cities[city].total += r.responseTime
        cities[city].count += 1
      }
    })
    return Object.entries(cities).map(([city, { total, count }]) => ({
      city,
      avgResponse: Number((total / count).toFixed(2))
    }))
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300"
        >
          ← Back to Dashboard
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6">Historical Charts</h1>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Cases Over the Years</h2>
        <div className="h-[400px] bg-white border rounded shadow p-4">
          <ResponsiveLine
            data={lineData()}
            margin={{ top: 50, right: 30, bottom: 60, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 0 }}
            axisBottom={{ legend: "Year", legendOffset: 40, legendPosition: "middle" }}
            axisLeft={{ legend: "Reports", legendOffset: -50, legendPosition: "middle" }}
            colors={{ scheme: "category10" }}
            pointSize={8}
            pointBorderWidth={2}
            useMesh={true}
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Average Response Time by City</h2>
        <div className="h-[400px] bg-white border rounded shadow p-4">
          <ResponsiveBar
            data={barData()}
            keys={["avgResponse"]}
            indexBy="city"
            margin={{ top: 50, right: 30, bottom: 60, left: 60 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={{ scheme: "blues" }}
            axisBottom={{ legend: "City", legendOffset: 40, legendPosition: "middle" }}
            axisLeft={{ legend: "Avg Response Time (min)", legendOffset: -50, legendPosition: "middle" }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          />
        </div>
      </div>
    </div>
  )
}


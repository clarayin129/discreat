/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { ResponsiveHeatMap } from "@nivo/heatmap"

interface HeatmapDatum {
  id: string
  data: { x: string; y: number }[]
}

export default function ReportHeatMap() {
  const [data, setData] = useState<HeatmapDatum[]>([])

  useEffect(() => {
    fetch("/api/reports")
      .then(res => res.json())
      .then(reports => {
        const cityCounts: Record<string, number> = {}
  
        reports.forEach((r: any) => {
          const city = r.city || "Unknown"
          cityCounts[city] = (cityCounts[city] || 0) + 1
        })
  
        const structured: HeatmapDatum[] = Object.entries(cityCounts)
          .map(([city, count]) => ({
            id: city,
            data: [{ x: "Reports", y: count }]
          }))
          .sort((a, b) => b.data[0].y - a.data[0].y) // 🔽 Sort by count descending
  
        setData(structured)
      })
  }, [])

  return (
    <div style={{ height: 400 }}>
      <ResponsiveHeatMap
        data={data}
        valueFormat=".0f"
        margin={{ top: 40, right: 40, bottom: 60, left: 110 }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          legend: "Category",
          legendPosition: "middle",
          legendOffset: -36
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          legend: "City",
          legendPosition: "middle",
          legendOffset: -80
        }}
        colors={{ type: "quantize", scheme: "yellow_orange_red" }}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.3]] }}
        labelTextColor={{ from: "color", modifiers: [["darker", 1.5]] }}
      />
    </div>
  )
}





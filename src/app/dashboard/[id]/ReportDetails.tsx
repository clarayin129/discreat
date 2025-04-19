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
    fetch(`/api/reports/${id}`).then(res => res.json()).then(setReport)
    fetch(`/api/event-logs?reportId=${id}`).then(res => res.json()).then(setLogs)
    fetch(`/api/notifications?reportId=${id}`).then(res => res.json()).then(setNotifications)
  }, [id])

  useEffect(() => {
    if (typeof window !== "undefined" && logs.length && (window as any).google) {
      const trailCoords = logs
        .filter(log => log.location)
        .map(log => ({
          lat: log.location.lat,
          lng: log.location.lng
        }))

      if (trailCoords.length) {
        const map = new google.maps.Map(document.getElementById("log-map") as HTMLElement, {
          center: trailCoords[0],
          zoom: 14
        })

        new google.maps.Polyline({
          path: trailCoords,
          geodesic: true,
          strokeColor: "#4285F4",
          strokeOpacity: 0.8,
          strokeWeight: 4,
          map
        })

        trailCoords.forEach((pos, i) => {
          new google.maps.Marker({
            position: pos,
            map,
            label: `${i + 1}`
          })
        })
      }
    }
  }, [logs])
}
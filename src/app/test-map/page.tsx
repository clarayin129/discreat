/// <reference types="google.maps" />
"use client"

import { useEffect, useRef, useState } from "react"

export default function TestMap() {
  const inputRef = useRef<HTMLInputElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!inputRef.current || !(window as any).google) return

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current)
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace()
      const lat = place.geometry?.location?.lat()
      const lng = place.geometry?.location?.lng()

      if (lat == null || lng == null) {
        console.warn("⚠️ Missing geometry coordinates.")
        return
      }

      setLocation({ lat, lng })
    })
  }, [])

  useEffect(() => {
    if (!mapRef.current || !location) return

    const map = new google.maps.Map(mapRef.current, {
      center: location,
      zoom: 14
    })

    new google.maps.Marker({
      position: location,
      map,
      label: "📍"
    })
  }, [location])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Map with Autocomplete</h1>

      <input
        ref={inputRef}
        type="text"
        placeholder="Search a place..."
        className="w-full p-2 border rounded mb-4"
      />

      <div ref={mapRef} className="w-full h-[400px] border rounded" />
    </div>
  )
}




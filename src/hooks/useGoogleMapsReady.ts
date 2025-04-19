import { useEffect, useState } from "react"

export function useGoogleMapsReady() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const interval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setReady(true)
          clearInterval(interval)
        }
      }, 200)

      return () => clearInterval(interval)
    }
  }, [])

  return ready
}

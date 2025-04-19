/// <reference types="google.maps" />
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGoogleMapsReady } from "@/hooks/useGoogleMapsReady";

export default function reports() {
  const router = useRouter();
  const googleReady = useGoogleMapsReady();
  const [allReports, setAllReports] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number }>({
    lat: 38.5449,
    lng: -121.7405,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const fetchNearbyReports = (lat: number, lng: number) => {
    fetch(`/api/reports?lat=${lat}&lng=${lng}`)
      .then((res) => res.json())
      .then(setReports);
  };

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then(setAllReports);
  }, []);

  useEffect(() => {
    if (location) {
      fetchNearbyReports(location.lat, location.lng);
    }

    if (!googleReady || !inputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();

      if (lat == null || lng == null) {
        console.warn("Missing geometry.");
        return;
      }

      setLocation({ lat, lng });
      fetchNearbyReports(lat, lng);
    });
  }, [googleReady]);

  useEffect(() => {
    console.log("🎯 Effect dependencies:", {
      googleReady,
      location,
      mapRefReady: !!mapRef.current,
      reportsCount: reports.length,
    });

    if (!mapRef.current || mapRef.current.offsetHeight === 0) {
      console.warn("❌ mapRef has no visible height, delaying map render");
      return;
    }

    if (!googleReady || !location || !mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: location,
      zoom: 14,
    });

    console.log("✅ Creating map with location:", location);
    console.log("🧭 mapRef:", mapRef.current);

    new google.maps.Marker({
      position: location,
      map,
      label: "📍",
    });

    reports.forEach((r, i) => {
      const [lng, lat] = r.location?.coordinates || [];
      if (lat && lng) {
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map,
          label: `${i + 1}`,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="font-size: 14px;">
              <strong>ID:</strong> ${r._id}<br/>
              <strong>Status:</strong> ${r.status}<br/>
              <strong>Created:</strong> ${new Date(
                r.createdAt
              ).toLocaleString()}
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      }
    });
  }, [googleReady, location, reports]);

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300"
        >
          ← Back to Dashboard
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-4">All Reports</h1>

      <table className="w-full border text-sm mb-10">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">ID</th>
            <th className="p-2">Status</th>
            <th className="p-2">Police Dept</th>
            <th className="p-2">Created</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {allReports.map((r: any) => (
            <tr key={r._id} className="border-t">
              <td className="p-2">{r._id}</td>
              <td className="p-2">{r.status}</td>
              <td className="p-2">{r.policeDepartment}</td>
              <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => router.push(`/reports/${r._id}`)}
                  className="text-blue-500 underline"
                >
                  View
                </button>
                <button
                  onClick={() => router.push(`/chat/${r._id}`)}
                  className="text-green-500 underline"
                >
                  Chat
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-bold mb-4">Search Reports by Place</h2>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search a place..."
        className="w-full p-2 border rounded mb-4"
      />

      <div ref={mapRef} className="w-full h-[400px] border rounded mb-6" />

      <h2 className="text-xl font-semibold mb-2">
        Nearby Reports (within 3 km)
      </h2>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">ID</th>
            <th className="p-2">Status</th>
            <th className="p-2">Police Dept</th>
            <th className="p-2">Created</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r: any) => (
            <tr key={r._id} className="border-t">
              <td className="p-2">{r._id}</td>
              <td className="p-2">{r.status}</td>
              <td className="p-2">{r.policeDepartment}</td>
              <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => router.push(`/reports/${r._id}`)}
                  className="text-blue-500 underline"
                >
                  View
                </button>
                <button
                  onClick={() => router.push(`/chat/${r._id}`)}
                  className="text-green-500 underline"
                >
                  Chat
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
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
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setReports(sorted);
      });
  };

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAllReports(sorted);
      });
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
    if (!googleReady || !location || !mapRef.current || mapRef.current.offsetHeight === 0) return;

    const map = new google.maps.Map(mapRef.current, {
      center: location,
      zoom: 14,
    });

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
            <div style="font-size: 14px; color: black;">
              <strong>ID:</strong> ${r._id}<br/>
              <strong>Status:</strong> ${r.status}<br/>
              <strong>Created:</strong> ${new Date(r.createdAt).toLocaleString()}
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      }
    });
  }, [googleReady, location, reports]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-red-600 text-white";
      case "in progress":
        return "bg-yellow-600 text-white";
      case "resolved":
        return "bg-green-600 text-white";
      default:
        return "bg-gray-500 text-gray-100";
    }
  };

  return (
    <div className="p-6 text-white min-h-screen">
      {/* Back button */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-gray-800 text-sm rounded-lg hover:bg-gray-700"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* All Reports */}
      <h1 className="text-2xl font-bold mb-4">All Reports</h1>
      <div className="max-h-[400px] overflow-y-auto rounded-lg mb-10">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#1f2937] z-10">
            <tr className="text-left">
              <th className="p-4">ID</th>
              <th className="p-2">Status</th>
              <th className="p-2">Police Dept</th>
              <th className="p-2">Created</th>
              <th className="p-2">Response Time</th>
              <th className="p-2">Resolution Time</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allReports.map((r) => (
              <tr key={r._id} className="border-t border-gray-700 bg-[#1a1a1a]">
                <td className="p-4">{r._id}</td>
                <td className="p-2">
                  <span className={`px-2 py-2 rounded-lg text-xs font-medium ${getStatusColor(r.status)}`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-2">{r.policeDepartment}</td>
                <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="p-2">
                  {typeof r.responseTime === "number" ? `${r.responseTime} min` : "—"}
                </td>
                <td className="p-2">
                  {typeof r.resolutionTime === "number" ? `${r.resolutionTime} min` : "—"}
                </td>
                <td className="p-2 space-x-2">
                  <button onClick={() => router.push(`/reports/${r._id}`)} className="text-white bg-orange-600 rounded-lg px-4 py-2 hover:bg-orange-500">
                    View
                  </button>
                  <button onClick={() => router.push(`/chat/${r._id}`)} className="text-white bg-yellow-600 rounded-lg px-4 py-2 hover:bg-yellow-500">
                    Chat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Location Search */}
      <h2 className="text-xl font-bold mb-4">Search Reports by Place</h2>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search a place..."
        className="w-full p-2 border border-gray-700 rounded-lg mb-4 bg-gray-800 text-white"
      />

      {/* Map */}
      <div ref={mapRef} className="w-full h-[550px] border border-gray-700 rounded-lg mb-6" />

      {/* Nearby Reports */}
      <h2 className="text-xl font-semibold mb-2">Nearby Reports (within 3 km)</h2>
      <div className="max-h-[400px] overflow-y-auto rounded-lg">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#1f2937] z-10">
            <tr className="text-left">
              <th className="p-4">ID</th>
              <th className="p-2">Status</th>
              <th className="p-2">Police Dept</th>
              <th className="p-2">Created</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r._id} className="border-t border-gray-700 bg-[#1a1a1a]">
                <td className="p-4">{r._id}</td>
                <td className="p-2">
                  <span className={`px-2 py-2 rounded-lg text-xs font-medium ${getStatusColor(r.status)}`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-2">{r.policeDepartment}</td>
                <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="p-2 space-x-2">
                  <button onClick={() => router.push(`/reports/${r._id}`)} className="text-white bg-orange-600 rounded-lg px-4 py-2 hover:bg-orange-500">
                    View
                  </button>
                  <button onClick={() => router.push(`/chat/${r._id}`)} className="text-white bg-yellow-600 rounded-lg px-4 py-2 hover:bg-yellow-500">
                    Chat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


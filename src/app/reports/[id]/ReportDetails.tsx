/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGoogleMapsReady } from "@/hooks/useGoogleMapsReady";

export default function ReportDetails({ id }: { id: string }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-red-400 text-white";
      case "in progress":
        return "bg-amber-400 text-white";
      case "resolved":
        return "bg-green-400 text-white";
      default:
        return "bg-gray-300 text-gray-700";
    }
  };

  const getAppColor = (app: string) => {
    switch (app.toLowerCase()) {
      case "doordash":
        return "bg-red-300 text-red-900";
      case "ubereats":
        return "bg-green-300 text-green-900";
      case "grubhub":
        return "bg-purple-300 text-purple-900";
      case "postmates":
        return "bg-yellow-300 text-yellow-900";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const router = useRouter();
  const googleReady = useGoogleMapsReady();
  const mapRef = useRef<HTMLDivElement>(null);

  const [report, setReport] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/reports/${id}`).then(res => res.json()).then(setReport);
    fetch(`/api/event-logs?reportId=${id}`).then(res => res.json()).then(setLogs);
    fetch(`/api/notifications?reportId=${id}`).then(res => res.json()).then(setNotifications);
  }, [id]);

  useEffect(() => {
    if (!googleReady || logs.length === 0) return;

    const timeout = setTimeout(() => {
      const container = mapRef.current;
      if (!container || container.offsetHeight === 0) return;

      const trailCoords = logs
        .filter((log) => log.location)
        .map((log) => ({
          lat: log.location.lat,
          lng: log.location.lng,
        }));

      if (!trailCoords.length) return;

      const map = new google.maps.Map(container, {
        center: trailCoords[0],
        zoom: 14,
      });

      new google.maps.Polyline({
        path: trailCoords,
        geodesic: true,
        strokeColor: "#4285F4",
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map,
      });

      trailCoords.forEach((pos, i) => {
        new google.maps.Marker({
          position: pos,
          map,
          label: `${i + 1}`,
        });
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [googleReady, logs]);

  if (!report) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6">
        <button onClick={() => router.push("/reports")} className="px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300">
          ← Back to reports
        </button>
        <button onClick={() => router.push(`/chat/${report._id}`)} className="px-4 py-2 bg-orange-200 text-sm rounded hover:bg-orange-300">
          💬 Open Chat
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Report Details</h1>

      <div className="my-3 flex gap-3 flex-wrap">
        <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(report.status)}`}>
          {report.status}
        </span>
        <span className={`px-2 py-1 rounded text-sm font-medium ${getAppColor(report.deliveryApp)}`}>
          {report.deliveryApp}
        </span>
      </div>

      <div className="space-y-1 text-sm mb-6">
        <p><strong>ID:</strong> {report._id}</p>
        <p><strong>Address:</strong> {report.address}</p>
        <p><strong>City:</strong> {report.city}</p>
        <p><strong>Country:</strong> {report.country}</p>
        <p><strong>Police Department:</strong> {report.policeDepartment}</p>
        <p><strong>Created:</strong> {new Date(report.createdAt).toLocaleString()}</p>
        {report.responseTime && <p><strong>Response Time:</strong> {report.responseTime} min</p>}
        {report.resolutionTime && <p><strong>Resolution Time:</strong> {report.resolutionTime} min</p>}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Event Logs Table */}
        <div className="w-full md:w-1/2">
          <h2 className="text-xl font-semibold mb-2">Event Logs</h2>
          <div className="max-h-[400px] overflow-y-auto border rounded">
            <table className="w-full text-sm table-fixed">
              <thead className="sticky top-0 bg-gray-100 z-10">
                <tr>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Time</th>
                  <th className="p-2 text-left">Location</th>
                  <th className="p-2 text-left">Responder</th>
                  <th className="p-2 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-t">
                    <td className="p-2">{log.type}</td>
                    <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-2">{log.location?.lat?.toFixed(4)}, {log.location?.lng?.toFixed(4)}</td>
                    <td className="p-2">{log.responderId || "—"}</td>
                    <td className="p-2">{log.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications Table */}
        <div className="w-full md:w-1/2">
          <h2 className="text-xl font-semibold mb-2">Notifications</h2>
          <div className="max-h-[400px] overflow-y-auto border rounded">
            <table className="w-full text-sm table-fixed">
              <thead className="sticky top-0 bg-gray-100 z-10">
                <tr>
                  <th className="p-2 text-left">Message</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Time</th>
                  <th className="p-2 text-left">Responded</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((note) => (
                  <tr key={note._id} className="border-t">
                    <td className="p-2">{note.message}</td>
                    <td className="p-2">{note.type}</td>
                    <td className="p-2">{new Date(note.timestamp).toLocaleString()}</td>
                    <td className="p-2">{note.responded ? "✅" : "❌"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {logs.some((log) => log.location) && (
        <>
          <h2 className="text-xl font-semibold mt-8 mb-2">Location Trail</h2>
          <div ref={mapRef} className="w-full h-[550px] rounded border mb-10" />
        </>
      )}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReportHeatMap from "../../components/ReportHeatMap";

export default function DashboardPage() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => setReports(data));
  }, []);

  const recentReports = reports.slice(0, 3);

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
    <div className="p-6 max-w-7xl mx-auto text-white min-h-screen">
      {/* Logo and Title */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Discreat Logo"
            width={50}
            height={50}
            className="rounded-md"
          />
          <h1 className="text-3xl font-bold">
            Discr
            <span className="font-extrabold text-yellow-400">eat</span>
          </h1>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1 min-w-[300px]">
          {/* Total Reports Box */}
          <div className="bg-[#1a1a1a] shadow rounded-lg p-4 mb-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">Total Reports</h2>
            <p className="text-4xl mt-2 font-bold text-yellow-400">
              {reports.length}
            </p>
          </div>

          {/* Recent Reports Box */}
          <div className="bg-[#1a1a1a] shadow rounded-lg p-4 border mb-6 border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Reports</h2>
            {recentReports.map((r) => (
              <div
                key={r._id}
                className="border-b border-gray-700 py-2 flex justify-between items-center"
              >
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{r.policeDepartment}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                  <p className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(
                        r.status
                      )}`}
                    >
                      {r.status}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/reports/${r._id}`)}
                  className="text-white bg-orange-600 rounded-lg px-2 py-1 hover:bg-orange-500"
                >
                  View
                </button>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <button
            onClick={() => router.push("/reports")}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-500"
          >
            View All Reports →
          </button>
          <button
            onClick={() => router.push("/historical")}
            className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 ml-2"
          >
            View Historical Data →
          </button>
        </div>

        {/* Right Column - Map */}
        <div className="flex-1 min-w-[400px]">
          <h2 className="text-xl font-semibold mb-4 text-white">Reports by City</h2>
          <div className="h-[400px] bg-[#1a1a1a] border border-gray-700 rounded-lg shadow">
            <ReportHeatMap />
          </div>
        </div>
      </div>
    </div>
  );
}
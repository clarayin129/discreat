/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";

export default function HistoricalCharts() {
  const [reports, setReports] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then(setReports);
  }, []);

  const lineData = () => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      const year = new Date(r.createdAt).getFullYear().toString();
      counts[year] = (counts[year] || 0) + 1;
    });
    return [
      {
        id: "Reports",
        data: Object.entries(counts)
          .map(([year, count]) => ({
            x: year,
            y: count,
          }))
          .sort((a, b) => a.x.localeCompare(b.x)),
      },
    ];
  };

  const barData = () => {
    const cities: Record<string, { total: number; count: number }> = {};
    reports.forEach((r) => {
      if (typeof r.responseTime === "number") {
        const city = r.city || "Unknown";
        if (!cities[city]) cities[city] = { total: 0, count: 0 };
        cities[city].total += r.responseTime;
        cities[city].count += 1;
      }
    });
    return Object.entries(cities).map(([city, { total, count }]) => ({
      city,
      avgResponse: Number((total / count).toFixed(2)),
    }));
  };

  const pieData = () => {
    const apps: Record<string, number> = {};
    reports.forEach((r) => {
      const app = r.deliveryApp || "Unknown";
      apps[app] = (apps[app] || 0) + 1;
    });

    const total = Object.values(apps).reduce((sum, val) => sum + val, 0);

    return Object.entries(apps).map(([id, value]) => ({
      id,
      label: `${id} (${((value / total) * 100).toFixed(1)}%)`,
      value,
      raw: value,
    }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-white] min-h-screen">
      {/* Back Button */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-gray-800 text-sm rounded-lg hover:bg-gray-700"
        >
          ← Back to Dashboard
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6">Historical Charts</h1>

      {/* Line Chart */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Cases Over the Years</h2>
        <div className="h-[400px] bg-[#1a1a1a] border border-gray-700 rounded-lg shadow p-4">
          <ResponsiveLine
            data={lineData()}
            margin={{ top: 50, right: 30, bottom: 60, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 0 }}
            axisBottom={{
              legend: "Year",
              legendOffset: 40,
              legendPosition: "middle",
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            axisLeft={{
              legend: "Reports",
              legendOffset: -50,
              legendPosition: "middle",
            }}
            colors={() => "#fc4e2a"}
            pointSize={8}
            pointBorderWidth={2}
            pointBorderColor="#fff"
            useMesh={true}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fill: "#ffffff", // make tick labels white
                  },
                },
                legend: {
                  text: {
                    fill: "#ffffff", // make axis legends white
                  },
                },
              },
            }}
            tooltip={({ point }) => (
              <div
                style={{
                  padding: "6px 12px",
                  background: "#1f1f1f",
                  color: "#ffffff",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                }}
              >
                <strong>{point.data.xFormatted}</strong>: {point.data.yFormatted} reports
              </div>
            )} 
          />
        </div>
      </div>

      {/* Bar Chart */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">
          Average Response Time by City
        </h2>
        <div className="h-[400px] bg-[#1a1a1a] border border-gray-700 rounded-lg shadow p-4">
          <ResponsiveBar
            data={barData()}
            keys={["avgResponse"]}
            indexBy="city"
            margin={{ top: 50, right: 30, bottom: 60, left: 60 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={() => "#feb24c"}
            axisBottom={{
              legend: "City",
              legendOffset: 40,
              legendPosition: "middle",
            }}
            axisLeft={{
              legend: "Avg Response Time (min)",
              legendOffset: -50,
              legendPosition: "middle",
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            borderColor={{ from: "color", modifiers: [["darker", 0.6]] }}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fill: "#ffffff", // make tick labels white
                  },
                },
                legend: {
                  text: {
                    fill: "#ffffff", // make axis legends white
                  },
                },
              },
            }}
            tooltip={({ id, value, indexValue }) => (
              <div
                style={{
                  padding: "6px 12px",
                  background: "#1f1f1f",
                  color: "#ffffff",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                }}
              >
                <strong>{indexValue}</strong>: {value} min avg
              </div>
            )} 
          />
          
        </div>
      </div>

      {/* Pie Chart */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Reports by Delivery App</h2>
        <div className="h-[400px] bg-[#1a1a1a] border border-gray-700 rounded-lg shadow p-4">
          <ResponsivePie
            data={pieData()}
            margin={{ top: 40, right: 80, bottom: 60, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            colors={{ scheme: "yellow_orange_red" }}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#e5e5e5"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fill: "#ffffff", // make tick labels white
                  },
                },
                legend: {
                  text: {
                    fill: "#ffffff", // make axis legends white
                  },
                },
              },
            }}
            tooltip={({ datum }) => (
              <div className="text-sm px-2 py-1 bg-[#1f1f1f] border border-gray-700 rounded-lg shadow text-white">
                <strong>{datum.id}</strong>: {datum.data.raw} reports
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}

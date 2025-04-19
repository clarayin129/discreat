"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ChatPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [report, setReport] = useState<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMessages = async () => {
    const res = await fetch(`/api/messages?reportId=${id}`);
    const data = await res.json();
    setMessages(data);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId: id,
        sender: "discreat",
        text: input,
      }),
    });

    setInput("");
    await fetchMessages();

    setTimeout(async () => {
      const reply = `Help dispatched to ${
        report?.address || "unknown location"
      } for report ${id}`;
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: id,
          sender: "responder",
          text: reply,
        }),
      });
      fetchMessages();
    }, 1500);

    setTimeout(async () => {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: id,
          sender: "system",
          text: "A police-on-the-way notification has been sent to the caller.",
        }),
      });
      fetchMessages();
    }, 3000);

    const steps = [
      "Responder is on the way",
      "Responder has arrived.",
      "Caller check-in successful.",
      "Incident is being assessed.",
      "Marked as resolved.",
    ];

    steps.forEach((msg, idx) => {
      setTimeout(async () => {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reportId: id,
            sender: "responder",
            text: msg,
          }),
        });
        fetchMessages();
      }, 4500 + idx * 2000);
    });
  };

  useEffect(() => {
    fetchMessages();
    fetch(`/api/reports/${id}`)
      .then((res) => res.json())
      .then(setReport);
    intervalRef.current = setInterval(fetchMessages, 3000);
    return () => clearInterval(intervalRef.current!);
  }, [id]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => router.push("/reports")}
          className="bg-gray-200 px-4 py-2 rounded text-sm"
        >
          ← Back to reports
        </button>
        <button
          onClick={() => router.push(`/reports/${id}`)}
          className="bg-blue-100 px-4 py-2 rounded text-sm"
        >
          📄 View Report Details
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-2">Live Chat</h1>

      {report && (
        <div>
          <div className="bg-gray-100 rounded p-4 mb-4 text-sm">
            <p>
              <strong>Report ID:</strong> {report._id}
            </p>
            <p>
              <strong>Address:</strong> {report.address}, {report.city},{" "}
              {report.country}
            </p>
            <p>
              <strong>Police Department:</strong> {report.policeDepartment}
            </p>
            <p>
              <strong>Status:</strong> {report.status}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(report.createdAt).toLocaleString()}
            </p>
          </div>

          <p className="mb-2">
            Chatting with <strong>{report.policeDepartment}:</strong>
          </p>
        </div>
      )}

      <div className="border rounded p-4 h-64 overflow-y-scroll bg-white mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 ${
              m.sender === "responder"
                ? "text-blue-800"
                : m.sender === "system"
                ? "text-gray-500 italic"
                : "text-gray-700"
            }`}
          >
            {m.sender !== "system" && <strong>{m.sender}:</strong>} {m.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}

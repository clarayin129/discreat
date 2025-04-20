/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:3001");

interface Message {
  reportId: string;
  sender: string;
  text: string;
}

export default function ChatPage() {
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

  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [report, setReport] = useState<any>(null);
  const [senderRole, setSenderRole] = useState<"discreat" | "responder">("discreat");

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/messages?reportId=${id}`);
    const data = await res.json();
    setMessages(data);
  }, [id]);

  const handleMessageAnalyzed = useCallback(
    async (payload: { message: string; resolved: number }) => {
      const msgText = payload.resolved
        ? `AI thinks this issue is resolved: "${payload.message}"`
        : `AI thinks this issue is still unresolved: "${payload.message}"`;

      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: id,
          sender: "system",
          text: msgText,
        }),
      });

      if (payload.resolved) {
        await fetch("/api/reports", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            status: "resolved",
          }),
        });

        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reportId: id,
            sender: "system",
            text: "Marked report as resolved.",
          }),
        });

        const res = await fetch(`/api/reports/${id}`);
        const updated = await res.json();
        setReport(updated);
      }

      fetchMessages();
    },
    [id, fetchMessages]
  );

  const sendMessage = async () => {
    if (!input.trim()) return;

    const message: Message = {
      reportId: id,
      sender: senderRole,
      text: input,
    };

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (senderRole === "responder") {
      socket.emit("newMessage", input);
    }

    setInput("");
    fetchMessages();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  useEffect(() => {
    fetchMessages();
    fetch(`/api/reports/${id}`)
      .then((res) => res.json())
      .then(setReport);

    socket.on("messageAnalyzed", handleMessageAnalyzed);
    return () => {
      socket.off("messageAnalyzed", handleMessageAnalyzed);
    };
  }, [id, fetchMessages, handleMessageAnalyzed]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => router.push("/reports")}
          className="bg-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-300"
        >
          ← Back to reports
        </button>
        <button
          onClick={() => router.push(`/reports/${id}`)}
          className="bg-orange-200 px-4 py-2 rounded-lg text-sm hover:bg-orange-300"
        >
          📄 View Report Details
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-2">Live Chat</h1>

      {report && (
        <>
          <p className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-1 rounded-lg text-sm font-medium ${getStatusColor(
                report.status
              )}`}
            >
              {report.status}
            </span>
          </p>
          <div className="bg-gray-100 rounded-lg p-4 mb-4 text-sm">
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
              <strong>Created:</strong>{" "}
              {new Date(report.createdAt).toLocaleString()}
            </p>
          </div>
        </>
      )}

      <div className="mb-2 text-sm text-gray-700 italic">
        Currently sending as: <strong>{senderRole}</strong>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setSenderRole("discreat")}
          className={`px-3 py-1 rounded-lg text-sm ${
            senderRole === "discreat"
              ? "bg-orange-600 text-white hover:bg-orange-700"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Discreat
        </button>
        <button
          onClick={() => setSenderRole("responder")}
          className={`px-3 py-1 rounded-lg text-sm ${
            senderRole === "responder"
              ? "bg-orange-600 text-white hover:bg-orange-700"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Responder
        </button>
      </div>

      <div className="border rounded-lg p-4 h-64 overflow-y-scroll bg-white mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 ${
              m.sender === "responder"
                ? "text-orange-800"
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
          onKeyDown={handleKeyDown}
          className="flex-1 p-2 border rounded-lg"
          placeholder="Type a message and press Enter…"
        />
        <button
          onClick={sendMessage}
          className="bg-orange-600 text-white px-4 rounded-lg hover:bg-orange-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}

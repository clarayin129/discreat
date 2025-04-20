"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:3001");

interface Message {
  reportId: string;
  sender: string;
  text: string;
}

export default function ChatPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [report, setReport] = useState<any>(null);

  const fetchMessages = async () => {
    const res = await fetch(`/api/messages?reportId=${id}`);
    const data = await res.json();
    setMessages(data);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const message: Message = {
      reportId: id,
      sender: "discreat",
      text: input,
    };

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    socket.emit("newMessage", input);
    setInput("");
    fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
    fetch(`/api/reports/${id}`).then((res) => res.json()).then(setReport);

    const handleMessageAnalyzed = async (payload: { message: string; resolved: number }) => {
      const sender = payload.resolved ? "responder" : "system";
      const msgText = payload.resolved
        ? `AI thinks this issue is resolved: "${payload.message}"`
        : `AI thinks this issue is still unresolved: "${payload.message}"`;

      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: id,
          sender,
          text: msgText,
        }),
      });

      fetchMessages();
    };

    socket.on("messageAnalyzed", handleMessageAnalyzed);
    return () => {
      socket.off("messageAnalyzed", handleMessageAnalyzed);
    };
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
        <div className="bg-gray-100 rounded p-4 mb-4 text-sm">
          <p><strong>Report ID:</strong> {report._id}</p>
          <p><strong>Address:</strong> {report.address}, {report.city}, {report.country}</p>
          <p><strong>Police Department:</strong> {report.policeDepartment}</p>
          <p><strong>Status:</strong> {report.status}</p>
          <p><strong>Created:</strong> {new Date(report.createdAt).toLocaleString()}</p>
        </div>
      )}

      <div className="border rounded p-4 h-64 overflow-y-scroll bg-white mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${
            m.sender === "responder" ? "text-blue-800" :
            m.sender === "system" ? "text-gray-500 italic" :
            "text-gray-700"
          }`}>
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
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 rounded">
          Send
        </button>
      </div>
    </div>
  );
}



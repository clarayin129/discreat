// src/app/chat/[id]/page.tsx
import { use } from "react"
import Link from "next/link"

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6">
        <Link href="/dashboard">
          <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">
            ← Back to Dashboard
          </button>
        </Link>
        <Link href={`/dashboard/${id}`}>
          <button className="px-4 py-2 bg-blue-100 rounded hover:bg-blue-200 text-sm">
            📄 View Report Details
          </button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">Live Chat</h1>
      <p className="mb-2">Report ID: <code>{id}</code></p>
      <p>This is where the live chat for the police department will appear.</p>
    </div>
  )
}
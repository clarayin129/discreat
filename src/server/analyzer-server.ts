/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import axios from "axios";
import { Server } from "socket.io";

const io = new Server(3001, {
  cors: { origin: "*" }
});

// Analyze message using Cerebras chat completion API
async function analyzeMessage(messageText: string): Promise<1 | 0> {
  const systemPrompt = {
    role: "system",
    content: "You are a safety assistant. Decide if the user's message indicates the emergency is resolved."
  };

  const userPrompt = {
    role: "user",
    content: `Does the following message indicate a resolved emergency?\nMessage: "${messageText}"\nReply with one word: resolved or unresolved.`
  };

  try {
    const response = await axios.post(
      "https://api.cerebras.ai/v1/chat/completions",
      {
        model: "llama-4-scout-17b-16e-instruct",
        messages: [systemPrompt, userPrompt],
        max_tokens: 1,
        temperature: 0
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CEREBRAS_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const answer = response.data.choices[0].message.content.trim().toLowerCase();
    return answer === "resolved" ? 1 : 0;
  } catch (err: any) {
    console.error("Cerebras API error:", err.response?.data || err.message);
    return 0; // fallback to unresolved
  }
}

// Start socket server
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("newMessage", async (msg: string) => {
    const resolved = await analyzeMessage(msg);
    io.emit("messageAnalyzed", { message: msg, resolved });
  });
});



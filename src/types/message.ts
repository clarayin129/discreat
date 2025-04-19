export interface Message {
    reportId: string
    sender: "responder" | "system"
    text: string
    timestamp: string
  }
  
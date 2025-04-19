export interface Report {
    id?: string
    callerId: string
    responderId?: string
    location: {
      lat: number
      lng: number
    }
    status: "pending" | "in_progress" | "resolved"
    createdAt: string
    responseTime?: number
    resolutionTime?: number
  }
  
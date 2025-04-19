export interface EventLog {
    id?: string
    reportId: string
    responderId?: string
    type:
      | "help_requested"
      | "responded"
      | "arrived"
      | "check_in"
      | "check_in_response"
      | "resolved"
      | "notified"
      | "check_in_missed"
    location?: {
      lat: number
      lng: number
    }
    timestamp: string
    note?: string
  }
  
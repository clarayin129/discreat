export interface Report {
    id?: string
    address: string
    city: string
    country: string
    createdAt: string
    status: "pending" | "in progress" | "resolved"
    policeDepartment: string
    responseTime?: number
    resolutionTime?: number
  }
  
export interface Notification {
    id?: string
    reportId: string
    message: string
    type: "help_on_the_way" | "check_in"
    responded: boolean
    timestamp: string
  }
  
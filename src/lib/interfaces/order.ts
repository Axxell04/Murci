export interface Order {
    id: string
    content: unknown
    completed: boolean
    contact: string
    createdAt: Date
    revenueId?: string | null
}

export interface OrderPagination {
    orders: Order[]
    totalPages: number
    currentPage: number
}
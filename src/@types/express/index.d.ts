declare global {
  namespace Express {
    interface Request {
      userId?: string
      user?: {
        id: string
        email: string
        createdAt: string
        updatedAt: string
      }
    }
  }
}

export {}

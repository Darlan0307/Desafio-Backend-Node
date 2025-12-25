export class UnauthorizedActionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "UnauthorizedActionError"
  }
}

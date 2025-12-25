export class GetEntityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "GetEntityError"
  }
}

export class UpdateEntityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "UpdateEntityError"
  }
}

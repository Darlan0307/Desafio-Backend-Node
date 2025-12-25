export class CreateEntityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "CreateEntityError"
  }
}

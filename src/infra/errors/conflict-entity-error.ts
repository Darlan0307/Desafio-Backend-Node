export class ConflictEntityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ConflictEntityError"
  }
}

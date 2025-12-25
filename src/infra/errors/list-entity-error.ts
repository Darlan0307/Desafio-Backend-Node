export class ListEntityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ListEntityError"
  }
}

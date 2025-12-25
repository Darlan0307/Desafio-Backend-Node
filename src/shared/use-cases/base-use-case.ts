/* eslint-disable @typescript-eslint/no-explicit-any */
import { InvalidInputError } from "@infra/errors"
import { ZodSchema } from "zod"

export abstract class BaseUseCase<InputType, OutputType, ErrorType extends Error> {
  constructor(
    private ErrorType: new (...args: any[]) => ErrorType,
    private errorMessage?: string,
    private schema?: ZodSchema<any>
  ) {}

  protected abstract action(
    idOrInput: InputType | number | string,
    additionalData?: any
  ): Promise<OutputType | InvalidInputError | ErrorType>

  async execute(
    idOrInput: InputType | number | string,
    additionalData?: InputType
  ): Promise<OutputType | InvalidInputError | ErrorType> {
    let input = idOrInput

    if (additionalData) {
      input = additionalData
    }

    if (this.schema) {
      const validation = this.schema.safeParse(input)
      if (!validation.success) {
        const error = validation.error

        const unrecognizedKeys = error.issues
          .filter((issue) => issue.code === "unrecognized_keys")
          .flatMap((issue: any) => issue.keys)

        let errorMessage: string

        if (unrecognizedKeys.length > 0) {
          const allowedKeys = Object.keys((this.schema as any).shape ?? {})
          errorMessage = `Os seguintes campos não são aceitos: ${unrecognizedKeys.join(
            ", "
          )}. São permitidos apenas: ${allowedKeys.join(", ")}.`
        } else {
          errorMessage = error.issues.map((issue) => issue.message).join("; ")
        }

        return new InvalidInputError(errorMessage)
      }
    }

    try {
      if (additionalData) {
        return this.action(idOrInput, input)
      }

      return this.action(input)
    } catch (error: any) {
      let message = error?.message ?? this.errorMessage

      if (typeof message === "object") {
        message = JSON.stringify(message, null, 2)
      }

      return new this.ErrorType(message)
    }
  }
}

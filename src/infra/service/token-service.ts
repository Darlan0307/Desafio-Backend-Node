import { logger } from "@infra/logger"
import jwt, { SignOptions } from "jsonwebtoken"

type TokenPayload = {
  userId: string
}

export class TokenService {
  constructor(
    private secret: string,
    private expiresIn: string
  ) {}

  private generateToken(userId: string): string {
    const payload: TokenPayload = {
      userId
    }
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as SignOptions["expiresIn"]
    })
  }

  verifyToken(token: string): jwt.JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as jwt.JwtPayload

      return decoded
    } catch (error) {
      logger.error("Erro ao verificar token:" + JSON.stringify(error, null, 2))
      return null
    }
  }

  generateAccessToken(userId: string): string {
    return this.generateToken(userId)
  }
}

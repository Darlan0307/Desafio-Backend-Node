import { MongooseUserRepository } from "@app/users/repository"
import { PasswordService } from "@infra/service/password-service"
import { TokenService } from "@infra/service/token-service"
import { Request, Response, NextFunction, RequestHandler } from "express"
import { match } from "path-to-regexp"

const PUBLIC_ROUTES: Array<{ method?: string; path: string }> = [
  { path: "/" },
  { path: "/health" },
  { path: "/auth/login", method: "POST" },
  { path: "/auth/register", method: "POST" }
]

function isPublicRoute(req: Request): boolean {
  return PUBLIC_ROUTES.some((route) => {
    const sameMethod = !route.method || route.method === req.method
    if (!sameMethod) return false

    const matchPath = match(route.path, { decode: decodeURIComponent })
    return matchPath(req.path) !== false
  })
}

export function createAuthMiddleware(
  passwordService: PasswordService,
  tokenService: TokenService
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (isPublicRoute(req)) {
      next()
      return
    }

    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ errorMessage: "Token não fornecido" })
      return
    }

    const token = authHeader.substring(7)
    if (!token) {
      res.status(401).json({ errorMessage: "Token não fornecido" })
      return
    }

    const userRepository = new MongooseUserRepository(passwordService, tokenService)

    try {
      const decoded = tokenService.verifyToken(token)
      if (!decoded) {
        res.status(401).json({ errorMessage: "Token inválido" })
        return
      }

      req.userId = decoded.userId

      req.user = (await userRepository.getById(req.userId ?? "")) ?? undefined

      next()
    } catch {
      res.status(401).json({ errorMessage: "Token inválido ou expirado" })
      return
    }
  }
}

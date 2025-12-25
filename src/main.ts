import { logger } from "@infra/logger"
import HttpServer from "./http-server"

enum ExitStatus {
  Failure = 1,
  Success = 0
}

async function main() {
  try {
    const PORT = process.env.PORT || 3000
    const httpServer = new HttpServer()
    const port = Number(PORT)
    const exitSignals: NodeJS.Signals[] = ["SIGINT", "SIGTERM", "SIGQUIT"]

    exitSignals.map((sig) =>
      process.on(sig, async () => {
        try {
          httpServer.stop()
          logger.info("Fechando servidor...")
          process.exit(ExitStatus.Success)
        } catch (error) {
          logger.error(`Erro ao fechar servidor: ${error}`)
          process.exit(ExitStatus.Failure)
        }
      })
    )

    const app = await httpServer.createApp()

    app.listen(port, () => logger.info(`Servidor rodando: http://localhost:${port}`))
  } catch (error) {
    logger.error(`Erro ao iniciar servidor: ${error}`)
    process.exit(ExitStatus.Failure)
  }
}

main()

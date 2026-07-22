import "server-only"

import pino, { type DestinationStream, type LoggerOptions } from "pino"

const redact = [
  "password",
  "token",
  "secret",
  "cookie",
  "authorization",
  "request.body.password",
  "request.body.token",
  "request.body.secret",
  "request.body.cookie",
  "request.body.authorization",
  "response.body.password",
  "response.body.token",
  "response.body.secret",
  "response.body.cookie",
  "response.body.authorization",
]

export function createLogger(
  environment: string | undefined = process.env.NODE_ENV,
  destination?: DestinationStream
) {
  const options: LoggerOptions = {
    level: environment === "development" ? "info" : "silent",
    redact,
  }

  if (environment === "development" && !destination) {
    options.transport = {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "SYS:standard" },
    }
  }

  return pino(options, destination)
}

export const logger = createLogger()

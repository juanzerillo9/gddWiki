import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super('NOT_FOUND', message, 404)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super('UNAUTHORIZED', message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado') {
    super('FORBIDDEN', message, 403)
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto') {
    super('CONFLICT', message, 409)
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Error de validación', details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details)
  }
}

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (error instanceof AppError) {
    void reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
        details: error.details ?? null,
      },
    })
    return
  }

  if (error instanceof ZodError) {
    void reply.status(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Error de validación',
        details: error.flatten(),
      },
    })
    return
  }

  // Fastify validation error
  if ('statusCode' in error && (error as FastifyError).statusCode === 400) {
    void reply.status(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: null,
      },
    })
    return
  }

  request.log.error(error)
  void reply.status(500).send({
    error: {
      code: 'INTERNAL',
      message: 'Error interno del servidor',
      details: null,
    },
  })
}

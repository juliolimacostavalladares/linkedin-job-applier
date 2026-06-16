import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: any, req: any, res: any, next: any) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erro interno do servidor';

  // Erros de validação
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Dados inválidos: ' + err.message;
  }

  // Erros do LinkedIn API
  if (err.statusCode === 401 || err.statusCode === 403) {
    message = 'Credenciais do LinkedIn inválidas ou expiradas';
  }

  // Log de erros
  logger.error('Request error', {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message,
    stack: err.stack,
  });

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

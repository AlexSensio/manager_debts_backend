import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // Erros de validação do Mongoose
  if (err.name === 'ValidationError') {
    res.status(400).json({
      message: 'Dados inválidos',
      errors: Object.values((err as any).errors).map((e: any) => e.message),
    });
    return;
  }

  // Chave duplicada no MongoDB
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0];
    res.status(409).json({
      message: `Já existe um registro com este ${field === 'cpf' ? 'CPF' : field === 'email' ? 'e-mail' : field}.`,
    });
    return;
  }

  // CastError (ID inválido)
  if (err.name === 'CastError') {
    res.status(400).json({ message: 'ID inválido.' });
    return;
  }

  res.status(statusCode).json({ message });
};

export const createError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

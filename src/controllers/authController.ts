import { Request, Response, NextFunction } from 'express';
import { registerService, loginService } from '../services/authService';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const result = await registerService({ name, email, password });
    res.status(201).json({ message: 'Usuário criado com sucesso.', ...result });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await loginService({ email, password });
    res.status(200).json({ message: 'Login realizado com sucesso.', ...result });
  } catch (error) {
    next(error);
  }
};

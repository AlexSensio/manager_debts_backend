import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface JWTPayload extends JwtPayload {
  id: string;
  email: string;
  name: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
}

export type DebtStatus = 'active' | 'paid' | 'overdue';
export type InstallmentStatus = 'pending' | 'paid';

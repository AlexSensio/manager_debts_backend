import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import {
  getInstallmentsByDebtService,
  payInstallmentService,
} from '../services/installmentsService';

export const getInstallmentsByDebt = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const installments = await getInstallmentsByDebtService(req.user!.id, req.params.debtId);
    res.status(200).json(installments);
  } catch (error) {
    next(error);
  }
};

export const payInstallment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const installment = await payInstallmentService(req.user!.id, req.params.id);
    res.status(200).json({ message: 'Parcela quitada com sucesso.', installment });
  } catch (error) {
    next(error);
  }
};

import mongoose from 'mongoose';
import Installment, { IInstallment } from '../models/Installment';
import { createError } from '../middleware/errorHandler';
import { syncDebtStatusService } from './debtsService';

export const getInstallmentsByDebtService = async (
  userId: string,
  debtId: string
): Promise<IInstallment[]> => {
  if (!mongoose.Types.ObjectId.isValid(debtId)) throw createError('ID inválido.', 400);

  return Installment.find({ debtId, userId }).sort({ number: 1 });
};

export const payInstallmentService = async (
  userId: string,
  installmentId: string
): Promise<IInstallment> => {
  if (!mongoose.Types.ObjectId.isValid(installmentId)) throw createError('ID inválido.', 400);

  const installment = await Installment.findOne({ _id: installmentId, userId });
  if (!installment) throw createError('Parcela não encontrada.', 404);
  if (installment.status === 'paid') throw createError('Parcela já foi paga.', 400);

  installment.status = 'paid';
  installment.paidAt = new Date();
  await installment.save();

  // Sincroniza status da dívida
  await syncDebtStatusService(String(installment.debtId));

  return installment;
};

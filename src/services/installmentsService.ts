import mongoose from 'mongoose';
import Installment, { IInstallment } from '../models/Installment';
import Debt from '../models/Debt';
import { createError } from '../middleware/errorHandler';
import { syncDebtStatusService } from './debtsService';

const calcLateFees = (amount: number, dailyRate: number, dueDate: Date, today: Date): { lateFees: number; lateDays: number } => {
  if (dailyRate <= 0 || dueDate >= today) return { lateFees: 0, lateDays: 0 };
  const lateDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  const lateFees = parseFloat((amount * (dailyRate / 100) * lateDays).toFixed(2));
  return { lateFees, lateDays };
};

export const getInstallmentsByDebtService = async (
  userId: string,
  debtId: string
): Promise<any[]> => {
  if (!mongoose.Types.ObjectId.isValid(debtId)) throw createError('ID inválido.', 400);

  const debt = await Debt.findOne({ _id: debtId, userId }).lean();
  const installments = await Installment.find({ debtId, userId }).sort({ number: 1 }).lean();

  const today = new Date();
  const dailyRate = debt?.dailyInterestRate ?? 0;

  return installments.map((inst) => {
    if (inst.status === 'pending') {
      const { lateFees, lateDays } = calcLateFees(inst.amount, dailyRate, new Date(inst.dueDate), today);
      return { ...inst, currentLateFees: lateFees, currentLateDays: lateDays };
    }
    return { ...inst, currentLateFees: 0, currentLateDays: 0 };
  });
};

export const payInstallmentService = async (
  userId: string,
  installmentId: string
): Promise<IInstallment> => {
  if (!mongoose.Types.ObjectId.isValid(installmentId)) throw createError('ID inválido.', 400);

  const installment = await Installment.findOne({ _id: installmentId, userId });
  if (!installment) throw createError('Parcela não encontrada.', 404);
  if (installment.status === 'paid') throw createError('Parcela já foi paga.', 400);

  // Calcula juros de atraso no momento do pagamento
  const debt = await Debt.findById(installment.debtId).lean();
  const dailyRate = debt?.dailyInterestRate ?? 0;
  const today = new Date();
  const { lateFees, lateDays } = calcLateFees(installment.amount, dailyRate, new Date(installment.dueDate), today);

  installment.status = 'paid';
  installment.paidAt = today;
  installment.lateFees = lateFees;
  installment.lateDays = lateDays;
  await installment.save();

  // Sincroniza status da dívida
  await syncDebtStatusService(String(installment.debtId));

  return installment;
};

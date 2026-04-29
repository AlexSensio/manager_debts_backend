import mongoose from 'mongoose';
import Debt, { IDebt } from '../models/Debt';
import Installment from '../models/Installment';
import Person from '../models/Person';
import { createError } from '../middleware/errorHandler';

// Fórmula PMT (Price/Tabela Price) para cálculo de parcelas com juros compostos
const calculatePMT = (principal: number, monthlyRate: number, n: number): number => {
  if (monthlyRate === 0) return principal / n;
  const r = monthlyRate / 100;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

const addMonths = (date: Date, months: number): Date => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

interface CreateDebtData {
  personId: string;
  description: string;
  totalAmount: number;
  installmentsCount: number;
  interestRate: number;
  startDate?: string;
}

export const createDebtService = async (
  userId: string,
  data: CreateDebtData
): Promise<{ debt: IDebt; installments: any[] }> => {
  if (!mongoose.Types.ObjectId.isValid(data.personId)) throw createError('ID de pessoa inválido.', 400);

  const person = await Person.findOne({ _id: data.personId, userId });
  if (!person) throw createError('Pessoa não encontrada.', 404);

  const installmentAmount = parseFloat(
    calculatePMT(data.totalAmount, data.interestRate, data.installmentsCount).toFixed(2)
  );
  const totalWithInterest = parseFloat((installmentAmount * data.installmentsCount).toFixed(2));

  const startDate = data.startDate ? new Date(data.startDate) : new Date();

  const debt = await Debt.create({
    userId,
    personId: data.personId,
    description: data.description,
    totalAmount: data.totalAmount,
    installmentsCount: data.installmentsCount,
    interestRate: data.interestRate,
    installmentAmount,
    totalWithInterest,
    startDate,
    status: 'active',
  });

  // Gera as parcelas automaticamente
  const installmentsToCreate = Array.from({ length: data.installmentsCount }, (_, i) => ({
    debtId: debt._id,
    userId,
    number: i + 1,
    dueDate: addMonths(startDate, i + 1),
    amount: installmentAmount,
    status: 'pending' as const,
  }));

  const installments = await Installment.insertMany(installmentsToCreate);

  return { debt, installments };
};

export const getDebtsService = async (
  userId: string,
  filters?: { status?: string; personId?: string }
): Promise<IDebt[]> => {
  const query: Record<string, unknown> = { userId };
  if (filters?.status) query.status = filters.status;
  if (filters?.personId) query.personId = filters.personId;

  return Debt.find(query)
    .populate('personId', 'name cpf')
    .sort({ createdAt: -1 });
};

export const getDebtByIdService = async (
  userId: string,
  debtId: string
): Promise<IDebt> => {
  if (!mongoose.Types.ObjectId.isValid(debtId)) throw createError('ID inválido.', 400);

  const debt = await Debt.findOne({ _id: debtId, userId }).populate('personId', 'name cpf phone email');
  if (!debt) throw createError('Dívida não encontrada.', 404);
  return debt;
};

export const getDebtsByPersonService = async (
  userId: string,
  personId: string
): Promise<IDebt[]> => {
  if (!mongoose.Types.ObjectId.isValid(personId)) throw createError('ID inválido.', 400);

  const person = await Person.findOne({ _id: personId, userId });
  if (!person) throw createError('Pessoa não encontrada.', 404);

  return Debt.find({ userId, personId }).sort({ createdAt: -1 });
};

export const updateDebtService = async (
  userId: string,
  debtId: string,
  data: Partial<{ description: string; status: string }>
): Promise<IDebt> => {
  if (!mongoose.Types.ObjectId.isValid(debtId)) throw createError('ID inválido.', 400);

  const debt = await Debt.findOneAndUpdate(
    { _id: debtId, userId },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!debt) throw createError('Dívida não encontrada.', 404);
  return debt;
};

export const deleteDebtService = async (
  userId: string,
  debtId: string
): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(debtId)) throw createError('ID inválido.', 400);

  const debt = await Debt.findOneAndDelete({ _id: debtId, userId });
  if (!debt) throw createError('Dívida não encontrada.', 404);

  // Remove as parcelas associadas
  await Installment.deleteMany({ debtId });
};

// Atualiza status da dívida baseado nas parcelas
export const syncDebtStatusService = async (debtId: string): Promise<void> => {
  const installments = await Installment.find({ debtId });
  if (!installments.length) return;

  const allPaid = installments.every((i) => i.status === 'paid');
  const hasOverdue = installments.some(
    (i) => i.status === 'pending' && new Date(i.dueDate) < new Date()
  );

  let status: 'active' | 'paid' | 'overdue' = 'active';
  if (allPaid) status = 'paid';
  else if (hasOverdue) status = 'overdue';

  await Debt.findByIdAndUpdate(debtId, { status });
};

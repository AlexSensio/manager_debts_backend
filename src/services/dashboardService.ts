import Debt from '../models/Debt';
import Installment from '../models/Installment';
import Person from '../models/Person';
import mongoose from 'mongoose';
import { createError } from '../middleware/errorHandler';

export const getGlobalDashboardService = async (userId: string) => {
  const userObjId = new mongoose.Types.ObjectId(userId);

  // Totais gerais
  const [totalLentAgg, totalReceivedAgg, totalInterestAgg, totalPeopleCount, totalDebtsCount] =
    await Promise.all([
      Debt.aggregate([
        { $match: { userId: userObjId } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Installment.aggregate([
        { $match: { userId: userObjId, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Installment.aggregate([
        { $match: { userId: userObjId, status: 'paid' } },
        {
          $lookup: {
            from: 'debts',
            localField: 'debtId',
            foreignField: '_id',
            as: 'debt',
          },
        },
        { $unwind: '$debt' },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $subtract: [
                  '$amount',
                  { $divide: ['$debt.totalAmount', '$debt.installmentsCount'] },
                ],
              },
            },
          },
        },
      ]),
      Person.countDocuments({ userId: userObjId }),
      Debt.countDocuments({ userId: userObjId }),
    ]);

  const totalLent = totalLentAgg[0]?.total || 0;
  const totalReceived = totalReceivedAgg[0]?.total || 0;
  const totalInterest = totalInterestAgg[0]?.total || 0;

  // Debts por status
  const debtsByStatus = await Debt.aggregate([
    { $match: { userId: userObjId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Dados mensais dos últimos 12 meses
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyDebts = await Debt.aggregate([
    { $match: { userId: userObjId, createdAt: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        totalLent: { $sum: '$totalAmount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthlyReceived = await Installment.aggregate([
    { $match: { userId: userObjId, status: 'paid', paidAt: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
        totalReceived: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Próximos vencimentos (7 dias)
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const upcomingInstallments = await Installment.find({
    userId: userObjId,
    status: 'pending',
    dueDate: { $lte: sevenDaysFromNow },
  })
    .sort({ dueDate: 1 })
    .limit(10)
    .populate({
      path: 'debtId',
      select: 'description personId',
      populate: { path: 'personId', select: 'name' },
    });

  return {
    totals: {
      totalLent: parseFloat(totalLent.toFixed(2)),
      totalReceived: parseFloat(totalReceived.toFixed(2)),
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      totalPending: parseFloat((totalLent - totalReceived).toFixed(2)),
      totalPeople: totalPeopleCount,
      totalDebts: totalDebtsCount,
    },
    debtsByStatus: debtsByStatus.reduce(
      (acc, cur) => ({ ...acc, [cur._id]: cur.count }),
      {} as Record<string, number>
    ),
    monthlyData: { monthlyDebts, monthlyReceived },
    upcomingInstallments,
  };
};

export const getPersonDashboardService = async (
  userId: string,
  personId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(personId)) throw createError('ID inválido.', 400);

  const userObjId = new mongoose.Types.ObjectId(userId);
  const personObjId = new mongoose.Types.ObjectId(personId);

  const debts = await Debt.find({ userId: userObjId, personId: personObjId });
  const debtIds = debts.map((d) => d._id);

  const [paidAgg, pendingAgg] = await Promise.all([
    Installment.aggregate([
      { $match: { userId: userObjId, debtId: { $in: debtIds }, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Installment.aggregate([
      { $match: { userId: userObjId, debtId: { $in: debtIds }, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const nextInstallments = await Installment.find({
    userId: userObjId,
    debtId: { $in: debtIds },
    status: 'pending',
  })
    .sort({ dueDate: 1 })
    .limit(5);

  return {
    totalPaid: paidAgg[0]?.total || 0,
    totalPending: pendingAgg[0]?.total || 0,
    totalDebts: debts.length,
    nextInstallments,
  };
};

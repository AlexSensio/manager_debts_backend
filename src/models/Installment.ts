import mongoose, { Document, Schema } from 'mongoose';
import { InstallmentStatus } from '../types';

export interface IInstallment extends Document {
  debtId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  number: number;
  dueDate: Date;
  amount: number;
  status: InstallmentStatus;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InstallmentSchema = new Schema<IInstallment>(
  {
    debtId: {
      type: Schema.Types.ObjectId,
      ref: 'Debt',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    number: {
      type: Number,
      required: true,
      min: 1,
    },
    dueDate: {
      type: Date,
      required: [true, 'Data de vencimento é obrigatória'],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

InstallmentSchema.index({ debtId: 1, number: 1 }, { unique: true });

export default mongoose.model<IInstallment>('Installment', InstallmentSchema);

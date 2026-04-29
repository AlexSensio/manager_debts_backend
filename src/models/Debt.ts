import mongoose, { Document, Schema } from 'mongoose';
import { DebtStatus } from '../types';

export interface IDebt extends Document {
  userId: mongoose.Types.ObjectId;
  personId: mongoose.Types.ObjectId;
  description: string;
  totalAmount: number;
  installmentsCount: number;
  interestRate: number; // taxa mensal em %
  installmentAmount: number; // valor calculado de cada parcela
  totalWithInterest: number; // total com juros
  status: DebtStatus;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DebtSchema = new Schema<IDebt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    personId: {
      type: Schema.Types.ObjectId,
      ref: 'Person',
      required: [true, 'Pessoa é obrigatória'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
      trim: true,
      maxlength: [200, 'Descrição não pode ter mais de 200 caracteres'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Valor total é obrigatório'],
      min: [0.01, 'Valor deve ser maior que zero'],
    },
    installmentsCount: {
      type: Number,
      required: [true, 'Número de parcelas é obrigatório'],
      min: [1, 'Deve ter ao menos 1 parcela'],
      max: [360, 'Máximo de 360 parcelas'],
    },
    interestRate: {
      type: Number,
      required: [true, 'Taxa de juros é obrigatória'],
      min: [0, 'Taxa não pode ser negativa'],
      default: 0,
    },
    installmentAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalWithInterest: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'paid', 'overdue'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IDebt>('Debt', DebtSchema);

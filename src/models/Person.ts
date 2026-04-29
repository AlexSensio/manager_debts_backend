import mongoose, { Document, Schema } from 'mongoose';

export interface IAddress {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface IPerson extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  cpf: string;
  address: IAddress;
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    street: { type: String, trim: true },
    number: { type: String, trim: true },
    neighborhood: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true, maxlength: 2 },
    zipCode: { type: String, trim: true },
  },
  { _id: false }
);

const PersonSchema = new Schema<IPerson>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      maxlength: [100, 'Nome não pode ter mais de 100 caracteres'],
    },
    cpf: {
      type: String,
      required: [true, 'CPF é obrigatório'],
      trim: true,
    },
    address: {
      type: AddressSchema,
      default: {},
    },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
  },
  { timestamps: true }
);

// CPF único por usuário (um credor não cadastra o mesmo CPF duas vezes)
PersonSchema.index({ userId: 1, cpf: 1 }, { unique: true });

export default mongoose.model<IPerson>('Person', PersonSchema);

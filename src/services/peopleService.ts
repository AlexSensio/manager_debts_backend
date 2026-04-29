import mongoose from 'mongoose';
import Person, { IPerson, IAddress } from '../models/Person';
import { createError } from '../middleware/errorHandler';

// Validação de CPF (algoritmo oficial)
export const validateCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleaned[10]);
};

export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

interface CreatePersonData {
  name: string;
  cpf: string;
  address?: IAddress;
  phone?: string;
  email?: string;
}

export const createPersonService = async (
  userId: string,
  data: CreatePersonData
): Promise<IPerson> => {
  if (!validateCPF(data.cpf)) throw createError('CPF inválido.', 400);

  const cpfFormatted = formatCPF(data.cpf);
  const person = await Person.create({ ...data, cpf: cpfFormatted, userId });
  return person;
};

export const getPeopleService = async (
  userId: string,
  search?: string
): Promise<IPerson[]> => {
  const query: Record<string, unknown> = { userId };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { cpf: { $regex: search, $options: 'i' } },
    ];
  }
  return Person.find(query).sort({ name: 1 });
};

export const getPersonByIdService = async (
  userId: string,
  personId: string
): Promise<IPerson> => {
  if (!mongoose.Types.ObjectId.isValid(personId)) throw createError('ID inválido.', 400);

  const person = await Person.findOne({ _id: personId, userId });
  if (!person) throw createError('Pessoa não encontrada.', 404);
  return person;
};

export const updatePersonService = async (
  userId: string,
  personId: string,
  data: Partial<CreatePersonData>
): Promise<IPerson> => {
  if (!mongoose.Types.ObjectId.isValid(personId)) throw createError('ID inválido.', 400);

  if (data.cpf) {
    if (!validateCPF(data.cpf)) throw createError('CPF inválido.', 400);
    data.cpf = formatCPF(data.cpf);
  }

  const person = await Person.findOneAndUpdate(
    { _id: personId, userId },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!person) throw createError('Pessoa não encontrada.', 404);
  return person;
};

export const deletePersonService = async (
  userId: string,
  personId: string
): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(personId)) throw createError('ID inválido.', 400);

  const person = await Person.findOneAndDelete({ _id: personId, userId });
  if (!person) throw createError('Pessoa não encontrada.', 404);
};

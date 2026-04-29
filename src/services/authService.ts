import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { createError } from '../middleware/errorHandler';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const generateToken = (user: IUser): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw createError('Erro de configuração do servidor.', 500);

  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as `${number}d`;
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    secret,
    { expiresIn }
  );
};

export const registerService = async (data: RegisterData): Promise<AuthResult> => {
  const exists = await User.findOne({ email: data.email.toLowerCase() });
  if (exists) throw createError('E-mail já cadastrado.', 409);

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
  });

  const token = generateToken(user);
  return {
    token,
    user: { id: String(user._id), name: user.name, email: user.email },
  };
};

export const loginService = async (data: LoginData): Promise<AuthResult> => {
  const user = await User.findOne({ email: data.email.toLowerCase() }).select('+password');
  if (!user) throw createError('Credenciais inválidas.', 401);

  const isMatch = await user.comparePassword(data.password);
  if (!isMatch) throw createError('Credenciais inválidas.', 401);

  const token = generateToken(user);
  return {
    token,
    user: { id: String(user._id), name: user.name, email: user.email },
  };
};

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import {
  createDebtService,
  getDebtsService,
  getDebtByIdService,
  getDebtsByPersonService,
  updateDebtService,
  deleteDebtService,
} from '../services/debtsService';

export const createDebt = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await createDebtService(req.user!.id, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getDebts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, personId } = req.query as { status?: string; personId?: string };
    const debts = await getDebtsService(req.user!.id, { status, personId });
    res.status(200).json(debts);
  } catch (error) {
    next(error);
  }
};

export const getDebtById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const debt = await getDebtByIdService(req.user!.id, req.params.id);
    res.status(200).json(debt);
  } catch (error) {
    next(error);
  }
};

export const getDebtsByPerson = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const debts = await getDebtsByPersonService(req.user!.id, req.params.id);
    res.status(200).json(debts);
  } catch (error) {
    next(error);
  }
};

export const updateDebt = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const debt = await updateDebtService(req.user!.id, req.params.id, req.body);
    res.status(200).json(debt);
  } catch (error) {
    next(error);
  }
};

export const deleteDebt = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await deleteDebtService(req.user!.id, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

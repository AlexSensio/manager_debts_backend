import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import {
  createPersonService,
  getPeopleService,
  getPersonByIdService,
  updatePersonService,
  deletePersonService,
} from '../services/peopleService';

export const createPerson = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const person = await createPersonService(req.user!.id, req.body);
    res.status(201).json(person);
  } catch (error) {
    next(error);
  }
};

export const getPeople = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const people = await getPeopleService(req.user!.id, search);
    res.status(200).json(people);
  } catch (error) {
    next(error);
  }
};

export const getPersonById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const person = await getPersonByIdService(req.user!.id, req.params.id);
    res.status(200).json(person);
  } catch (error) {
    next(error);
  }
};

export const updatePerson = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const person = await updatePersonService(req.user!.id, req.params.id, req.body);
    res.status(200).json(person);
  } catch (error) {
    next(error);
  }
};

export const deletePerson = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await deletePersonService(req.user!.id, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

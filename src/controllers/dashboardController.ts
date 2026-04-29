import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { getGlobalDashboardService, getPersonDashboardService } from '../services/dashboardService';

export const getGlobalDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await getGlobalDashboardService(req.user!.id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getPersonDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await getPersonDashboardService(req.user!.id, req.params.personId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getGlobalDashboard } from '../controllers/dashboardController';

const router = Router();

router.use(protect);

router.get('/', getGlobalDashboard);

export default router;

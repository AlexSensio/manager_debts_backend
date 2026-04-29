import { Router } from 'express';
import { protect } from '../middleware/auth';
import { payInstallment } from '../controllers/installmentsController';

const router = Router();

router.use(protect);

router.patch('/:id/pay', payInstallment);

export default router;

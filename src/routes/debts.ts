import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  createDebt,
  getDebts,
  getDebtById,
  updateDebt,
  deleteDebt,
} from '../controllers/debtsController';
import { getInstallmentsByDebt } from '../controllers/installmentsController';

const router = Router();

router.use(protect);

router.route('/').get(getDebts).post(createDebt);
router.route('/:id').get(getDebtById).put(updateDebt).delete(deleteDebt);
router.get('/:debtId/installments', getInstallmentsByDebt);

export default router;

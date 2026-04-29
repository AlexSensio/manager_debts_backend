import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  createPerson,
  getPeople,
  getPersonById,
  updatePerson,
  deletePerson,
} from '../controllers/peopleController';
import { getDebtsByPerson } from '../controllers/debtsController';
import { getPersonDashboard } from '../controllers/dashboardController';

const router = Router();

router.use(protect);

router.route('/').get(getPeople).post(createPerson);
router.route('/:id').get(getPersonById).put(updatePerson).delete(deletePerson);
router.get('/:id/debts', getDebtsByPerson);
router.get('/:personId/dashboard', getPersonDashboard);

export default router;

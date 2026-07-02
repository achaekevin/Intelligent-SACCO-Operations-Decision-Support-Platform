import { Router } from 'express';
import loanController from '../controllers/loanController.js';
import { authenticate, authorize, tenantIsolation } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { auditLog } from '../middlewares/auditLog.js';
import {
  applyLoanSchema, approveLoanSchema, rejectLoanSchema,
  disburseLoanSchema, repayLoanSchema, addGuarantorSchema,
  loanListQuerySchema, guarantorListQuerySchema,
} from '../validators/loanValidator.js';
import { ROLES } from '../constants/index.js';

const router = Router();
router.use(authenticate, tenantIsolation);

const loanOfficers = [ROLES.SACCO_ADMIN, ROLES.LOAN_OFFICER];
const approvers   = [ROLES.SACCO_ADMIN];
const cashiers    = [ROLES.SACCO_ADMIN, ROLES.CASHIER];

/**
 * @swagger
 * tags:
 *   name: Loans
 *   description: Full loan lifecycle management
 */

router.get('/',       validate(loanListQuerySchema, 'query'), loanController.list);
router.get('/stats',  loanController.getStats);
router.get('/guarantors',  validate(guarantorListQuerySchema, 'query'), loanController.listGuarantors);
router.get('/guarantors/:memberId/liability', loanController.getGuarantorLiability);
router.post('/apply', authorize(...loanOfficers), validate(applyLoanSchema), auditLog('create', 'loan'), loanController.apply);
router.get('/:id',              loanController.getById);
router.get('/:id/schedule',     loanController.getSchedule);
router.post('/:id/guarantors',  authorize(...loanOfficers), validate(addGuarantorSchema), loanController.addGuarantor);
router.patch('/guarantors/:id/accept', loanController.acceptGuarantor);
router.patch('/guarantors/:id/decline', loanController.declineGuarantor);
router.patch('/guarantors/:id/release', authorize(...approvers), loanController.releaseGuarantor);
router.patch('/:id/approve',    authorize(...approvers), validate(approveLoanSchema), auditLog('approve', 'loan'), loanController.approve);
router.patch('/:id/reject',     authorize(...approvers), validate(rejectLoanSchema), auditLog('reject', 'loan'), loanController.reject);
router.patch('/:id/disburse',   authorize(...approvers), validate(disburseLoanSchema), auditLog('disburse', 'loan'), loanController.disburse);
router.post('/:id/repay',       authorize(...cashiers), validate(repayLoanSchema), auditLog('deposit', 'loan'), loanController.repay);
router.get('/:id/summary',      loanController.getLoanSummary);
router.get('/repayments/:repaymentId/receipt', loanController.getRepaymentReceipt);

export default router;

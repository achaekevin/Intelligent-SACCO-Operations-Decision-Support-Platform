import sequelize from '../config/database.js';
import Organization from './Organization.js';
import Branch from './Branch.js';
import { Role, Permission, RolePermission } from './Role.js';
import User from './User.js';
import Member from './Member.js';
import { NextOfKin, MemberDocument } from './MemberDocument.js';
import { SavingsAccount, SavingsTransaction } from './Savings.js';
import { LoanProduct, Loan, LoanRepayment, Guarantor } from './Loan.js';
import { Account, JournalEntry, JournalLine } from './Accounting.js';
import { AuditLog, Notification, MpesaTransaction } from './Support.js';

// ─── Organization ↔ Branch ────────────────────────────────────
Organization.hasMany(Branch, { foreignKey: 'organizationId', as: 'branches' });
Branch.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

// ─── Organization ↔ User ──────────────────────────────────────
Organization.hasMany(User, { foreignKey: 'organizationId', as: 'users' });
User.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

// ─── Branch ↔ User ────────────────────────────────────────────
Branch.hasMany(User, { foreignKey: 'branchId', as: 'users' });
User.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });

// ─── Role ↔ User ──────────────────────────────────────────────
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'roleData' });

// ─── Role ↔ Permission (M:N) ──────────────────────────────────
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId', as: 'permissions' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId', as: 'roles' });

// ─── Organization ↔ Member ────────────────────────────────────
Organization.hasMany(Member, { foreignKey: 'organizationId', as: 'members' });
Member.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

// ─── Branch ↔ Member ──────────────────────────────────────────
Branch.hasMany(Member, { foreignKey: 'branchId', as: 'members' });
Member.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });

// ─── Member ↔ User ────────────────────────────────────────────
Member.hasOne(User, { foreignKey: 'memberId', as: 'userAccount' });
User.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

// ─── Member ↔ NextOfKin ───────────────────────────────────────
Member.hasMany(NextOfKin, { foreignKey: 'memberId', as: 'nextOfKin' });
NextOfKin.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

// ─── Member ↔ MemberDocument ──────────────────────────────────
Member.hasMany(MemberDocument, { foreignKey: 'memberId', as: 'documents' });
MemberDocument.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

// ─── Member ↔ SavingsAccount ──────────────────────────────────
Member.hasMany(SavingsAccount, { foreignKey: 'memberId', as: 'savingsAccounts' });
SavingsAccount.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

// ─── Branch ↔ SavingsAccount ──────────────────────────────────
Branch.hasMany(SavingsAccount, { foreignKey: 'branchId', as: 'savingsAccounts' });
SavingsAccount.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });

// ─── SavingsAccount ↔ SavingsTransaction ──────────────────────
SavingsAccount.hasMany(SavingsTransaction, { foreignKey: 'savingsAccountId', as: 'transactions' });
SavingsTransaction.belongsTo(SavingsAccount, { foreignKey: 'savingsAccountId', as: 'account' });

// ─── Member ↔ Loan ────────────────────────────────────────────
Member.hasMany(Loan, { foreignKey: 'memberId', as: 'loans' });
Loan.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

// ─── LoanProduct ↔ Loan ───────────────────────────────────────
LoanProduct.hasMany(Loan, { foreignKey: 'loanProductId', as: 'loans' });
Loan.belongsTo(LoanProduct, { foreignKey: 'loanProductId', as: 'product' });

// ─── Loan ↔ LoanRepayment ─────────────────────────────────────
Loan.hasMany(LoanRepayment, { foreignKey: 'loanId', as: 'repayments' });
LoanRepayment.belongsTo(Loan, { foreignKey: 'loanId', as: 'loan' });

// ─── Loan ↔ Guarantor ─────────────────────────────────────────
Loan.hasMany(Guarantor, { foreignKey: 'loanId', as: 'guarantors' });
Guarantor.belongsTo(Loan, { foreignKey: 'loanId', as: 'loan' });
Member.hasMany(Guarantor, { foreignKey: 'memberId', as: 'guaranteedLoans' });
Guarantor.belongsTo(Member, { foreignKey: 'memberId', as: 'guarantor' });

// ─── Accounting ───────────────────────────────────────────────
Organization.hasMany(Account, { foreignKey: 'organizationId', as: 'accounts' });
Account.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Account.hasMany(JournalLine, { foreignKey: 'accountId', as: 'journalLines' });
JournalLine.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });
JournalEntry.hasMany(JournalLine, { foreignKey: 'journalEntryId', as: 'lines' });
JournalLine.belongsTo(JournalEntry, { foreignKey: 'journalEntryId', as: 'journal' });

export {
  sequelize,
  Organization,
  Branch,
  Role,
  Permission,
  RolePermission,
  User,
  Member,
  NextOfKin,
  MemberDocument,
  SavingsAccount,
  SavingsTransaction,
  LoanProduct,
  Loan,
  LoanRepayment,
  Guarantor,
  Account,
  JournalEntry,
  JournalLine,
  AuditLog,
  Notification,
  MpesaTransaction,
};

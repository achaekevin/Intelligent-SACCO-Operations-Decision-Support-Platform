import { Op } from 'sequelize';
import { BaseRepository } from './BaseRepository.js';
import { SavingsAccount, SavingsTransaction, Member, Branch } from '../models/index.js';

class SavingsAccountRepository extends BaseRepository {
  constructor() { super(SavingsAccount); }

  async findByMember(memberId, organizationId) {
    return SavingsAccount.findAll({
      where: { memberId, organizationId },
      include: [{ model: Member, as: 'member', attributes: ['id', 'firstName', 'lastName', 'memberNumber'] }],
    });
  }

  async findByAccountNumber(accountNumber, organizationId) {
    return SavingsAccount.findOne({ where: { accountNumber, organizationId } });
  }

  async findByIdWithMember(id, organizationId) {
    return SavingsAccount.findOne({
      where: { id, organizationId },
      include: [{ model: Member, as: 'member' }, { model: Branch, as: 'branch', attributes: ['id', 'name'] }],
    });
  }

  async findByOrganizationPaginated(organizationId, { limit, offset, search, accountType, status, branchId } = {}) {
    const where = { organizationId };
    if (accountType) where.accountType = accountType;
    if (status) where.status = status;
    if (branchId) where.branchId = branchId;

    return SavingsAccount.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Member, as: 'member', attributes: ['id', 'firstName', 'lastName', 'memberNumber', 'phone'],
          ...(search && { where: {
            [Op.or]: [
              { firstName: { [Op.like]: `%${search}%` } },
              { lastName: { [Op.like]: `%${search}%` } },
              { memberNumber: { [Op.like]: `%${search}%` } },
            ],
          }}),
        },
        { model: Branch, as: 'branch', attributes: ['id', 'name'] },
      ],
    });
  }

  async getTotalSavingsByOrganization(organizationId) {
    const { sequelize } = await import('../models/index.js');
    const result = await SavingsAccount.findAll({
      where: { organizationId, status: 'active' },
      attributes: [
        'accountType',
        [sequelize.fn('SUM', sequelize.col('balance')), 'totalBalance'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['accountType'],
    });
    return result;
  }
}

class SavingsTransactionRepository extends BaseRepository {
  constructor() { super(SavingsTransaction); }

  async findByAccount(savingsAccountId, { limit, offset, type, startDate, endDate } = {}) {
    const where = { savingsAccountId };
    if (type) where.type = type;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }
    return SavingsTransaction.findAndCountAll({
      where, limit, offset,
      order: [['createdAt', 'DESC']],
    });
  }

  async findByOrganization(organizationId, { limit, offset, type, startDate, endDate, branchId } = {}) {
    const where = { organizationId };
    if (type) where.type = type;
    if (branchId) where.branchId = branchId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }
    return SavingsTransaction.findAndCountAll({
      where, limit, offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: SavingsAccount, as: 'account', attributes: ['id', 'accountNumber', 'accountType'] },
      ],
    });
  }

  async findByReference(reference) {
    return SavingsTransaction.findOne({ where: { reference } });
  }

  async getDailySummary(organizationId, date) {
    const { sequelize } = await import('../models/index.js');
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return SavingsTransaction.findAll({
      where: { organizationId, createdAt: { [Op.between]: [start, end] }, status: 'completed' },
      attributes: [
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['type'],
    });
  }
}

export const savingsAccountRepository = new SavingsAccountRepository();
export const savingsTransactionRepository = new SavingsTransactionRepository();

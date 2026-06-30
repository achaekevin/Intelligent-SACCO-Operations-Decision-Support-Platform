import { branchRepository } from '../repositories/index.js';
import { Branch, Member, SavingsAccount, Loan } from '../models/index.js';
import { ConflictError, ForbiddenError } from '../utils/errors.js';
import { getPagination, getOrderClause } from '../utils/helpers.js';

class BranchService {
  async create(organizationId, data, createdBy) {
    const exists = await branchRepository.existsByCode(organizationId, data.code);
    if (exists) throw new ConflictError('A branch with this code already exists in your organization.');

    return branchRepository.create({ ...data, organizationId, code: data.code.toUpperCase() });
  }

  async list(organizationId, query = {}) {
    const { page, limit, offset } = getPagination(query);
    const { rows: branches, count: total } = await Branch.findAndCountAll({
      where: { organizationId, ...(query.status && { status: query.status }) },
      limit,
      offset,
      order: getOrderClause(query.sort, ['name', 'createdAt']),
    });
    return { branches, total, page, limit };
  }

  async getById(id, organizationId) {
    return branchRepository.findOne({ where: { id, organizationId } });
  }

  async update(id, organizationId, data) {
    const branch = await branchRepository.findOne({ where: { id, organizationId } });
    if (!branch) throw new Error('Branch not found.');

    if (data.code && data.code.toUpperCase() !== branch.code) {
      const exists = await branchRepository.existsByCode(organizationId, data.code, id);
      if (exists) throw new ConflictError('Branch code already in use.');
      data.code = data.code.toUpperCase();
    }

    await branch.update(data);
    return branch;
  }

  async delete(id, organizationId) {
    const branch = await branchRepository.findOne({ where: { id, organizationId } });
    if (!branch) throw new Error('Branch not found.');

    // Prevent deletion if branch has members
    const memberCount = await Member.count({ where: { branchId: id, organizationId } });
    if (memberCount > 0) {
      throw new ForbiddenError('Cannot delete branch with active members. Transfer members first.');
    }

    await branch.destroy();
    return branch;
  }

  async getStats(id, organizationId) {
    const [totalMembers, activeMembers, savingsCount, activeLoans] = await Promise.all([
      Member.count({ where: { branchId: id, organizationId } }),
      Member.count({ where: { branchId: id, organizationId, status: 'active' } }),
      SavingsAccount.count({ where: { branchId: id, organizationId, status: 'active' } }),
      Loan.count({ where: { branchId: id, organizationId, status: 'disbursed' } }),
    ]);

    const { sequelize } = await import('../models/index.js');
    const [[savingsSums]] = await sequelize.query(
      `SELECT SUM(balance) as totalSavings FROM savings_accounts WHERE branchId = ? AND organizationId = ? AND status = 'active' AND deletedAt IS NULL`,
      { replacements: [id, organizationId] }
    );

    return {
      totalMembers,
      activeMembers,
      savingsCount,
      activeLoans,
      totalSavings: savingsSums?.totalSavings || 0,
    };
  }

  async assignManager(branchId, organizationId, managerId) {
    const branch = await branchRepository.findOne({ where: { id: branchId, organizationId } });
    if (!branch) throw new Error('Branch not found.');
    await branch.update({ managerId });
    return branch;
  }
}

export default new BranchService();

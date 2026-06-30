import { Organization, Branch } from '../models/index.js';
import { organizationRepository } from '../repositories/index.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { redisSet, redisGet, redisDel } from '../config/redis.js';
import { CACHE_TTL } from '../constants/index.js';

class OrganizationService {
  async getById(id) {
    const cached = await redisGet(`org:${id}`);
    if (cached) return cached;

    const org = await organizationRepository.findByIdOrThrow(id);
    await redisSet(`org:${id}`, org.toJSON(), CACHE_TTL.MEDIUM);
    return org;
  }

  async update(id, data) {
    const org = await organizationRepository.findByIdOrThrow(id);

    if (data.code && data.code !== org.code) {
      const exists = await organizationRepository.findByCode(data.code.toUpperCase());
      if (exists) throw new ConflictError('Organization code already in use.');
      data.code = data.code.toUpperCase();
    }

    await org.update(data);
    await redisDel(`org:${id}`);
    return org;
  }

  async updateSettings(id, settings) {
    const org = await organizationRepository.findByIdOrThrow(id);
    const merged = { ...org.settings, ...settings };
    await org.update({ settings: merged });
    await redisDel(`org:${id}`);
    return org;
  }

  async updateStatus(id, status) {
    const org = await organizationRepository.update(id, { status });
    await redisDel(`org:${id}`);
    return org;
  }

  async getStats(id) {
    const { Member, SavingsAccount, Loan, Branch: BranchModel } = await import('../models/index.js');
    const [totalMembers, totalBranches, activeSavings, activeLoans] = await Promise.all([
      Member.count({ where: { organizationId: id, status: 'active' } }),
      BranchModel.count({ where: { organizationId: id, status: 'active' } }),
      SavingsAccount.count({ where: { organizationId: id, status: 'active' } }),
      Loan.count({ where: { organizationId: id, status: 'disbursed' } }),
    ]);
    return { totalMembers, totalBranches, activeSavings, activeLoans };
  }

  // Super Admin: list all organizations
  async listAll({ page = 1, limit = 20, status } = {}) {
    const offset = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;
    return Organization.findAndCountAll({ where, limit, offset, order: [['createdAt', 'DESC']] });
  }
}

export default new OrganizationService();

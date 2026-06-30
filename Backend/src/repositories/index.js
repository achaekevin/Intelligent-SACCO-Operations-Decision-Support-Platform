import { Op } from 'sequelize';
import { BaseRepository } from './BaseRepository.js';
import { Organization, Branch, Member, NextOfKin, MemberDocument, User } from '../models/index.js';

// ─── Organization Repository ────────────────────────────────────
class OrganizationRepository extends BaseRepository {
  constructor() { super(Organization); }

  async findByCode(code) {
    return Organization.findOne({ where: { code } });
  }

  async findByEmail(email) {
    return Organization.findOne({ where: { email } });
  }

  async findActive() {
    return Organization.findAll({ where: { status: 'active' } });
  }
}

// ─── Branch Repository ─────────────────────────────────────────
class BranchRepository extends BaseRepository {
  constructor() { super(Branch); }

  async findByOrganization(organizationId, options = {}) {
    return Branch.findAll({
      where: this.scopeToOrg(organizationId, { status: 'active' }),
      ...options,
    });
  }

  async findWithManager(branchId) {
    return Branch.findByPk(branchId, {
      include: [{ model: User, as: 'users', where: { role: 'sacco_admin' }, required: false }],
    });
  }

  async existsByCode(organizationId, code, excludeId = null) {
    const where = { organizationId, code };
    if (excludeId) where.id = { [Op.ne]: excludeId };
    return this.exists(where);
  }
}

// ─── Member Repository ─────────────────────────────────────────
class MemberRepository extends BaseRepository {
  constructor() { super(Member); }

  async findWithDetails(memberId) {
    return Member.findByPk(memberId, {
      include: [
        { model: NextOfKin, as: 'nextOfKin' },
        { model: MemberDocument, as: 'documents' },
        { model: User, as: 'userAccount', attributes: ['id', 'email', 'status', 'lastLoginAt'] },
        { model: Branch, as: 'branch', attributes: ['id', 'name', 'code'] },
      ],
    });
  }

  async findByOrganizationPaginated(organizationId, { limit, offset, search, status, branchId } = {}) {
    const where = this.scopeToOrg(organizationId);
    if (status) where.status = status;
    if (branchId) where.branchId = branchId;
    if (search) {
      const searchWhere = this.buildSearchWhere(search, ['firstName', 'lastName', 'memberNumber', 'phone', 'nationalId', 'email']);
      Object.assign(where, searchWhere);
    }
    return Member.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{ model: Branch, as: 'branch', attributes: ['id', 'name', 'code'] }],
    });
  }

  async findByPhone(phone, organizationId) {
    return Member.findOne({ where: { phone, organizationId } });
  }

  async findByNationalId(nationalId, organizationId) {
    return Member.findOne({ where: { nationalId, organizationId } });
  }

  async findByMemberNumber(memberNumber, organizationId) {
    return Member.findOne({ where: { memberNumber, organizationId } });
  }

  async getNextSequence(organizationId) {
    const count = await Member.count({ where: { organizationId }, paranoid: false });
    return count + 1;
  }

  async getStats(organizationId) {
    const total = await Member.count({ where: { organizationId } });
    const active = await Member.count({ where: { organizationId, status: 'active' } });
    const pending = await Member.count({ where: { organizationId, status: 'pending' } });
    const suspended = await Member.count({ where: { organizationId, status: 'suspended' } });
    return { total, active, pending, suspended };
  }
}

export const organizationRepository = new OrganizationRepository();
export const branchRepository = new BranchRepository();
export const memberRepository = new MemberRepository();

// Re-export savings repositories
export { savingsAccountRepository, savingsTransactionRepository } from './savingsRepository.js';

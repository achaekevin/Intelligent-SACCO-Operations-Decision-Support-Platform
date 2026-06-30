import { Organization, Branch, User, Role } from '../models/index.js';
import { organizationRepository } from '../repositories/index.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { redisSet, redisGet, redisDel } from '../config/redis.js';
import { CACHE_TTL, ROLES } from '../constants/index.js';
import emailService from './emailService.js';
import logger from '../utils/logger.js';

class OrganizationService {
  async register(data) {
    const { 
      name, email, phone, address,
      adminFirstName, adminLastName, adminEmail, adminPhone, adminPassword 
    } = data;

    // Check if organization email already exists
    const existingOrg = await Organization.findOne({ where: { email: email.toLowerCase() } });
    if (existingOrg) {
      throw new ConflictError('An organization with this email already exists.');
    }

    // Check if admin email already exists
    const existingUser = await User.findOne({ where: { email: adminEmail.toLowerCase() } });
    if (existingUser) {
      throw new ConflictError('A user with this email already exists.');
    }

    // Generate organization code (first 3 letters of name + random 3 digits)
    const codePrefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
    const codeNumber = Math.floor(100 + Math.random() * 900);
    let code = `${codePrefix}${codeNumber}`;

    // Ensure code is unique
    let codeExists = await Organization.findOne({ where: { code } });
    while (codeExists) {
      const newNumber = Math.floor(100 + Math.random() * 900);
      code = `${codePrefix}${newNumber}`;
      codeExists = await Organization.findOne({ where: { code } });
    }

    // Create organization
    const organization = await Organization.create({
      name,
      code,
      email: email.toLowerCase(),
      phone,
      address,
      status: 'trial', // Start with trial status
      settings: {
        currency: 'KES',
        timezone: 'Africa/Nairobi',
        interestMethod: 'reducing_balance',
        enableMpesa: false,
        loanApprovalLevels: 2,
      },
    });

    // Create main branch
    const branch = await Branch.create({
      organizationId: organization.id,
      name: 'Main Branch',
      code: 'MAIN',
      address,
      phone,
      email: email.toLowerCase(),
      status: 'active',
      isHeadquarters: true,
    });

    // Find or create SACCO Admin role
    const [roleRecord] = await Role.findOrCreate({
      where: { slug: ROLES.SACCO_ADMIN, organizationId: organization.id },
      defaults: { 
        name: 'SACCO Admin', 
        slug: ROLES.SACCO_ADMIN, 
        description: 'Full access within SACCO',
        isSystem: true 
      },
    });

    // Create admin user
    const adminUser = await User.create({
      organizationId: organization.id,
      branchId: branch.id,
      roleId: roleRecord.id,
      firstName: adminFirstName,
      lastName: adminLastName,
      email: adminEmail.toLowerCase(),
      phone: adminPhone,
      password: adminPassword,
      role: ROLES.SACCO_ADMIN,
      status: 'active',
      isEmailVerified: false,
      mustChangePassword: false,
    });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(adminUser, null);
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
    }

    logger.info(`New SACCO registered: ${name} (${code}) with admin: ${adminEmail}`);

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        code: organization.code,
        email: organization.email,
      },
      admin: {
        id: adminUser.id,
        name: `${adminUser.firstName} ${adminUser.lastName}`,
        email: adminUser.email,
      },
    };
  }

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

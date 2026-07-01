import { sequelize, Member, User, NextOfKin, MemberDocument, SavingsAccount, Loan, Role, Organization, Branch } from '../models/index.js';
import { memberRepository, savingsAccountRepository } from '../repositories/index.js';
import { NotFoundError, ConflictError, AppError } from '../utils/errors.js';
import { generateMemberNumber, generateAccountNumber, getPagination, getOrderClause } from '../utils/helpers.js';
import { SAVINGS_ACCOUNT_TYPES, MEMBER_STATUSES, ROLES } from '../constants/index.js';
import emailService from './emailService.js';
import logger from '../utils/logger.js';

class MemberService {
  async selfRegister(data) {
    const { firstName, lastName, email, phone, nationalId, dateOfBirth, address, password } = data;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      throw new ConflictError('A user with this email already exists.');
    }

    // For self-registration, we need to assign them to the first active organization
    // In a real-world scenario, you might want to have a way to select the organization
    const organization = await Organization.findOne({ where: { status: 'active' } });
    if (!organization) {
      throw new AppError('No active SACCO found. Please contact support.', 400);
    }

    // Get the main branch or first active branch
    const branch = await Branch.findOne({ 
      where: { organizationId: organization.id, status: 'active' },
      order: [['isHeadquarters', 'DESC']]
    });
    if (!branch) {
      throw new AppError('No active branch found. Please contact support.', 400);
    }

    const t = await sequelize.transaction();
    try {
      // Check for duplicate phone/nationalId in this organization
      const phoneExists = await Member.findOne({ 
        where: { phone, organizationId: organization.id } 
      });
      if (phoneExists) {
        throw new ConflictError('A member with this phone number already exists.');
      }

      const idExists = await Member.findOne({ 
        where: { nationalId, organizationId: organization.id } 
      });
      if (idExists) {
        throw new ConflictError('A member with this national ID already exists.');
      }

      // Generate member number
      const sequence = await memberRepository.getNextSequence(organization.id);
      const memberNumber = generateMemberNumber(sequence);

      // 1. Create member with pending status
      const member = await Member.create({
        organizationId: organization.id,
        branchId: branch.id,
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        nationalId,
        dateOfBirth,
        address,
        memberNumber,
        status: MEMBER_STATUSES.PENDING,
        joiningDate: new Date(),
      }, { transaction: t });

      // 2. Find or create Member role
      const [memberRole] = await Role.findOrCreate({
        where: { slug: ROLES.MEMBER, organizationId: organization.id },
        defaults: { 
          name: 'Member', 
          slug: ROLES.MEMBER, 
          description: 'Member self-service portal',
          isSystem: true 
        },
        transaction: t
      });

      // 3. Create user account (inactive until approved)
      await User.create({
        organizationId: organization.id,
        branchId: branch.id,
        roleId: memberRole.id,
        memberId: member.id,
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        password,
        role: ROLES.MEMBER,
        status: 'inactive', // Inactive until approved
        isEmailVerified: false,
        mustChangePassword: false,
      }, { transaction: t });

      await t.commit();

      // Send application received email
      try {
        // You can create a specific email template for member applications
        await emailService.sendWelcomeEmail(member);
      } catch (error) {
        logger.error('Application email failed:', error);
      }

      logger.info(`New member self-registration: ${memberNumber} - ${email}`);
      
      return {
        memberNumber,
        status: 'pending',
        message: 'Application submitted successfully'
      };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  async register(organizationId, branchId, data, createdBy) {
    const t = await sequelize.transaction();
    try {
      // Uniqueness checks
      const phoneExists = await memberRepository.findByPhone(data.phone, organizationId);
      if (phoneExists) throw new ConflictError('A member with this phone number already exists.');

      const idExists = await memberRepository.findByNationalId(data.nationalId, organizationId);
      if (idExists) throw new ConflictError('A member with this national ID already exists.');

      // Check if email is already used by another user
      if (data.email) {
        const emailExists = await User.findOne({ 
          where: { 
            email: data.email.toLowerCase(), 
            organizationId 
          } 
        });
        if (emailExists) throw new ConflictError('A user with this email already exists.');
      }

      // Generate member number
      const sequence = await memberRepository.getNextSequence(organizationId);
      const memberNumber = generateMemberNumber(sequence);

      // 1. Create member
      const member = await Member.create({
        ...data,
        organizationId,
        branchId,
        memberNumber,
        status: MEMBER_STATUSES.PENDING,
        joiningDate: data.joiningDate || new Date(),
      }, { transaction: t });

      // 2. Create user account for login if email is provided
      let tempPassword = null;
      if (data.email) {
        // Find Member role
        const [memberRole] = await Role.findOrCreate({
          where: { slug: ROLES.MEMBER, organizationId },
          defaults: { 
            name: 'Member', 
            slug: ROLES.MEMBER, 
            description: 'Member self-service portal',
            isSystem: true 
          },
          transaction: t
        });

        // Generate temporary password (format: FirstName@1234)
        tempPassword = `${data.firstName}@${Math.floor(1000 + Math.random() * 9000)}`;

        // Create user account (inactive until member is activated)
        await User.create({
          organizationId,
          branchId,
          roleId: memberRole.id,
          memberId: member.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email.toLowerCase(),
          phone: data.phone,
          password: tempPassword,
          role: ROLES.MEMBER,
          status: 'inactive',
          isEmailVerified: false,
          mustChangePassword: true,
        }, { transaction: t });
      }

      // 3. Auto-create ordinary savings account
      await SavingsAccount.create({
        organizationId,
        branchId,
        memberId: member.id,
        accountNumber: generateAccountNumber('SAV'),
        accountType: SAVINGS_ACCOUNT_TYPES.ORDINARY,
        interestRate: 6.0,
        minimumBalance: 0,
        status: 'active',
      }, { transaction: t });

      // 4. Auto-create share capital account
      await SavingsAccount.create({
        organizationId,
        branchId,
        memberId: member.id,
        accountNumber: generateAccountNumber('SHR'),
        accountType: SAVINGS_ACCOUNT_TYPES.SHARE_CAPITAL,
        interestRate: 0,
        minimumBalance: 500,
        status: 'active',
      }, { transaction: t });

      await t.commit();

      // 5. Send welcome emails (don't wait for them)
      if (member.email && tempPassword) {
        // Get organization name
        const organization = await Organization.findByPk(organizationId);
        const orgName = organization?.name || process.env.APP_NAME;

        // Send registration confirmation email (Email #1)
        emailService.sendMemberRegistrationEmail({
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          memberNumber: member.memberNumber,
        }, orgName).catch((e) =>
          logger.error('Registration email failed:', e.message)
        );

        // Send login credentials email 2 seconds later (Email #2)
        setTimeout(() => {
          emailService.sendMemberLoginCredentials({
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            memberNumber: member.memberNumber,
          }, data.email.toLowerCase(), tempPassword, orgName).catch((e) =>
            logger.error('Login credentials email failed:', e.message)
          );
        }, 2000);
      }

      logger.info(`New member registered: ${memberNumber} in org ${organizationId}`);
      return this.getById(member.id, organizationId);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  async list(organizationId, query = {}) {
    const { page, limit, offset } = getPagination(query);
    const { rows: members, count: total } = await memberRepository.findByOrganizationPaginated(
      organizationId, { limit, offset, search: query.search, status: query.status, branchId: query.branchId }
    );
    return { members, total, page, limit };
  }

  async getById(id, organizationId) {
    const member = await memberRepository.findWithDetails(id);
    if (!member || member.organizationId !== organizationId) throw new NotFoundError('Member not found.');
    return member;
  }

  async update(id, organizationId, data, updatedBy) {
    const member = await memberRepository.findOne({ where: { id, organizationId } });
    if (!member) throw new NotFoundError('Member not found.');

    // Prevent changing to a phone that belongs to another member
    if (data.phone && data.phone !== member.phone) {
      const exists = await memberRepository.findByPhone(data.phone, organizationId);
      if (exists && exists.id !== id) throw new ConflictError('Phone number already used by another member.');
    }

    await member.update(data);
    return this.getById(id, organizationId);
  }

  async activate(id, organizationId, activatedBy) {
    const t = await sequelize.transaction();
    try {
      const member = await memberRepository.findOne({ where: { id, organizationId } });
      if (!member) throw new NotFoundError('Member not found.');
      if (member.status === MEMBER_STATUSES.ACTIVE) throw new AppError('Member is already active.', 400);

      // 1. Activate member
      await member.update({
        status: MEMBER_STATUSES.ACTIVE,
        activatedAt: new Date(),
        activatedBy,
      }, { transaction: t });

      // 2. Find and activate the user account
      const userAccount = await User.findOne({ 
        where: { memberId: id, organizationId } 
      });

      if (userAccount) {
        await userAccount.update({ status: 'active' }, { transaction: t });
        
        // 3. Create savings accounts if they don't exist
        const existingAccounts = await SavingsAccount.count({ 
          where: { memberId: id, organizationId } 
        });

        if (existingAccounts === 0) {
          // Auto-create ordinary savings account
          await SavingsAccount.create({
            organizationId,
            branchId: member.branchId,
            memberId: member.id,
            accountNumber: generateAccountNumber('SAV'),
            accountType: SAVINGS_ACCOUNT_TYPES.ORDINARY,
            interestRate: 6.0,
            minimumBalance: 0,
            status: 'active',
          }, { transaction: t });

          // Auto-create share capital account
          await SavingsAccount.create({
            organizationId,
            branchId: member.branchId,
            memberId: member.id,
            accountNumber: generateAccountNumber('SHR'),
            accountType: SAVINGS_ACCOUNT_TYPES.SHARE_CAPITAL,
            interestRate: 0,
            minimumBalance: 500,
            status: 'active',
          }, { transaction: t });
        }

        await t.commit();

        // 4. Send activation email with login credentials
        if (member.email) {
          try {
            // Get the user to check if temporary password exists
            const emailData = {
              firstName: member.firstName,
              lastName: member.lastName,
              email: member.email,
              memberNumber: member.memberNumber,
              loginEmail: userAccount.email,
              // Note: For security, consider sending a password reset link instead
              portalUrl: process.env.FRONTEND_URL || 'http://localhost:5174',
            };
            await emailService.sendMemberActivationEmail(emailData);
            logger.info(`Activation email sent to member: ${member.email}`);
          } catch (emailError) {
            logger.error(`Failed to send activation email to ${member.email}:`, emailError.message);
          }
        }
      } else {
        await t.commit();
        logger.warn(`No user account found for member ${id}`);
      }

      return member;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  async suspend(id, organizationId, suspendedBy, reason) {
    const member = await memberRepository.findOne({ where: { id, organizationId } });
    if (!member) throw new NotFoundError('Member not found.');

    // Cannot suspend a member with active loans
    const activeLoans = await Loan.count({ where: { memberId: id, status: 'disbursed', organizationId } });
    if (activeLoans > 0) throw new AppError('Cannot suspend member with active loans.', 400);

    await member.update({
      status: MEMBER_STATUSES.SUSPENDED,
      suspendedAt: new Date(),
      suspendedBy,
      suspensionReason: reason,
    });
    return member;
  }

  async addNextOfKin(memberId, organizationId, data, addedBy) {
    const member = await memberRepository.findOne({ where: { id: memberId, organizationId } });
    if (!member) throw new NotFoundError('Member not found.');

    // Only one primary next of kin allowed
    if (data.isPrimary) {
      await NextOfKin.update({ isPrimary: false }, { where: { memberId, organizationId } });
    }

    return NextOfKin.create({ ...data, memberId, organizationId });
  }

  async uploadDocument(memberId, organizationId, fileInfo, uploadedBy) {
    const member = await memberRepository.findOne({ where: { id: memberId, organizationId } });
    if (!member) throw new NotFoundError('Member not found.');

    return MemberDocument.create({
      memberId,
      organizationId,
      type: fileInfo.type,
      fileName: fileInfo.filename,
      filePath: fileInfo.path,
      mimeType: fileInfo.mimetype,
      fileSize: fileInfo.size,
      uploadedBy,
    });
  }

  async getStatement(memberId, organizationId, { startDate, endDate } = {}) {
    const member = await this.getById(memberId, organizationId);
    const accounts = await savingsAccountRepository.findByMember(memberId, organizationId);

    const { SavingsTransaction } = await import('../models/index.js');
    const { Op } = await import('sequelize');

    const accountIds = accounts.map((a) => a.id);
    const where = { savingsAccountId: { [Op.in]: accountIds } };
    if (startDate) where.createdAt = { [Op.gte]: new Date(startDate) };
    if (endDate) where.createdAt = { ...(where.createdAt || {}), [Op.lte]: new Date(endDate) };

    const transactions = await SavingsTransaction.findAll({
      where,
      order: [['createdAt', 'ASC']],
      include: [{ model: SavingsAccount, as: 'account', attributes: ['accountNumber', 'accountType'] }],
    });

    return { member, accounts, transactions };
  }

  async getStats(organizationId) {
    return memberRepository.getStats(organizationId);
  }
}

export default new MemberService();

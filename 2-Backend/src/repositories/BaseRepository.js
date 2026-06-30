import { Op } from 'sequelize';
import { NotFoundError } from '../utils/errors.js';

/**
 * BaseRepository provides common CRUD operations.
 * All feature repositories extend this class.
 */
export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(options = {}) {
    return this.model.findAll(options);
  }

  async findAndCountAll(options = {}) {
    return this.model.findAndCountAll(options);
  }

  async findOne(options = {}) {
    return this.model.findOne(options);
  }

  async findById(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  async findByIdOrThrow(id, options = {}) {
    const record = await this.model.findByPk(id, options);
    if (!record) {
      throw new NotFoundError(`${this.model.name} not found`);
    }
    return record;
  }

  async create(data, options = {}) {
    return this.model.create(data, options);
  }

  async bulkCreate(data, options = {}) {
    return this.model.bulkCreate(data, options);
  }

  async update(id, data, options = {}) {
    const record = await this.findByIdOrThrow(id);
    await record.update(data, options);
    return record;
  }

  async updateWhere(where, data, options = {}) {
    return this.model.update(data, { where, ...options });
  }

  async delete(id, options = {}) {
    const record = await this.findByIdOrThrow(id);
    await record.destroy(options);
    return record;
  }

  async count(options = {}) {
    return this.model.count(options);
  }

  async exists(where) {
    const count = await this.model.count({ where });
    return count > 0;
  }

  /**
   * Build a WHERE clause with organization isolation.
   * All queries are automatically scoped to the requesting organization.
   */
  scopeToOrg(organizationId, extraWhere = {}) {
    return { organizationId, ...extraWhere };
  }

  buildSearchWhere(searchTerm, searchFields) {
    if (!searchTerm || !searchFields.length) return {};
    return {
      [Op.or]: searchFields.map((field) => ({
        [field]: { [Op.like]: `%${searchTerm}%` },
      })),
    };
  }
}

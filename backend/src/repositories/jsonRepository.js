import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/index.js';

/**
 * JsonRepository — A persistent JSON-file-backed data store.
 * Each collection is stored as a separate JSON file in the data directory.
 * Provides CRUD operations with basic querying, pagination, and sorting.
 * 
 * Limitations:
 * - All data is loaded into memory on read operations (fine for <10k records)
 * - No concurrent-write protection beyond single-process Node.js event loop
 * - No indexing — queries are linear scans
 * - For production, replace with MongoDB via the same interface
 */
export class JsonRepository {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.dataDir = path.resolve(config.dataDir);
    this.filePath = path.join(this.dataDir, `${collectionName}.json`);
    this._ensureDataDir();
  }

  _ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  _readAll() {
    try {
      if (!fs.existsSync(this.filePath)) {
        return [];
      }
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  _writeAll(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async findAll(filter = {}) {
    let records = this._readAll();
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null || value === '') continue;
      records = records.filter(r => {
        const fieldVal = r[key];
        if (fieldVal === undefined || fieldVal === null) return false;
        if (typeof value === 'string') {
          return String(fieldVal).toLowerCase().includes(value.toLowerCase());
        }
        if (Array.isArray(value)) {
          return value.includes(fieldVal);
        }
        return fieldVal === value;
      });
    }
    return records;
  }

  async findWithPagination({ filter = {}, search, searchFields = [], sort, page = 1, limit = 20 }) {
    let records = await this.findAll(filter);

    // Search across multiple fields
    if (search && searchFields.length > 0) {
      const searchLower = search.toLowerCase();
      records = records.filter(r =>
        searchFields.some(field => {
          const val = r[field];
          if (!val) return false;
          return String(val).toLowerCase().includes(searchLower);
        })
      );
    }

    // Sort
    if (sort) {
      const { field, order = 'asc' } = sort;
      records.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];
        if (aVal === undefined || aVal === null) aVal = '';
        if (bVal === undefined || bVal === null) bVal = '';
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        // Deterministic tie-break by id
        return (a.id || '').localeCompare(b.id || '');
      });
    }

    const total = records.length;
    const totalPages = Math.ceil(total / limit);
    const startIdx = (page - 1) * limit;
    const data = records.slice(startIdx, startIdx + limit);

    return { data, total, page, totalPages, limit };
  }

  async findById(id) {
    const records = this._readAll();
    return records.find(r => r.id === id) || null;
  }

  async findOne(filter) {
    const records = this._readAll();
    return records.find(r => {
      return Object.entries(filter).every(([key, value]) => r[key] === value);
    }) || null;
  }

  async create(data) {
    const records = this._readAll();
    const now = new Date().toISOString();
    const record = {
      id: data.id || uuidv4(),
      ...data,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };
    records.push(record);
    this._writeAll(records);
    return record;
  }

  async createMany(items) {
    const records = this._readAll();
    const now = new Date().toISOString();
    const newRecords = items.map(data => ({
      id: data.id || uuidv4(),
      ...data,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    }));
    records.push(...newRecords);
    this._writeAll(records);
    return newRecords;
  }

  async update(id, updates) {
    const records = this._readAll();
    const idx = records.findIndex(r => r.id === id);
    if (idx === -1) return null;
    records[idx] = {
      ...records[idx],
      ...updates,
      id, // prevent id overwrite
      updatedAt: new Date().toISOString(),
    };
    this._writeAll(records);
    return records[idx];
  }

  async delete(id) {
    const records = this._readAll();
    const idx = records.findIndex(r => r.id === id);
    if (idx === -1) return false;
    records.splice(idx, 1);
    this._writeAll(records);
    return true;
  }

  async count(filter = {}) {
    const records = await this.findAll(filter);
    return records.length;
  }

  async clear() {
    this._writeAll([]);
  }

  async exists(filter) {
    const record = await this.findOne(filter);
    return record !== null;
  }
}

// Singleton repository instances
export const matchmakerRepo = new JsonRepository('matchmakers');
export const customerRepo = new JsonRepository('customers');
export const noteRepo = new JsonRepository('notes');
export const matchRecordRepo = new JsonRepository('matchRecords');
export const activityRepo = new JsonRepository('activities');

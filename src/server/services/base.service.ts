import "server-only";

import { type Database, type Transaction } from "../db";

/**
 * Base service class to standardize common patterns across services
 */
export abstract class BaseService {
  protected readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Execute a function within a transaction context if one is provided,
   * or using the default database instance
   */
  protected executeWithTx<T>(
    fn: (tx: Transaction | Database) => Promise<T>,
    tx: Transaction | Database = this.db,
  ): Promise<T> {
    return fn(tx);
  }

  /**
   * Create a new transaction and execute the provided function within it
   */
  protected async withTransaction<T>(
    fn: (tx: Transaction) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction(async (tx) => {
      return fn(tx);
    });
  }
}

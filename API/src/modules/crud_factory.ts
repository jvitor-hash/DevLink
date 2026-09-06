import type { InferInsertModel, InferSelectModel, SQL } from "drizzle-orm";
import type { PgTable, PgTableWithColumns } from "drizzle-orm/pg-core";
import { db } from "@/client";

function crud<T extends PgTable>(table: T) {
  type Insert = InferInsertModel<T>;
  type Select = InferSelectModel<T>;

  const genericTable = table as PgTableWithColumns<any>;

  async function create(data: Insert): Promise<Select[]> {
    return (await db.insert(genericTable).values(data).returning()) as Select[];
  }

  async function createMany(data: Insert[]): Promise<Select[]> {
    return (await db.insert(genericTable).values(data).returning()) as Select[];
  }

  async function findAll(limit: number, offset: number): Promise<Select[]> {
    if (limit < 0 || limit > 100) throw new Error("Limit exceeded");
    if (offset < 0) throw new Error("Offset below 0");

    return (await db.select().from(genericTable).limit(limit).offset(offset)) as Select[];
  }

  async function findWhere(condition: SQL<unknown>): Promise<Select[]> {
    const result = (await db.select().from(genericTable).where(condition)) as Select[];

    if (result === null || result.length === 0)
      throw new Error("No results found");

    return result;
  }

  async function update(condition: SQL<unknown>, data: Partial<Insert>): Promise<Select[]> {
    return (await db.update(genericTable).set(data).where(condition).returning()) as Select[];
  }

  async function remove(condition: SQL<unknown>): Promise<Select[]> {
    return (await db.delete(genericTable).where(condition).returning()) as Select[];
  }

  return {
    create,
    createMany,
    findAll,
    findWhere,
    update,
    remove,
  };
}

export { crud };

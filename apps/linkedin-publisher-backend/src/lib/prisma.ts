import { PrismaClient } from '../generated/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), '../../shared.db');
const db = new Database(dbPath);
const adapter = new PrismaBetterSqlite3(db);

export const prisma = new PrismaClient({ adapter });

export default prisma;

import { PrismaClient } from '../generated/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), '../../shared.db');
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`,
});

export const prisma = new PrismaClient({ adapter });

export default prisma;

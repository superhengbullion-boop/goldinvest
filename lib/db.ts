import * as mariadb from "mariadb";

type GlobalDb = { pool?: mariadb.Pool };
const g = globalThis as unknown as GlobalDb;

function buildConfig(url: string): mariadb.PoolConfig {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: decodeURIComponent(u.pathname.replace(/^\//, "")),
    connectionLimit: 5,
    allowPublicKeyRetrieval: true,
    // return JS Date objects, not strings
    dateStrings: false,
    // return BigInt as number for insertId
    insertIdAsNumber: true,
  };
}

export function getPool(): mariadb.Pool {
  if (!g.pool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    g.pool = mariadb.createPool(buildConfig(url));
  }
  return g.pool;
}

export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const rows = await getPool().query(sql, params);
  return rows as T[];
}

export async function queryOne<T>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return (rows[0] as T) ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function execute(sql: string, params: unknown[] = []): Promise<any> {
  return getPool().query(sql, params);
}

export function newId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export function asBool(v: unknown): boolean {
  return v === true || v === 1 || v === "1" || v === BigInt(1);
}

export function asJson<T>(v: unknown, fallback: T): T {
  if (v == null) return fallback;
  if (typeof v === "string") {
    try { return JSON.parse(v) as T; } catch { return fallback; }
  }
  return v as T;
}

export function isDuplicateKey(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "errno" in err &&
    (err as { errno: number }).errno === 1062
  );
}

export async function disconnectDb() {
  if (g.pool) { await g.pool.end(); g.pool = undefined; }
}

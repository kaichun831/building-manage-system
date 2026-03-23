import { db as dbFirebase } from './db';
import { dbSupabase } from './db-supabase';

// 設定 DB_PROVIDER=supabase 使用 Supabase，預設使用 Firebase
export const db = process.env.DB_PROVIDER === 'supabase' ? dbSupabase : dbFirebase;

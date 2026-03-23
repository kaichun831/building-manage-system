import { createClient } from '@supabase/supabase-js';
import { User, Issue, Announcement, Chairman, Meeting, FinanceRecord } from '@/types';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase credentials not configured');
  return createClient(url, key);
}

const toISODate = (d: any) => d instanceof Date ? d.toISOString() : d;

export const dbSupabase = {
  users: {
    async getAll() {
      const { data } = await getSupabase().from('users').select('*').order('created_at', { ascending: false });
      return (data || []).map(mapUser);
    },
    async find(predicate: (u: User) => boolean) {
      const { data } = await getSupabase().from('users').select('*');
      return (data || []).map(mapUser).find(predicate);
    },
    async getById(id: string) {
      const { data } = await getSupabase().from('users').select('*').eq('id', id).single();
      return data ? mapUser(data) : null;
    },
    async push(user: Omit<User, 'id'>) {
      const { data } = await getSupabase().from('users').insert({
        email: user.email, password: user.password, name: user.name,
        unit: user.unit, role: user.role, created_at: toISODate(user.createdAt) || new Date().toISOString()
      }).select().single();
      return mapUser(data);
    },
    async update(id: string, data: Partial<User>) {
      const payload: any = {};
      if (data.name !== undefined) payload.name = data.name;
      if (data.unit !== undefined) payload.unit = data.unit;
      if (data.password !== undefined) payload.password = data.password;
      if (data.role !== undefined) payload.role = data.role;
      await getSupabase().from('users').update(payload).eq('id', id);
    },
    async delete(id: string) {
      await getSupabase().from('users').delete().eq('id', id);
    }
  },
  issues: {
    async getAll() {
      const { data } = await getSupabase().from('issues').select('*').order('created_at', { ascending: false });
      return (data || []).map(mapIssue);
    },
    async push(issue: Omit<Issue, 'id'>) {
      const { data } = await getSupabase().from('issues').insert({
        user_id: issue.userId, title: issue.title, description: issue.description,
        category: issue.category, status: issue.status,
        created_at: toISODate(issue.createdAt) || new Date().toISOString()
      }).select().single();
      return mapIssue(data);
    },
    async update(id: string, data: Partial<Issue>) {
      const payload: any = {};
      if (data.title !== undefined) payload.title = data.title;
      if (data.description !== undefined) payload.description = data.description;
      if (data.category !== undefined) payload.category = data.category;
      if (data.status !== undefined) payload.status = data.status;
      await getSupabase().from('issues').update(payload).eq('id', id);
    },
    async delete(id: string) {
      await getSupabase().from('issues').delete().eq('id', id);
    }
  },
  announcements: {
    async getAll() {
      const { data } = await getSupabase().from('announcements').select('*').order('created_at', { ascending: false });
      return (data || []).map(mapAnnouncement);
    },
    async push(a: Omit<Announcement, 'id'>) {
      const { data } = await getSupabase().from('announcements').insert({
        title: a.title, content: a.content,
        created_at: toISODate(a.createdAt) || new Date().toISOString()
      }).select().single();
      return mapAnnouncement(data);
    },
    async update(id: string, data: Partial<Announcement>) {
      const payload: any = {};
      if (data.title !== undefined) payload.title = data.title;
      if (data.content !== undefined) payload.content = data.content;
      await getSupabase().from('announcements').update(payload).eq('id', id);
    },
    async delete(id: string) {
      await getSupabase().from('announcements').delete().eq('id', id);
    }
  },
  chairmen: {
    async getAll() {
      const { data } = await getSupabase().from('chairmen').select('*').order('start_date', { ascending: false });
      return (data || []).map(mapChairman);
    },
    async find(predicate: (c: Chairman) => boolean) {
      const { data } = await getSupabase().from('chairmen').select('*');
      return (data || []).map(mapChairman).find(predicate);
    },
    async push(c: Omit<Chairman, 'id'>) {
      const { data } = await getSupabase().from('chairmen').insert({
        name: c.name, start_date: toISODate(c.startDate), end_date: toISODate(c.endDate)
      }).select().single();
      return mapChairman(data);
    },
    async update(id: string, data: Partial<Chairman>) {
      const payload: any = {};
      if (data.name !== undefined) payload.name = data.name;
      if (data.startDate !== undefined) payload.start_date = toISODate(data.startDate);
      if (data.endDate !== undefined) payload.end_date = toISODate(data.endDate);
      await getSupabase().from('chairmen').update(payload).eq('id', id);
    },
    async delete(id: string) {
      await getSupabase().from('chairmen').delete().eq('id', id);
    }
  },
  meetings: {
    async getAll() {
      const { data } = await getSupabase().from('meetings').select('*').order('date', { ascending: false });
      return (data || []).map(mapMeeting);
    },
    async push(m: Omit<Meeting, 'id'>) {
      const { data } = await getSupabase().from('meetings').insert({
        title: m.title, date: toISODate(m.date), agenda: m.agenda,
        minutes: m.minutes, attendees: m.attendees
      }).select().single();
      return mapMeeting(data);
    },
    async update(id: string, data: Partial<Meeting>) {
      const payload: any = {};
      if (data.title !== undefined) payload.title = data.title;
      if (data.date !== undefined) payload.date = toISODate(data.date);
      if (data.agenda !== undefined) payload.agenda = data.agenda;
      if (data.minutes !== undefined) payload.minutes = data.minutes;
      if (data.attendees !== undefined) payload.attendees = data.attendees;
      await getSupabase().from('meetings').update(payload).eq('id', id);
    },
    async delete(id: string) {
      await getSupabase().from('meetings').delete().eq('id', id);
    }
  },
  finance: {
    async getAll() {
      const { data } = await getSupabase().from('finance').select('*').order('date', { ascending: false });
      return (data || []).map(mapFinance);
    },
    async push(r: Omit<FinanceRecord, 'id'>) {
      const { data } = await getSupabase().from('finance').insert({
        date: toISODate(r.date), category: r.category, amount: r.amount,
        description: r.description, receipt: r.receipt || null
      }).select().single();
      return mapFinance(data);
    },
    async update(id: string, data: Partial<FinanceRecord>) {
      const payload: any = {};
      if (data.category !== undefined) payload.category = data.category;
      if (data.amount !== undefined) payload.amount = data.amount;
      if (data.description !== undefined) payload.description = data.description;
      if (data.voided !== undefined) payload.voided = data.voided;
      if (data.voidReason !== undefined) payload.void_reason = data.voidReason;
      if (data.voidedAt !== undefined) payload.voided_at = toISODate(data.voidedAt);
      await getSupabase().from('finance').update(payload).eq('id', id);
    },
    async delete(id: string) {
      await getSupabase().from('finance').delete().eq('id', id);
    }
  },
  logs: {
    async push(log: { action: string; targetId: string; targetType: string; operatorId: string; reason?: string; detail?: string }) {
      await getSupabase().from('logs').insert({
        action: log.action, target_id: log.targetId, target_type: log.targetType,
        operator_id: log.operatorId, reason: log.reason || null,
        detail: log.detail || null, created_at: new Date().toISOString()
      });
    }
  },
  resetTokens: {
    async create(userId: string, token: string) {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await getSupabase().from('reset_tokens').insert({
        token, user_id: userId, expires_at: expiresAt, used: false
      });
    },
    async get(token: string) {
      const { data } = await getSupabase().from('reset_tokens').select('*').eq('token', token).single();
      if (!data) return null;
      return { userId: data.user_id, expiresAt: data.expires_at, used: data.used };
    },
    async markUsed(token: string) {
      await getSupabase().from('reset_tokens').update({ used: true }).eq('token', token);
    }
  }
};

// ── mappers ──────────────────────────────────────────────
function mapUser(r: any): User {
  return { id: r.id, email: r.email, password: r.password, name: r.name, unit: r.unit, role: r.role, createdAt: r.created_at };
}
function mapIssue(r: any): Issue {
  return { id: r.id, userId: r.user_id, title: r.title, description: r.description, category: r.category, status: r.status, createdAt: r.created_at };
}
function mapAnnouncement(r: any): Announcement {
  return { id: r.id, title: r.title, content: r.content, createdAt: r.created_at };
}
function mapChairman(r: any): Chairman {
  return { id: r.id, name: r.name, startDate: r.start_date, endDate: r.end_date };
}
function mapMeeting(r: any): Meeting {
  return { id: r.id, title: r.title, date: r.date, agenda: r.agenda, minutes: r.minutes, attendees: r.attendees || [] };
}
function mapFinance(r: any): FinanceRecord {
  return { id: r.id, date: r.date, category: r.category, amount: r.amount, description: r.description, receipt: r.receipt, voided: r.voided, voidReason: r.void_reason, voidedAt: r.voided_at };
}

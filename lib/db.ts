import { User, Issue, Announcement, Chairman, Meeting, FinanceRecord } from '@/types';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminDb() {
  if (getApps().length === 0) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey || !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error('Firebase Admin credentials not configured');
    }
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey.replace(/\\n/g, '\n')
      })
    });
  }
  return getFirestore();
}

export const db = {
  users: {
    async getAll() {
      const adminDb = getAdminDb();
      const snapshot = await adminDb.collection('users').orderBy('createdAt', 'desc').get();
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as User));
    },
    async find(predicate: (u: User) => boolean) {
      const adminDb = getAdminDb();
      const snapshot = await adminDb.collection('users').get();
      const users = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as User));
      return users.find(predicate);
    },
    async getById(id: string) {
      const adminDb = getAdminDb();
      const doc = await adminDb.collection('users').doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() } as User;
    },
    async push(user: Omit<User, 'id'>) {
      const adminDb = getAdminDb();
      const docRef = await adminDb.collection('users').add({ ...user, createdAt: user.createdAt || new Date() });
      return { id: docRef.id, ...user };
    },
    async update(id: string, data: Partial<User>) {
      const adminDb = getAdminDb();
      await adminDb.collection('users').doc(id).update(data);
    },
    async delete(id: string) {
      const adminDb = getAdminDb();
      await adminDb.collection('users').doc(id).delete();
    }
  },
  issues: {
    async getAll() {
      const adminDb = getAdminDb();
      const snapshot = await adminDb.collection('issues').orderBy('createdAt', 'desc').get();
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    },
    async push(issue: Omit<Issue, 'id'>) {
      const adminDb = getAdminDb();
      const docRef = await adminDb.collection('issues').add({ ...issue, createdAt: issue.createdAt || new Date() });
      return { id: docRef.id, ...issue };
    },
    async update(id: string, data: Partial<Issue>) {
      const adminDb = getAdminDb();
      await adminDb.collection('issues').doc(id).update(data);
    },
    async delete(id: string) {
      const adminDb = getAdminDb();
      await adminDb.collection('issues').doc(id).delete();
    }
  },
  announcements: {
    async getAll() {
      const adminDb = getAdminDb();
      const snapshot = await adminDb.collection('announcements').orderBy('createdAt', 'desc').get();
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    },
    async push(announcement: Omit<Announcement, 'id'>) {
      const adminDb = getAdminDb();
      const docRef = await adminDb.collection('announcements').add({ ...announcement, createdAt: announcement.createdAt || new Date() });
      return { id: docRef.id, ...announcement };
    },
    async update(id: string, data: Partial<Announcement>) {
      const adminDb = getAdminDb();
      await adminDb.collection('announcements').doc(id).update(data);
    },
    async delete(id: string) {
      const adminDb = getAdminDb();
      await adminDb.collection('announcements').doc(id).delete();
    }
  },
  chairmen: {
    async getAll() {
      const adminDb = getAdminDb();
      const snapshot = await adminDb.collection('chairmen').get();
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    },
    async find(predicate: (c: Chairman) => boolean) {
      const adminDb = getAdminDb();
      const snapshot = await adminDb.collection('chairmen').get();
      const chairmen = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Chairman));
      return chairmen.find(predicate);
    },
    async push(chairman: Omit<Chairman, 'id'>) {
      const adminDb = getAdminDb();
      const docRef = await adminDb.collection('chairmen').add(chairman);
      return { id: docRef.id, ...chairman };
    },
    async update(id: string, data: Partial<Chairman>) {
      const adminDb = getAdminDb();
      await adminDb.collection('chairmen').doc(id).update(data);
    },
    async delete(id: string) {
      const adminDb = getAdminDb();
      await adminDb.collection('chairmen').doc(id).delete();
    }
  },
  meetings: {
    async getAll() {
      const adminDb = getAdminDb();
      const snapshot = await adminDb.collection('meetings').orderBy('date', 'desc').get();
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    },
    async push(meeting: Omit<Meeting, 'id'>) {
      const adminDb = getAdminDb();
      const docRef = await adminDb.collection('meetings').add({ ...meeting, date: meeting.date || new Date() });
      return { id: docRef.id, ...meeting };
    },
    async update(id: string, data: Partial<Meeting>) {
      const adminDb = getAdminDb();
      await adminDb.collection('meetings').doc(id).update(data);
    },
    async delete(id: string) {
      const adminDb = getAdminDb();
      await adminDb.collection('meetings').doc(id).delete();
    }
  },
  finance: {
    async getAll() {
      const adminDb = getAdminDb();
      const snapshot = await adminDb.collection('finance').orderBy('date', 'desc').get();
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    },
    async push(record: Omit<FinanceRecord, 'id'>) {
      const adminDb = getAdminDb();
      const docRef = await adminDb.collection('finance').add({ ...record, date: record.date || new Date() });
      return { id: docRef.id, ...record };
    },
    async update(id: string, data: Partial<FinanceRecord>) {
      const adminDb = getAdminDb();
      await adminDb.collection('finance').doc(id).update(data);
    },
    async delete(id: string) {
      const adminDb = getAdminDb();
      await adminDb.collection('finance').doc(id).delete();
    }
  },
  logs: {
    async push(log: { action: string; targetId: string; targetType: string; operatorId: string; reason?: string; detail?: string }) {
      const adminDb = getAdminDb();
      await adminDb.collection('logs').add({ ...log, createdAt: new Date() });
    }
  },
  resetTokens: {
    async create(userId: string, token: string) {
      const adminDb = getAdminDb();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await adminDb.collection('resetTokens').doc(token).set({ userId, expiresAt, used: false });
    },
    async get(token: string) {
      const adminDb = getAdminDb();
      const doc = await adminDb.collection('resetTokens').doc(token).get();
      if (!doc.exists) return null;
      return doc.data() as { userId: string; expiresAt: any; used: boolean };
    },
    async markUsed(token: string) {
      const adminDb = getAdminDb();
      await adminDb.collection('resetTokens').doc(token).update({ used: true });
    }
  }
};

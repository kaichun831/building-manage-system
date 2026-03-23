import { User, Issue, Announcement, Chairman, Meeting, FinanceRecord } from '@/types';

const memoryDb = {
  users: [] as User[],
  issues: [] as Issue[],
  announcements: [] as Announcement[],
  chairmen: [] as Chairman[],
  meetings: [] as Meeting[],
  finance: [] as FinanceRecord[]
};

memoryDb.chairmen.push({
  id: '1',
  name: '張三',
  startDate: new Date('2023-01-01'),
  endDate: new Date('2024-12-31')
});

memoryDb.announcements.push({
  id: '1',
  title: '歡迎使用大廈管理系統',
  content: '本系統提供住戶線上服務，包含議題提報、公告查詢等功能。',
  createdAt: new Date()
});

export const db = {
  users: {
    async find(predicate: (u: User) => boolean) {
      return memoryDb.users.find(predicate);
    },
    async push(user: Omit<User, 'id'>) {
      const newUser = { id: Date.now().toString(), ...user } as User;
      memoryDb.users.push(newUser);
      return newUser;
    }
  },
  issues: {
    async getAll() {
      return memoryDb.issues;
    },
    async push(issue: Omit<Issue, 'id'>) {
      const newIssue = { id: Date.now().toString(), ...issue } as Issue;
      memoryDb.issues.push(newIssue);
      return newIssue;
    }
  },
  announcements: {
    async getAll() {
      return memoryDb.announcements;
    },
    async push(announcement: Omit<Announcement, 'id'>) {
      const newAnnouncement = { id: Date.now().toString(), ...announcement } as Announcement;
      memoryDb.announcements.push(newAnnouncement);
      return newAnnouncement;
    }
  },
  chairmen: {
    async find(predicate: (c: Chairman) => boolean) {
      return memoryDb.chairmen.find(predicate);
    }
  },
  meetings: {
    async getAll() {
      return memoryDb.meetings;
    },
    async push(meeting: Omit<Meeting, 'id'>) {
      const newMeeting = { id: Date.now().toString(), ...meeting } as Meeting;
      memoryDb.meetings.push(newMeeting);
      return newMeeting;
    }
  },
  finance: {
    async getAll() {
      return memoryDb.finance;
    },
    async push(record: Omit<FinanceRecord, 'id'>) {
      const newRecord = { id: Date.now().toString(), ...record } as FinanceRecord;
      memoryDb.finance.push(newRecord);
      return newRecord;
    }
  }
};

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuditLogEvent, User } from '@/types';

interface AuditState {
  events: AuditLogEvent[];
  getLogs: (user: User | null) => AuditLogEvent[];
  addEvent: (event: AuditLogEvent) => void;
}

const seedEvents: AuditLogEvent[] = [
  {
    id: 'evt_1',
    timestamp: Date.now() - 86400000 * 2,
    actor: { id: 'rdmx6-jaaaa-aaaah-qcaiq-cai', role: 'Patient', name: 'Sarah Johnson' },
    action: 'CREATE',
    recordId: 1,
    recordTitle: 'Annual Physical Exam 2024',
    txHash: '0x123...abc',
    details: { title: 'Annual Physical Exam 2024', category: 'General Health' },
  },
  {
    id: 'evt_2',
    timestamp: Date.now() - 86400000 * 1.5,
    actor: { id: 'rdmx6-jaaaa-aaaah-qcaiq-cai', role: 'Patient', name: 'Sarah Johnson' },
    action: 'SHARE',
    recordId: 1,
    recordTitle: 'Annual Physical Exam 2024',
    target: { id: 'rrkah-fqaaa-aaaah-qcaiq-cai', role: 'Provider', name: 'Dr. Michael Chen' },
    txHash: '0x456...def',
    details: { provider: 'Dr. Michael Chen', expires: '30 days' },
  },
  {
    id: 'evt_3',
    timestamp: Date.now() - 86400000 * 1,
    actor: { id: 'rrkah-fqaaa-aaaah-qcaiq-cai', role: 'Provider', name: 'Dr. Michael Chen' },
    action: 'VIEW',
    recordId: 1,
    recordTitle: 'Annual Physical Exam 2024',
    txHash: '0x789...ghi',
    details: { ipAddress: '192.168.1.1' },
  },
  {
    id: 'evt_4',
    timestamp: Date.now() - 86400000 * 0.5,
    actor: { id: 'rrkah-fqaaa-aaaah-qcaiq-cai', role: 'Provider', name: 'Dr. Michael Chen' },
    action: 'DOWNLOAD',
    recordId: 1,
    recordTitle: 'Annual Physical Exam 2024',
    txHash: '0xabc...jkl',
    details: { format: 'PDF' },
  },
  {
    id: 'evt_5',
    timestamp: Date.now() - 86400000 * 0.2,
    actor: { id: 'rdmx6-jaaaa-aaaah-qcaiq-cai', role: 'Patient', name: 'Sarah Johnson' },
    action: 'REVOKE',
    recordId: 1,
    recordTitle: 'Annual Physical Exam 2024',
    target: { id: 'rrkah-fqaaa-aaaah-qcaiq-cai', role: 'Provider', name: 'Dr. Michael Chen' },
    txHash: '0xdef...mno',
    details: { reason: 'User action' },
  },
  {
    id: 'evt_6',
    timestamp: Date.now(),
    actor: { id: 'rdmx6-jaaaa-aaaah-admin-cai', role: 'Admin', name: 'Admin User' },
    action: 'EXPIRE',
    recordId: 2,
    recordTitle: 'Cardiology Consultation',
    target: { id: 'rjqhf-xiaaa-aaaah-qcaiq-cai', role: 'Provider', name: 'Dr. Emily Rodriguez' },
    txHash: '0xghi...pqr',
    details: { message: 'Access grant expired automatically after 90 days.' },
  },
];

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      events: seedEvents,
      getLogs: (user) => {
        if (!user) return [];
        switch (user.role) {
          case 'Admin':
            return get().events;
          case 'Patient':
            return get().events.filter(event => event.actor.id === user.principal || (event.target && event.target.id === user.principal));
          case 'Provider':
            // This is a simplified logic. A real implementation would check against a list of accessible records.
            return get().events.filter(event => event.actor.id === user.principal || (event.target && event.target.id === user.principal));
          default:
            return [];
        }
      },
      addEvent: (event) => {
        set(state => ({
          events: [...state.events, event]
        }));
      }
    }),
    {
      name: 'medivet-audit-log',
    }
  )
);

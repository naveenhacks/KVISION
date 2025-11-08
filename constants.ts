import { User, UserRole } from './types';

export const MOCK_USERS: User[] = [
    { id: 's1', name: 'Alex Johnson', email: 'alex@edu.com', role: UserRole.Student, password: 'password123' },
    { id: 's2', name: 'Maria Garcia', email: 'maria@edu.com', role: UserRole.Student, password: 'password456' },
    { id: 't1', name: 'Dr. Evelyn Reed', email: 'evelyn@edu.com', role: UserRole.Teacher, password: 'teacherpass' },
];
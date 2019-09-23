import { Session } from './session';
import { Guid } from 'guid-typescript';

class Manager {
    static readonly MAX_SESSIONS = 100;
    session: Map<string, Session> = new Map();

    public createSession(login: string, token: string): Session {
        const session = Session.create(login, token);
        if (this.session.size > Manager.MAX_SESSIONS) {
            throw new Error('Too many session on the server');
        }
        this.session.set(session.getID().toString(), session);
        return session;
    }

    public removeSession(id: Guid): void {
        const session = this.session.get(id.toString());
        if (!session) {
            throw new Error(`Cannot remove missing session ${id.toString()}`);
        }
        session.destruct();
    }
}

export const sessionManager = new Manager();
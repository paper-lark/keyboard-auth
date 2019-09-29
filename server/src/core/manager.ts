import { Session } from './session';
import { Guid } from 'guid-typescript';
import { Connection } from 'typeorm';

class Manager {
    static readonly MAX_SESSIONS = 100;
    session: Map<string, Session> = new Map();

    constructor(
        private db: Connection
    ) {}

    public async createSession(login: string, token: string): Promise<Session> {
        const session = await Session.create(login, token, this.db);
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

let manager: Manager | undefined = undefined;

export const initManager = (dbConnection: Connection) => {
    manager = new Manager(dbConnection);
};

export const getManager = (): Manager => {
    if (!!manager) {
        return manager;
    }
    throw new Error('Manager not initialized');
};
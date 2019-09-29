import { logger } from '../utils/logger';
import { KeyboardEvent } from '../utils/proto';
import { Guid } from 'guid-typescript';

export class Session {
    private id: Guid;
    private login: string;

    public static create(login: string, token: string): Session {
        // FIXME: authenticate
        const session = new Session(login);
        logger.info(`Creating session ${session.id} for user ${session.login} (token: ${token})`);
        return session;
    }

    public putKeyboardEvent(event: KeyboardEvent): boolean {
        // TODO: implement
        logger.debug(`Received new keyboard event in session ${this.id}: ${JSON.stringify(event)}`);
        return Math.random() > 0.95;
    }

    public getID(): Guid {
        return this.id;
    }

    public destruct() {
        logger.info(`Session ${this.id} destructed`);
    }

    private constructor(login: string) {
        this.id = Guid.create();
        this.login = login;
    }
}
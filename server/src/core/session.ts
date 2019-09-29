import { logger } from '../utils/logger';
import { Guid } from 'guid-typescript';
import { Connection } from 'typeorm';
import { UserEntity } from '../entities/UserEntity';
import { KeyboardEvent } from '../typings/common';

export class Session {
    private id: Guid;
    private login: string;
    private db: Connection;

    public static async create(login: string, token: string, db: Connection): Promise<Session> {
        // authenticate
        // TODO: write tests
        const count = await db.getRepository(UserEntity)
            .count({ login, token });
        if (!count) {
            throw new Error(`Authentication for user ${login} failed`);
        }

        // create session
        const session = new Session(login, db);
        logger.info(`Creating session ${session.id} for user ${session.login} (token: ${token})`);
        return session;
    }

    public putKeyboardEvent(event: KeyboardEvent): boolean {
        // TODO: implement
        logger.debug(`Received new keyboard event in session ${this.id}: ${JSON.stringify(event)}`);
        logger.debug(this.db.name);
        return Math.random() > 0.95;
    }

    public getID(): Guid {
        return this.id;
    }

    public destruct() {
        logger.info(`Session ${this.id} destructed`);
    }

    private constructor(login: string, db: Connection) {
        this.id = Guid.create();
        this.login = login;
        this.db = db;
    }
}
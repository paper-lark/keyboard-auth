import { logger } from '../utils/logger';
import { Guid } from 'guid-typescript';
import { Connection } from 'typeorm';
import { UserEntity } from '../entities/UserEntity';
import { KeyboardEvent } from '../typings/common';
import { KeyboardEventEntity } from '../entities/KeyboardEventEntity';

export class Session {
    private id: Guid;
    private login: string;
    private db: Connection;
    private user: UserEntity;

    public static async create(login: string, token: string, db: Connection): Promise<Session> {
        // authenticate
        // TODO: write tests
        const userEntity = await db.getRepository(UserEntity)
            .findOne({ login, token });
        if (!userEntity) {
            throw new Error(`Authentication for user ${login} failed`);
        }

        // create session
        const session = new Session(login, userEntity, db);
        logger.info(`Creating session ${session.id} for user ${session.login} (token: ${token})`);
        return session;
    }

    public putKeyboardEvent(event: KeyboardEvent): boolean {
        // log event
        logger.debug(`Received new keyboard event in session ${this.id}: ${JSON.stringify(event)}`);

        // authenticate
        if (!this.shouldBlockSession(event)) {
            // save event to DB
            const eventEntity = new KeyboardEventEntity();
            eventEntity.key = event.key;
            eventEntity.timestamp = event.timestamp.toDate();
            eventEntity.type = event.type;
            eventEntity.user = this.user;
            this.db.getRepository(KeyboardEventEntity)
                .save(eventEntity)
                .then(() => logger.debug(`Saved keyboard event for user ${this.login}`))
                .catch(e => logger.error(`Failed to save keyboard event: `, e));
            return false;
        }

        return true;
    }

    public getID(): Guid {
        return this.id;
    }

    public destruct() {
        logger.info(`Session ${this.id} destructed`);
    }

    private constructor(login: string, userEntity: UserEntity, db: Connection) {
        this.id = Guid.create();
        this.login = login;
        this.user = userEntity;
        this.db = db;
    }

    private shouldBlockSession(event: KeyboardEvent): boolean {
        // TODO: implement
        return Math.random() > 0.95;
    }
}
import { logger } from 'keyboard-auth-common/lib/utils/logger';
import { Guid } from 'guid-typescript';
import { Connection } from 'typeorm';
import { UserEntity } from '../entities/UserEntity';
import { KeyboardEvent, KeyboardInteraction } from '../typings/common';
import { KeyboardInteractionEntity } from '../entities/KeyboardInteractionEntity';
import { AuthenticationModel } from './auth';
import moment from 'moment';
import { Window } from './window';
import { InteractionConstructor } from './interaction';

// TODO: write tests
export class Session {
  private static interactionsLimit = 100; // TODO: change limit
  private static deviationLimit: number = 100; // TODO: change limit
  private id: Guid;
  private login: string;
  private db: Connection;
  private user: UserEntity;
  private onBlock?: () => void;
  private interaction: InteractionConstructor;
  private window: Window;
  private auth: AuthenticationModel;

  public static async create(
    login: string,
    token: string,
    db: Connection,
    onBlock?: () => void
  ): Promise<Session> {
    // authenticate
    const userEntity = await db
      .getRepository(UserEntity)
      .findOne({ login, token });
    if (!userEntity) {
      throw new Error(`Authentication for user ${login} failed`);
    }

    // create session
    const interactions = await this.findUserInteractions(db, userEntity);
    return new Session(login, userEntity, db, interactions, onBlock);
  }

  private static async findUserInteractions(
    db: Connection,
    userEntity: UserEntity
  ): Promise<KeyboardInteraction[] | undefined> {
    let interactionEntities: KeyboardInteractionEntity[] = await db
      .getRepository(KeyboardInteractionEntity)
      .find({ where: { user: userEntity }, take: this.interactionsLimit });

    if (interactionEntities.length === this.interactionsLimit) {
      return interactionEntities.map(entity => ({
        key: entity.key,
        press: moment(entity.press),
        release: moment(entity.release)
      }));
    }

    return undefined;
  }

  public putKeyboardEvent(event: KeyboardEvent) {
    logger.debug(
      `Received new keyboard event in session ${this.id}: ${JSON.stringify(
        event
      )}`
    );
    this.interaction.add(event);
  }

  public getID(): Guid {
    return this.id;
  }

  public destruct() {
    logger.info(`Session ${this.id} destructed`);
  }

  private constructor(
    login: string,
    userEntity: UserEntity,
    db: Connection,
    gt?: KeyboardInteraction[],
    onBlock?: () => void
  ) {
    this.id = Guid.create();
    this.login = login;
    this.user = userEntity;
    this.db = db;
    this.onBlock = onBlock;
    this.window = new Window(
      this.onSaveKeyboardInteraction,
      this.onAuthenticate
    );
    this.interaction = new InteractionConstructor(this.window.add);
    logger.info(`Creating session ${this.id} for user '${this.login}'`);
    if (!!gt) {
      logger.debug(`Authentication enabled in session ${this.id}`);
      this.auth = new AuthenticationModel(gt, Session.deviationLimit);
    } else {
      logger.debug(`Authentication disabled in session ${this.id}`);
    }
  }

  private onAuthenticate = (window: KeyboardInteraction[]) => {
    if (!!this.auth && !this.auth.authenticate(window)) {
      !!this.onBlock && this.onBlock();
    }
  };

  private onSaveKeyboardInteraction = (interaction: KeyboardInteraction) => {
    const entity = new KeyboardInteractionEntity();
    entity.key = interaction.key;
    entity.press = interaction.press.toDate();
    entity.release = interaction.release.toDate();
    entity.user = this.user;
    this.db
      .getRepository(KeyboardInteractionEntity)
      .save(entity)
      .then(() =>
        logger.debug(`Saved keyboard interaction for user ${this.login}`)
      )
      .catch(e => logger.error(`Failed to save keyboard interaction: `, e));
  };
}

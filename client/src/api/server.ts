import { AuthenticatorClient } from './__generated__/authenticator_grpc_pb';
import { credentials, Metadata, ClientDuplexStream } from 'grpc';
import { Event, AuthEvent, Decision, KeyboardEvent } from './__generated__/authenticator_pb';
import { KeyEvent } from '../utils/io';
import { logger } from '../utils/logger';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import moment  from 'moment';

export interface AuthenticatorConfig {
    host: string;
    login: string;
    token: string;
}

export default class Authenticator {
    private client: AuthenticatorClient;
    private authStream: ClientDuplexStream<Event, Decision>;

    constructor(
        config: AuthenticatorConfig,
        private onBlock?: () => void
    ) {
        const authEvent = new Event();
        const internalAuthEvent = new AuthEvent();
        internalAuthEvent.setLogin(config.login);
        internalAuthEvent.setToken(config.token);
        authEvent.setAuth(internalAuthEvent);

        this.client = new AuthenticatorClient(config.host, credentials.createInsecure());
        this.authStream = this.client.connect(new Metadata());
        this.authStream.write(authEvent);
        this.startProcessingEvents();
    }

    public sendKeyboardEvent(e: KeyEvent) {
        // create event timestamp
        const currentMoment = moment();
        const ts = new Timestamp();
        ts.setNanos(currentMoment.milliseconds() * 1000);
        ts.setSeconds(currentMoment.unix());

        // create proto event
        // FIXME: write the real mapper
        const event = new Event();
        const keyEvent = new KeyboardEvent();
        keyEvent.setKey('a');
        keyEvent.setTs(ts);
        keyEvent.setType(KeyboardEvent.EventType.KEYDOWN);
        event.setKeyboard(keyEvent);

        // send event
        const ok = this.authStream.write(event);
        if (ok) {
            logger.debug(`Event sent: ${JSON.stringify(e)}`);
        }
    }

    public shutdown() {
        this.authStream.cancel();
        this.client.close();
    }

    private startProcessingEvents() {
        this.authStream.on('data', this.processDecision);
        this.authStream.on('close', () => this.authStream.removeListener('data', this.processDecision));
    }

    private processDecision(event: Decision) {
        switch (event.getDecisionCase()) {
        case Decision.DecisionCase.BLOCK:
            logger.info(`Received block event, reason: ${event.getBlock()!.getReason()}`);
            !!this.onBlock && this.onBlock();
            break;

        default:
            logger.warn(`Received decision without body`);
        }
    }
}
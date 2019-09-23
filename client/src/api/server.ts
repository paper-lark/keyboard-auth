import { AuthenticatorClient } from './__generated__/authenticator_grpc_pb';
import { credentials, Metadata, ClientDuplexStream } from 'grpc';
import { Event, AuthEvent, Decision, KeyboardEvent } from './__generated__/authenticator_pb';
import { KeyEvent } from '../utils/io';
import { logger } from '../utils/logger';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import moment  from 'moment';
import { keyname } from 'os-keycode';

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

        // map keycode to key character
        const keyInfo = keyname(e.rawcode);
        if (!keyInfo) {
            logger.warn(`Keycode ${e.rawcode} failed to translate`);
            return;
        }
        const keyChar = keyInfo.key ? keyInfo.key : keyInfo.keys[0];

        // create proto event
        const event = new Event();
        const keyEvent = new KeyboardEvent();

        keyEvent.setKey(keyChar);
        keyEvent.setTs(ts);

        switch (e.type) {
        case 'keydown':
            keyEvent.setType(KeyboardEvent.EventType.KEYDOWN);
            break;
        case 'keyup':
            keyEvent.setType(KeyboardEvent.EventType.KEYUP);
            break;
        default:
            throw new Error(`Unknown keyboard event type: ${e.type}`);
        }
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
        this.authStream.on('data', this.onDecision);
        this.authStream.on('end', this.onDisconnect);
        this.authStream.on('close', this.onDisconnect);
        this.authStream.on('error', this.onError);
    }

    private onDisconnect = () => {
        logger.warn(`Server disconnected`);
        this.authStream.cancel();
        this.client.close();
    }

    private onError = (err: Error) => {
        logger.error(`Server disconnected due to error: ${err}`);
        this.authStream.cancel();
        this.client.close();
    }

    private onDecision = (event: Decision) => {
        switch (event.getDecisionCase()) {
        case Decision.DecisionCase.BLOCK:
            logger.warn(`Received block event, reason: ${event.getBlock()!.getReason()}`);
            if (!!this.onBlock) {
                this.onBlock();
            }
            break;

        default:
            logger.warn(`Received decision without body`);
        }
    }
}
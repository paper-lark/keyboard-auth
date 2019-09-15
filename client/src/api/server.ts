import { AuthenticatorClient } from '../../../proto/__generated__/authenticator_grpc_pb';
import { credentials, Metadata, ClientDuplexStream } from 'grpc';
import { Event, AuthEvent, Decision } from '../../../proto/__generated__/authenticator_pb';
import { KeyEvent } from '../utils/io';
import { logger } from '../utils/logger';

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
    }

    public sendKeyboardEvent(event: KeyEvent) {
        // FIXME: implement logic
    }

    // FIXME: write logic for reading incoming events
    private processDecision(event: Decision) {
        switch (event.getDecisionCase()) {
        case Decision.DecisionCase.BLOCK:
            logger.info(`Received block event, reason: ${event.getBlock().getReason()}`);
            this.onBlock();
            break;

        default:
            logger.warn(`Received decision without body`);
        }
    }
}
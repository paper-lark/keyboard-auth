import { AuthenticatorClient } from 'keyboard-auth-common/lib/api/authenticator_grpc_pb';
import { credentials, Metadata, ClientDuplexStream } from 'grpc';
import { Event, Decision } from 'keyboard-auth-common/lib/api/authenticator_pb';
import { KeyEvent } from '../utils/io';
import { logger } from 'keyboard-auth-common/lib/utils/logger';
import { ProtoUtils } from '../utils/proto';

export interface AuthenticatorConfig {
  host: string;
  login: string;
  token: string;
}

export default class Authenticator {
  private client: AuthenticatorClient;
  private authStream: ClientDuplexStream<Event, Decision>;

  constructor(config: AuthenticatorConfig, private onBlock?: () => void) {
    const authEvent = ProtoUtils.mapAuthEventToProto(
      config.login,
      config.token
    );

    this.client = new AuthenticatorClient(
      config.host,
      credentials.createInsecure()
    );
    this.authStream = this.client.connect(new Metadata());
    this.authStream.write(authEvent);
    this.startProcessingEvents();
  }

  public sendKeyboardEvent(e: KeyEvent) {
    // create event timestamp
    const event = ProtoUtils.mapKeyEventToProto(e);

    // send event
    if (!!event) {
      const ok = this.authStream.write(event);
      if (ok) {
        logger.debug(`Event sent: ${JSON.stringify(e)}`);
      }
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
    this.authStream.on('cancelled', this.onDisconnect);
    this.authStream.on('error', this.onError);
  }

  private onDisconnect = () => {
    logger.warn(`Server disconnected`);
    this.authStream.cancel();
    this.client.close();
  };

  private onError = (err: Error) => {
    logger.error(`Server disconnected due to error: ${err}`);
    this.authStream.cancel();
    this.client.close();
  };

  private onDecision = (event: Decision) => {
    switch (event.getDecisionCase()) {
      case Decision.DecisionCase.BLOCK:
        logger.warn(
          `Received block event, reason: ${event.getBlock()!.getReason()}`
        );
        if (!!this.onBlock) {
          this.onBlock();
        }
        break;

      default:
        logger.warn(`Received decision without body`);
    }
  };
}

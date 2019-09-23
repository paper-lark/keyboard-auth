import { Event, Decision, BlockDecision } from './__generated__/authenticator_pb';
import grpc, { ServerDuplexStream } from 'grpc';
import { AuthenticatorService } from './__generated__/authenticator_grpc_pb';
import { logger } from '../utils/logger';
import { ProtoUtils } from '../utils/proto';
import { Session } from '../core/session';
import { sessionManager } from '../core/manager';

export default class Server {

    private internal: grpc.Server;

    constructor(port: number) {
        this.internal = new grpc.Server();
        this.internal.addService(AuthenticatorService, {
            connect: this.connect
        });
        this.internal.bind(`localhost:${port}`, grpc.ServerCredentials.createInsecure());
        this.internal.start();
        logger.info(`Server started on port ${port}`);
    }

    public shutdown(): Promise<void> {
        return new Promise<void>(resolve => this.internal.tryShutdown(resolve));
    }

    public connect(call: ServerDuplexStream<Event, Decision>): void {
        let session: Session |  undefined;
        // FIXME: do not crash on errors

        const onCallEnd = () => {
            if (!!session) {
                sessionManager.removeSession(session.getID());
            }
            call.end();
        };

        const onError = (e: Error) => {
            logger.error(`Error occurred is session: ${e.message}`);
            if (!!session) {
                sessionManager.removeSession(session.getID());
            }
        };

        const onEventReceived = (event: Event) => {
            const auth = event.getAuth();
            const keyboard = event.getKeyboard();
            if (!!auth) {
                const authEvent = ProtoUtils.parseAuthEvent(auth);
                session = sessionManager.createSession(authEvent.login, authEvent.token);

            } else if (!!keyboard) {
                const keyboardEvent = ProtoUtils.parseKeyboardEvent(keyboard);
                if (!session) {
                    throw new Error('Received keyboard event before authentication was passed');
                }
                const isBlocked = session.putKeyboardEvent(keyboardEvent);
                if (isBlocked) {
                    const decision = new Decision();
                    const block = new BlockDecision();
                    block.setReason(`server blocked session ${session.getID().toString()}`);
                    decision.setBlock(block);
                    call.write(decision);
                }
            }
        };

        call.on('error', onError);
        call.on('data', onEventReceived);
        call.on('end', onCallEnd);
        call.on('close', onCallEnd);
    }
}
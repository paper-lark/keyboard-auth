import { Event, Decision, BlockDecision } from './__generated__/authenticator_pb';
import grpc, { ServerDuplexStream } from 'grpc';
import { AuthenticatorService } from './__generated__/authenticator_grpc_pb';
import { logger } from '../utils/logger';
import { ProtoUtils } from '../utils/proto';
import { Session } from '../core/session';
import { getManager } from '../core/manager';
import GRPCError from 'grpc-error';

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
        const timeout = 5000; // 5 seconds
        return new Promise<void>(resolve => {
            const timeoutID = setTimeout(() => this.internal.forceShutdown(), timeout);
            this.internal.tryShutdown(() => {
                clearTimeout(timeoutID);
                resolve();
            });
        });
    }

    public connect(call: ServerDuplexStream<Event, Decision>): void {
        // create session object
        let session: Session |  undefined;

        // create handlers
        const handleEnd = () => {
            !!session && getManager().removeSession(session.getID());
            call.end();
        };

        const handleError = (e: Error) => {
            logger.error(`Error occurred in session: `, e.message);
            !!session && getManager().removeSession(session.getID());
            call.end();
        };

        const handleEvent = async (event: Event) => {
            try {
                const auth = event.getAuth();
                const keyboard = event.getKeyboard();
                if (!!auth) {
                    const authEvent = ProtoUtils.parseAuthEvent(auth);
                    session = await getManager().createSession(authEvent.login, authEvent.token);

                } else if (!!keyboard) {
                    const keyboardEvent = ProtoUtils.parseKeyboardEvent(keyboard);
                    if (!session) {
                        throw new GRPCError('Client is not authenticated', grpc.status.UNAUTHENTICATED);
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
            } catch (e) {
                logger.error(`Error occurred in session: `, e);
                !!session && getManager().removeSession(session.getID());
                call.end(); // TODO: send error to client
            }
        };

        // add event listeners
        call.on('error', handleError);
        call.on('data', handleEvent);
        call.on('end', handleEnd);
        call.on('close', handleEnd);
    }
}
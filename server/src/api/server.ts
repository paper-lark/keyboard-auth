import { Event, Decision, BlockDecision } from './__generated__/authenticator_pb';
import grpc, { ServerDuplexStream } from 'grpc';
import { AuthenticatorService } from './__generated__/authenticator_grpc_pb';
import { logger } from '../utils/logger';
import { ProtoUtils } from '../utils/proto';
import { Session } from '../core/session';
import { getManager } from '../core/manager';
import GRPCError from 'grpc-error';
import { Mutex } from 'async-mutex';

export default class Server {
    private internal: grpc.Server;
    private readonly authenticationTimeout = 3000;

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
        const processingLock = new Mutex();
        let session: Session | undefined;
        const releaseSession = () => {
            if (!!session) {
                getManager().removeSession(session.getID());
                session = undefined;
            }
        };

        // create authentication timeout
        const authTimeout = setTimeout(
            () => {
                logger.warn(`Authentication timed out`);
                call.write(new GRPCError(`Credentials not received`, grpc.status.DEADLINE_EXCEEDED));
                call.end();
            },
            this.authenticationTimeout
        );

        // create handlers
        const handleEnd = () => {
            releaseSession();
            call.end();
        };
        const handleError = (e: Error) => {
            logger.error(`Error occurred in session: `, e);
            releaseSession();
            call.end();
        };
        const handleEvent = async (event: Event) => {
            const release = await processingLock.acquire();
            try {
                // cancel authentication timeout
                clearTimeout(authTimeout);

                // process event
                const auth = event.getAuth();
                const keyboard = event.getKeyboard();
                if (!!auth) {
                    // authentication received
                    if (!!session) {
                        throw new GRPCError('Second authentication event received', grpc.status.INVALID_ARGUMENT);
                    }
                    const authEvent = ProtoUtils.mapAuthEventFromProto(auth);
                    session = await getManager().createSession(authEvent.login, authEvent.token);

                } else if (!!keyboard) {
                    // keyboard event received
                    const keyboardEvent = ProtoUtils.mapKeyboardEventFromProto(keyboard);
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
                if (e instanceof GRPCError) {
                    call.destroy(e);
                } else {
                    call.destroy(new GRPCError(e.message, grpc.status.INTERNAL));
                }
                releaseSession();
            } finally {
                release();
            }
        };

        // add event listeners
        call.on('error', handleError);
        call.on('data', handleEvent);
        call.on('end', handleEnd);
        call.on('close', handleEnd);
    }
}
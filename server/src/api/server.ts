import { Event, Decision } from './__generated__/authenticator_pb';
import grpc, { ServerDuplexStream } from 'grpc';
import { AuthenticatorService } from './__generated__/authenticator_grpc_pb';
import { logger } from '../utils/logger';

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
        call.on('data', (event: Event) => {
            logger.info(`Received event: ${JSON.stringify(event)}`);
            // FIXME: implement
        });
        call.on('close', () => {
            logger.info('Call closed');
        });
    }
}
import { KeyboardEvent as Keyboard, AuthEvent as Auth } from '../api/__generated__/authenticator_pb';
import moment = require('moment');

export enum KeyboardEventType {
    KEYUP,
    KEYDOWN
}

export interface KeyboardEvent {
    type: KeyboardEventType;
    timestamp: moment.Moment;
    key: string;
}

export interface AuthenticationEvent {
    login: string;
    token: string;
}

export class ProtoUtils {
    public static parseKeyboardEvent(event: Keyboard): KeyboardEvent {
        const ts = event.getTs();
        if (!ts) {
            throw Error('Missing timestamp in event');
        }
        const key  = event.getKey();
        if (!key) {
            throw new Error('Missing key in event');
        }

        return {
            type: event.getType() === Keyboard.EventType.KEYDOWN ?
                KeyboardEventType.KEYDOWN :
                KeyboardEventType.KEYUP,
            timestamp: moment.unix(ts.getSeconds()).millisecond(ts.getNanos() / 1000),
            key
        };
    }

    public static parseAuthEvent(event: Auth): AuthenticationEvent {
        const login = event.getLogin();
        const token = event.getToken();
        if (!login) {
            throw new Error('Missing login in authentication');
        }
        if (!token) {
            throw new Error('Missing token in authentication');
        }

        return {
            login,
            token
        };
    }
}
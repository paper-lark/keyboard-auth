import moment from 'moment';

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
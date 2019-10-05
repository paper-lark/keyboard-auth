import { ProtoUtils } from './proto';
import { KeyboardEvent, AuthEvent } from '../api/__generated__/authenticator_pb';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import { KeyboardEventType } from '../typings/common';
import moment = require('moment');

describe('ProtoUtils', () => {
    describe('keyboard event parser', () => {
        const event = new KeyboardEvent();

        beforeEach(() => {
            const ts = new Timestamp();
            ts.setSeconds(5);
            ts.setNanos(100_000);
            event.setTs(ts);
            event.setType(KeyboardEvent.EventType.KEYDOWN);
            event.setKey('t');
        });

        it('should parse correctly', () => {
            const expected = {
                type: KeyboardEventType.KEYDOWN,
                timestamp: moment('1970-01-01T00:00:05.100Z'),
                key: 't'
            };

            const actual = ProtoUtils.mapKeyboardEventFromProto(event);
            expect(actual.timestamp.toJSON).toEqual(expected.timestamp.toJSON);
            actual.timestamp = expected.timestamp;
            expect(actual).toEqual(expected);
        });

        it('should throw error when timestamp is missing', () => {
            event.setTs(undefined);

            expect(() => ProtoUtils.mapKeyboardEventFromProto(event)).toThrowError();
        });

        it('should throw error when key is missing', () => {
            event.setKey('');

            expect(() => ProtoUtils.mapKeyboardEventFromProto(event)).toThrowError();
        });
    });

    describe('authentication event parser', () => {
        const event = new AuthEvent();

        beforeEach(() => {
            event.setLogin('tester');
            event.setToken('test-secret');
        });

        it('should parse correctly', () => {
            const expected = {
                login: 'tester',
                token: 'test-secret'
            };

            const actual = ProtoUtils.mapAuthEventFromProto(event);
            expect(actual).toEqual(expected);
        });

        it('should throw error when login is missing', () => {
            event.setLogin('');

            expect(() => ProtoUtils.mapAuthEventFromProto(event)).toThrowError();
        });

        it('should throw error when token is missing', () => {
            event.setToken('');

            expect(() => ProtoUtils.mapAuthEventFromProto(event)).toThrowError();
        });
    });
});
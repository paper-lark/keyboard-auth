import { KeyEvent } from './io';
import {
  Event,
  AuthEvent,
  KeyboardEvent
} from 'keyboard-auth-common/lib/api/authenticator_pb';
import moment from 'moment';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import { keyname } from 'os-keycode';
import { logger } from 'keyboard-auth-common/lib/utils/logger';

export namespace ProtoUtils {
  export function mapKeyEventToProto(event: KeyEvent): Event | undefined {
    const mappedKeycode = mapKeyCode(event.rawcode);
    if (!mappedKeycode) {
      return undefined;
    }
    const keyEvent = new KeyboardEvent();
    keyEvent.setKey(mappedKeycode);
    keyEvent.setTs(mapMomentToProto(event.created));
    keyEvent.setType(mapKeyEventTypeToProto(event.type));

    const e = new Event();
    e.setKeyboard(keyEvent);
    return e;
  }

  export function mapAuthEventToProto(login: string, token: string): Event {
    const authEvent = new AuthEvent();
    authEvent.setLogin(login);
    authEvent.setToken(token);

    const e = new Event();
    e.setAuth(authEvent);
    return e;
  }

  function mapKeyCode(code: number): string | undefined {
    // TODO: current implementation makes errors,
    //  replace keynames with an autogenerated table
    //  https://github.com/wurikiji/keycode-extractor/blob/master/generator.js
    const keyInfo = keyname(code);
    logger.debug(`Translated ${code} into ${JSON.stringify(keyInfo)}`);
    if (!keyInfo) {
      logger.warn(`Keycode ${code} failed to translate`);
      return undefined;
    }
    const keyChar = keyInfo.key ? keyInfo.key : keyInfo.keys[0];
    return keyChar;
  }

  function mapMomentToProto(m: moment.Moment): Timestamp {
    const ts = new Timestamp();
    ts.setNanos(m.milliseconds() * 1000);
    ts.setSeconds(m.utc().unix());
    return ts;
  }

  function mapKeyEventTypeToProto(type: string): KeyboardEvent.EventType {
    switch (type) {
      case 'keydown':
        return KeyboardEvent.EventType.KEYDOWN;
      case 'keyup':
        return KeyboardEvent.EventType.KEYUP;
      default:
        throw new Error(`Unknown keyboard event type: ${type}`);
    }
  }
}

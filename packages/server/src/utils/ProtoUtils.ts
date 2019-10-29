import {
  KeyboardEvent as Keyboard,
  AuthEvent as Auth
} from 'keyboard-auth-common/lib/api/authenticator_pb';
import moment from 'moment';
import {
  AuthenticationEvent,
  KeyboardEvent,
  KeyboardEventType
} from '../typings/common';

export class ProtoUtils {
  public static mapKeyboardEventFromProto(event: Keyboard): KeyboardEvent {
    const ts = event.getTs();
    if (!ts) {
      throw Error('Missing timestamp in event');
    }
    const key = event.getKey();
    if (!key) {
      throw new Error('Missing key in event');
    }

    return {
      type:
        event.getType() === Keyboard.EventType.KEYDOWN
          ? KeyboardEventType.KEYDOWN
          : KeyboardEventType.KEYUP,
      timestamp: moment.unix(ts.getSeconds()).millisecond(ts.getNanos() / 1000),
      key
    };
  }

  public static mapAuthEventFromProto(event: Auth): AuthenticationEvent {
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

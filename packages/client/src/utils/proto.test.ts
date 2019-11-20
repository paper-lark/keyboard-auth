import { ProtoUtils } from './proto';
import moment from 'moment';
import { KeyEvent } from './io';
import { KeyboardEvent } from 'keyboard-auth-common/lib/api/authenticator_pb';

describe('ProtoUtils', () => {
  describe('keyboard event mapper', () => {
    it('should map key press correctly', () => {
      const event: KeyEvent = {
        created: moment(),
        keycode: 33,
        rawcode: 3,
        shiftKey: false,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        type: 'keydown'
      };

      const actual = ProtoUtils.mapKeyEventToProto(event);
      expect(actual).toBeDefined();
      expect(actual!.getKeyboard()).toBeDefined();
      expect(actual!.getKeyboard()!.getType()).toBe(
        KeyboardEvent.EventType.KEYDOWN
      );
      expect(actual!.getKeyboard()!.getKey()).toBe('f');
      expect(actual!.getKeyboard()!.getTs()).toBeDefined();

      const ts = actual!.getKeyboard()!.getTs()!;
      expect(
        moment
          .unix(ts.getSeconds())
          .millisecond(ts.getNanos() / 1000)
          .toJSON()
      ).toEqual(event.created.toJSON());
    });

    it('should map key release correctly', () => {
      const event: KeyEvent = {
        created: moment(),
        keycode: 33,
        rawcode: 3,
        shiftKey: false,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        type: 'keyup'
      };

      const actual = ProtoUtils.mapKeyEventToProto(event);
      expect(actual).toBeDefined();
      expect(actual!.getKeyboard()).toBeDefined();
      expect(actual!.getKeyboard()!.getType()).toBe(
        KeyboardEvent.EventType.KEYUP
      );
      expect(actual!.getKeyboard()!.getKey()).toBe('f');
      expect(actual!.getKeyboard()!.getTs()).toBeDefined();

      const ts = actual!.getKeyboard()!.getTs()!;
      expect(
        moment
          .unix(ts.getSeconds())
          .millisecond(ts.getNanos() / 1000)
          .toJSON()
      ).toEqual(event.created.toJSON());
    });

    it('should return undefined when key code is unknown', () => {
      const event: KeyEvent = {
        created: moment(),
        keycode: 1000,
        rawcode: 1000,
        shiftKey: false,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        type: 'keydown'
      };

      const actual = ProtoUtils.mapKeyEventToProto(event);
      expect(actual).toBeUndefined();
    });
  });

  describe('authentication event mapper', () => {
    it('should map correctly', () => {
      const login = 'tester';
      const token = 'test-secret';

      const actual = ProtoUtils.mapAuthEventToProto(login, token);
      expect(actual.getAuth()).toBeDefined();
      expect(actual.getAuth()!.getLogin()).toEqual(login);
      expect(actual.getAuth()!.getToken()).toEqual(token);
    });
  });
});

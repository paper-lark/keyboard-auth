import io from 'iohook';
import { KeyLogger, KeyDownEvent, KeyUpEvent } from './io';
import range from 'lodash/range';

jest.mock('iohook');

describe('KeyLogger', () => {
    const mockIO = io as jest.Mocked<typeof io>;
    const keyDownEvent: KeyDownEvent = {
        type: 'keydown',
        keycode: 10,
        rawcode: 10,
        altKey: false,
        shiftKey: false,
        ctrlKey: false,
        metaKey: false
    };
    const keyUpEvent: KeyUpEvent = {
        type: 'keyup',
        keycode: 10,
        rawcode: 10,
        altKey: false,
        shiftKey: false,
        ctrlKey: false,
        metaKey: false
    };

    it('should call subscribe to IO events', () => {
        // create logger
        const mockOnKeyDown = jest.fn();
        const mockOnKeyUp = jest.fn();
        const logger = new KeyLogger(mockOnKeyDown, mockOnKeyUp);
        logger.destruct();

        // assert calls
        expect(mockIO.start.mock.calls.length).toBe(1);
        expect(mockIO.stop.mock.calls.length).toBe(1);
        expect(mockIO.on.mock.calls.map(e => e[0]).sort()).toEqual(['keyup', 'keydown'].sort());
    });

    it('should call callbacks when key is pressed and released', () => {
        // create logger
        const mockOnKeyDown = jest.fn();
        const mockOnKeyUp = jest.fn();
        const logger = new KeyLogger(mockOnKeyDown, mockOnKeyUp);

        // emit key events
        const keyDownHandlers = mockIO.on.mock.calls.filter(e => e[0] === 'keydown').map(e => e[1]);
        const keyUpHandlers = mockIO.on.mock.calls.filter(e => e[0] === 'keyup').map(e => e[1]);
        keyDownHandlers.forEach(handler => handler(keyDownEvent));
        keyUpHandlers.forEach(handler => handler(keyUpEvent));

        // destruct logger
        logger.destruct();

        // assert calls
        expect(mockOnKeyDown.mock.calls.length).toBe(1);
        expect(mockOnKeyUp.mock.calls.length).toBe(1);
        expect(mockOnKeyDown.mock.calls[0][0]).toBe(keyDownEvent);
        expect(mockOnKeyUp.mock.calls[0][0]).toBe(keyUpEvent);
    });

    it('should call callback once when event is triggered many times but the key state did not change', () => {
        // create logger
        const mockOnKeyDown = jest.fn();
        const mockOnKeyUp = jest.fn();
        const logger = new KeyLogger(mockOnKeyDown, mockOnKeyUp);

        // emit key events
        const keyDownHandlers = mockIO.on.mock.calls.filter(e => e[0] === 'keydown').map(e => e[1]);
        const keyUpHandlers = mockIO.on.mock.calls.filter(e => e[0] === 'keyup').map(e => e[1]);
        range(0, 3).forEach(() => keyDownHandlers.forEach(handler => handler(keyDownEvent)));
        range(0, 3).forEach(() => keyUpHandlers.forEach(handler => handler(keyUpEvent)));

        // destruct logger
        logger.destruct();

        // assert calls
        expect(mockOnKeyDown.mock.calls.length).toBe(1);
        expect(mockOnKeyUp.mock.calls.length).toBe(1);
        expect(mockOnKeyDown.mock.calls[0][0]).toBe(keyDownEvent);
        expect(mockOnKeyUp.mock.calls[0][0]).toBe(keyUpEvent);
    });
});
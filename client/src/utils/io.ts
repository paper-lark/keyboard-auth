import io from 'iohook';

export interface KeyEvent {
    keycode: number;
    rawcode: number;
    type: 'keydown' | 'keyup';
    altKey: boolean;
    shiftKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
}

export interface KeyUpEvent extends KeyEvent {
    type: 'keyup';
}

export interface KeyDownEvent extends KeyEvent {
    type: 'keydown';
}

export class KeyLogger {
    private pressedKeyCodes = new Set<number>();

    constructor(
        private onKeyDown: (event: KeyDownEvent) => void,
        private onKeyUp: (event: KeyUpEvent) => void
    ) {
        io.on('keydown', this.onKeyDownHandler);
        io.on('keyup', this.onKeyUpHandler);
        io.start(false);
    }

    public destruct(): void {
        io.stop();
    }

    private onKeyDownHandler = (event: KeyDownEvent) => {
        if (!this.pressedKeyCodes.has(event.keycode)) {
            this.pressedKeyCodes.add(event.keycode);
            this.onKeyDown(event);
        }
    }

    private onKeyUpHandler = (event: KeyUpEvent) => {
        if (this.pressedKeyCodes.has(event.keycode)) {
            this.pressedKeyCodes.delete(event.keycode);
            this.onKeyUp(event);
        }
    }
}
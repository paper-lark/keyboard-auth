import keyboard
from src.api.client import ApiClient, KeyboardEventType
from src.helpers import lock_screen
import threading
from enum import Enum


class AppState(Enum):
    Idle = 0
    Running = 1
    Stopped = 2


class App:
    """
    Main application class.
    """
    # FIXME: use logger
    def __init__(self, client: ApiClient):
        self._state_mutex = threading.Semaphore(value=1)
        self._state = AppState.Idle
        self._client = client
        self._client_thread = None

    @property
    def state(self):
        return self._state

    def start(self):
        with self._state_mutex:
            if self._state != AppState.Idle:
                return

            self._state = AppState.Running
            self._client_thread = threading.Thread(
                target=lambda: self._client.start(on_block=self._on_block)
            )
            self._client_thread.start()
            keyboard.hook(self._on_key_event)
            print('App started')

    def stop(self):
        with self._state_mutex:
            if self._state == AppState.Running:
                keyboard.unhook_all()
                self._client.stop()
                self._client_thread.join()
                print('App stopped')
            self._state = AppState.Stopped

    def _on_block(self):
        print('App is blocked')
        lock_screen()

    def _on_key_event(self, event: keyboard.KeyboardEvent):
        print('Keyboard event received: {}'.format(event))
        with self._state_mutex:
            if self._state == AppState.Running:
                event_type = KeyboardEventType.KeyDown \
                    if event.event_type == keyboard.KEY_DOWN \
                    else KeyboardEventType.KeyUp
                # TODO: use scan code
                self._client.send_keyboard_event(event_type, event.name)
            else:
                print('App not running, event ignored')
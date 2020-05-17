import grpc
from typing import Callable
from src.api.__generated__.authenticator_pb2_grpc import AuthenticatorStub
from src.api.__generated__.authenticator_pb2 import KeyboardEvent, Event, AuthEvent
from src.api.iterator import ConnectIterator
import threading
import logging
from enum import Enum
from google.protobuf.timestamp_pb2 import Timestamp


class KeyboardEventType(Enum):
    KeyDown = 0
    KeyUp = 1


class ApiClientState(Enum):
    Idle = 0,
    Connected = 1,
    Disconnected = 2


class ApiClient:
    """
    Client to authentication gRPC API.
    """
    def __init__(self, host: str, port: int, login: str, token: str):
        host = "{}:{}".format(host, port)
        self._logger = logging.getLogger('API')
        self._login = login
        self._token = token
        self._channel = grpc.insecure_channel(host)
        self._stub = AuthenticatorStub(self._channel)
        self._connect_iter = None
        self._state_mutex = threading.Semaphore(value=1)
        self._state = ApiClientState.Idle
        self._disconnect_signal = threading.Condition()
        self._logger.info('Client to host {} created'.format(host))

    def start(self, on_block: Callable):
        with self._state_mutex:
            if self._state != ApiClientState.Idle:
                return
            self._state = ApiClientState.Connected
            self._connect_iter = ConnectIterator()
            self._connect_iter.add_event(
                self._get_auth_event(self._login, self._token)
            )
            self._logger.info('Client started')

        try:
            for _ in self._stub.Connect(self._connect_iter):
                self._logger.info('Received block event')
                on_block()
        except grpc.RpcError as connect_err:
            self._logger.error('Connection interrupted, reason: {}'.format(connect_err))

        with self._disconnect_signal:
            with self._state_mutex:
                self._state = ApiClientState.Disconnected
                self._disconnect_signal.notify_all()

    def send_keyboard_event(self, event_type: KeyboardEventType, key_name: str):
        with self._state_mutex:
            if self._state != ApiClientState.Connected:
                self._logger.warning('Client not started, event ignored…')
                return
            event = self._get_keyboard_event(event_type, key_name)
            self._connect_iter.add_event(event)

    def stop(self):
        with self._state_mutex:
            was_connected = self._state == ApiClientState.Connected
            self._state = ApiClientState.Disconnected

        if was_connected:
            with self._disconnect_signal:
                self._connect_iter.close()
                self._disconnect_signal.wait()
                self._channel.close()
                self._logger.info('Client stopped')

    @staticmethod
    def _get_auth_event(login: str, token: str) -> Event:
        auth_event = AuthEvent(
            login=login,
            token=token
        )
        return Event(
            auth=auth_event
        )

    @staticmethod
    def _get_keyboard_event(event_type: KeyboardEventType, key_name: str) -> Event:
        ts = Timestamp()
        ts.GetCurrentTime()
        event_type = KeyboardEvent.KEYDOWN \
            if event_type == KeyboardEventType.KeyDown \
            else KeyboardEvent.KEYUP
        keyboard_event = KeyboardEvent(
            ts=ts,
            key=key_name,
            type=event_type
        )
        return Event(
            keyboard=keyboard_event
        )




from src.api.__generated__.authenticator_pb2 import Event
import collections
import threading


class ConnectIterator:
    def __init__(self):
        self._stop_event = threading.Event()
        self._request_condition = threading.Condition()
        self._requests = collections.deque()
        self._last_request = None

    def _next(self):
        with self._request_condition:
            while not self._requests and not self._stop_event.is_set():
                self._request_condition.wait()
            if len(self._requests) > 0:
                return self._requests.popleft()
            else:
                raise StopIteration()

    def next(self):
        return self._next()

    def __next__(self):
        return self._next()

    def add_event(self, event: Event):
        with self._request_condition:
            self._requests.append(event)
            self._request_condition.notify()

    def close(self):
        self._stop_event.set()
        with self._request_condition:
            self._request_condition.notify()

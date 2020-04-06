import signal
import sys
import logging
from src.core.app import App, AppState
from src.config import Configuration
from src.api.client import ApiClient
from src.helpers import wait_signal


def exit_gracefully(signum, frame):
    # Read more: https://stackoverflow.com/a/18115530
    signal.signal(signal.SIGINT, original_sigint)
    try:
        app.stop()
    except KeyboardInterrupt:
        print("Force quitting…")
        sys.exit(1)


if __name__ == '__main__':
    # setup logger
    logging.basicConfig(format=u'%(asctime)s [%(levelname)s] <%(name)s> %(message)s', level=logging.DEBUG)

    # store initial signal handler
    original_sigint = signal.getsignal(signal.SIGINT)
    signal.signal(signal.SIGINT, exit_gracefully)

    # initialize application
    config = Configuration()
    api = ApiClient(
        host=config.api_host,
        port=config.api_port,
        login=config.api_login,
        token=config.api_token
    )
    app = App(client=api)

    # start application
    app.start()

    # wait until application is shut down
    while app.state == AppState.Running:
        wait_signal()
    sys.exit(0)

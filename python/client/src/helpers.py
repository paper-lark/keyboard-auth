import ctypes
import signal
import time
from sys import platform
from enum import Enum
import subprocess


class OSType(Enum):
    Windows = 'Windows',
    MacOS = 'macOS',
    Linux = 'Linux'


def get_os_type() -> OSType:
    if platform == "linux" or platform == "linux2":
        return OSType.Linux
    elif platform == "darwin":
        return OSType.MacOS
    elif platform == "win32":
        return OSType.Windows
    else:
        raise RuntimeError('Unsupported OS: {}'.format(platform))


def lock_screen():
    os_type = get_os_type()
    if os_type == OSType.Windows:
        # Read more: https://stackoverflow.com/a/20733443
        ctypes.windll.user32.LockWorkStation()
    elif os_type == OSType.MacOS:
        # Read more: https://apple.stackexchange.com/a/159440
        code = subprocess.call(['pmset', 'displaysleepnow'])
        if code != 0:
            raise RuntimeError('Failed to lock system, code: {}'.format(code))
        # FIXME: support Linux
    else:
        raise RuntimeError('Lock screen not supported on {}'.format(os_type.value))


def wait_signal():
    os_type = get_os_type()
    if os_type != OSType.Windows:
        signal.pause()
    else:
        time.sleep(5)

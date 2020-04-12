import ctypes
import signal
import time
from sys import platform
from enum import Enum
import subprocess
from shutil import which

_macos_cyrillic_letter_map = {
    'й': 'q',
    'ц': 'w',
    'у': 'e',
    'к': 'r',
    'е': 't',
    'н': 'y',
    'г': 'u',
    'ш': 'i',
    'щ': 'o',
    'з': 'p',
    'х': '[',
    'ъ': ']',
    'ф': 'a',
    'ы': 's',
    'в': 'd',
    'а': 'f',
    'п': 'g',
    'р': 'h',
    'о': 'j',
    'л': 'k',
    'д': 'l',
    'ж': ';',
    'э': '',
    'ё': '\\',
    'я': 'z',
    'ч': 'x',
    'с': 'c',
    'м': 'v',
    'и': 'b',
    'т': 'n',
    'ь': 'm',
    'б': ',',
    'ю': '.',
    '>': '§'
}

_linux_lock_commands = [
    # Lock screen
    # Read more: https://askubuntu.com/questions/184728/how-do-i-lock-the-screen-from-a-terminal
    ('gnome-screensaver-command', '--lock'),
    ('cinnamon-screensaver-command', '--lock'),
    ('dm-tool', 'lock'),

    # Suspend as a fallback
    # Read more: https://askubuntu.com/questions/1792/how-can-i-suspend-hibernate-from-command-line
    ('systemctl', 'suspend'),
    ('pmi', 'action', 'suspend'),
    ('pm-suspend',)
]


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
    elif os_type == OSType.Linux:
        for command in _linux_lock_commands:
            if which(command[0]) is not None:
                try:
                    code = subprocess.call(command)
                    if code == 0:
                        return
                except:
                    pass
        raise RuntimeError('Could not lock system. Please consider installing xdg-screensaver, gnome-screensaver, cinnamon-screensaver, or dm-tool.')
    else:
        raise RuntimeError('Lock screen not supported on {}'.format(os_type.value))


def wait_signal():
    os_type = get_os_type()
    if os_type != OSType.Windows:
        signal.pause()
    else:
        time.sleep(5)

def map_keyname(keyname: str) -> str:
    os_type = get_os_type()
    if os_type == OSType.MacOS and keyname in _macos_cyrillic_letter_map:
        return _macos_cyrillic_letter_map[keyname]
    return keyname


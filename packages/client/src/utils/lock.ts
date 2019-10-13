import childProcess from 'child_process';

export class OSLock {
  public static lock() {
    switch (process.platform) {
      case 'darwin': {
        // Read more: https://apple.stackexchange.com/a/159440
        childProcess.execFileSync('pmset', ['displaysleepnow']);
        break;
      }

      case 'win32': {
        // See: https://superuser.com/questions/21179/command-line-cmd-command-to-lock-a-windows-machine
        childProcess.execFileSync('rundll32.exe', [
          'user32.dll,LockWorkStation'
        ]);
        break;
      }

      case 'linux': {
        const existingCommand = this.getLinuxLockCommand();
        if (!!existingCommand) {
          childProcess.execFileSync(existingCommand.name, [
            existingCommand.arg
          ]);
        } else {
          throw new Error(
            'No applicable command found. Please consider installing xdg-screensaver, gnome-screensaver, cinnamon-screensaver, or dm-tool, and try again.'
          );
        }
        break;
      }

      default: {
        throw new Error(`Unsupported OS '${process.platform}'`);
      }
    }
  }

  private static getLinuxLockCommand() {
    // See: https://askubuntu.com/questions/184728/how-do-i-lock-the-screen-from-a-terminal
    const commands = [
      {
        name: 'xdg-screensaver',
        arg: 'lock'
      },
      {
        name: 'gnome-screensaver-command',
        arg: '--lock'
      },
      {
        name: 'cinnamon-screensaver-command',
        arg: '--lock'
      },
      {
        name: 'dm-tool',
        arg: 'lock'
      }
    ];

    return commands.find(command => {
      try {
        const result = childProcess.execFileSync('which', [command.name], {
          encoding: 'utf8'
        });
        return result && result.length > 0;
      } catch (_) {
        return false;
      }
    });
  }
}

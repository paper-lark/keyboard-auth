import moment from 'moment';
import { KeyboardInteraction } from '../typings/common';

export class Window {
  public static readonly minWindowSize = 100;
  public static readonly maxWindowSize = 300;
  public static readonly maxPauseDuration = moment.duration(40, 'seconds');

  private window: KeyboardInteraction[] = [];
  private lastPressMoment?: moment.Moment = undefined;

  constructor(
    private onPopInteraction?: (interaction: KeyboardInteraction) => void,
    private onWindowReady?: (window: KeyboardInteraction[]) => void
  ) {}

  public add = (event: KeyboardInteraction) => {
    // calculate pause between successive clicks
    const shouldClearWindow =
      !!this.lastPressMoment &&
      Window.maxPauseDuration.asMilliseconds() <
        moment
          .duration(event.press.diff(this.lastPressMoment))
          .asMilliseconds();
    this.lastPressMoment = event.press;

    // clear window if pause limit was exceeded
    if (shouldClearWindow) {
      this.window.splice(0, this.window.length);
    }
    this.window.push(event);

    // pop old interactions
    if (this.window.length > Window.maxWindowSize) {
      const oldestInteraction = this.window.shift();
      !!this.onPopInteraction &&
        !!oldestInteraction &&
        this.onPopInteraction(oldestInteraction);
    }

    // signal that window is ready
    if (this.window.length >= Window.minWindowSize) {
      !!this.onWindowReady && this.onWindowReady(this.window);
    }
  };
}

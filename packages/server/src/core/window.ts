import moment from 'moment';
import { KeyboardEvent, KeyboardEventType } from '../typings/common';

interface KeyboardInteraction {
  key: string;
  press: moment.Moment;
  release: moment.Moment;
}

export class Window {
  public static readonly minWindowSize = 100;
  public static readonly maxWindowSize = 300;
  public static readonly maxPauseDuration = moment.duration(40, 'seconds');

  private window: KeyboardInteraction[] = [];
  private unfinishedInteractions: { [key: string]: KeyboardEvent } = {};
  private lastClickMoment?: moment.Moment;

  constructor(
    private saveInteraction?: (interaction: KeyboardInteraction) => void,
    private authenticate?: (window: KeyboardInteraction[]) => void
  ) {}

  public add(event: KeyboardEvent) {
    switch (event.type) {
      case KeyboardEventType.KEYDOWN:
        this.processKeyPress(event);
        break;
      case KeyboardEventType.KEYUP:
        this.processKeyRelease(event);
        break;
      default:
        throw new Error(`Unknown keyboard event type: ${event.type}`);
    }
  }

  private processKeyPress(pressEvent: KeyboardEvent) {
    // check pause between succeeding key presses
    if (!!this.lastClickMoment) {
      const pauseDuration = moment.duration(
        pressEvent.timestamp.diff(this.lastClickMoment)
      );
      if (
        Window.maxPauseDuration.asMilliseconds() <
        pauseDuration.asMilliseconds()
      ) {
        // pause limit is exceeded – clear the window
        this.window.splice(0, this.window.length);
        this.unfinishedInteractions = {};
      }
    }

    // add press to unfinished interactions
    this.lastClickMoment = pressEvent.timestamp;
    this.unfinishedInteractions[pressEvent.key] = pressEvent;
  }

  private processKeyRelease(releaseEvent: KeyboardEvent) {
    // find associated key press
    const pressEvent = this.unfinishedInteractions[releaseEvent.key];
    delete this.unfinishedInteractions[releaseEvent.key];
    if (!pressEvent) {
      return;
    }

    // add new interaction
    const interaction: KeyboardInteraction = {
      key: releaseEvent.key,
      press: pressEvent.timestamp,
      release: releaseEvent.timestamp
    };
    this.window.push(interaction);

    // check if old interactions should be disregarded
    if (this.window.length > Window.maxWindowSize) {
      const oldestInteraction = this.window.shift();
      !!this.saveInteraction &&
        !!oldestInteraction &&
        this.saveInteraction(oldestInteraction);
    }

    // run authentication model
    if (this.window.length >= Window.minWindowSize) {
      !!this.authenticate && this.authenticate(this.window);
    }
  }
}

import {
  KeyboardEvent,
  KeyboardInteraction,
  KeyboardEventType
} from '../typings/common';

export class InteractionConstructor {
  private unfinishedInteractions: {
    [key: string]: KeyboardEvent;
  } = {};

  constructor(
    private onInteractionComplete: (i: KeyboardInteraction) => void
  ) {}

  public add = (event: KeyboardEvent) => {
    switch (event.type) {
      case KeyboardEventType.KEYDOWN:
        return this.processKeyPress(event);
      case KeyboardEventType.KEYUP:
        return this.processKeyRelease(event);
      default:
        throw new Error(`Unknown keyboard event type: ${event.type}`);
    }
  };

  private processKeyPress = (pressEvent: KeyboardEvent) => {
    // add press to unfinished interactions
    this.unfinishedInteractions[pressEvent.key] = pressEvent;
  };

  private processKeyRelease = (releaseEvent: KeyboardEvent) => {
    // find associated key press
    const pressEvent = this.unfinishedInteractions[releaseEvent.key];
    delete this.unfinishedInteractions[releaseEvent.key];
    if (!pressEvent) {
      return;
    }

    // send new interaction
    const interaction: KeyboardInteraction = {
      key: releaseEvent.key,
      press: pressEvent.timestamp,
      release: releaseEvent.timestamp
    };
    this.onInteractionComplete(interaction);
  };
} // TODO: write tests

import noop from 'lodash/noop';
import { Window } from './window';
import { KeyboardEvent, KeyboardEventType } from '../typings/common';
import moment from 'moment';
import { InteractionConstructor } from './interaction';

describe('Window', () => {
  const mockSave = jest.fn(noop);
  const mockAuth = jest.fn(noop);
  const events: KeyboardEvent[] = [
    {
      type: KeyboardEventType.KEYDOWN,
      timestamp: moment(),
      key: 'f'
    },
    {
      type: KeyboardEventType.KEYUP,
      timestamp: moment().add(5, 'seconds'),
      key: 'f'
    },
    {
      type: KeyboardEventType.KEYDOWN,
      timestamp: moment().add(6, 'seconds'),
      key: 'a'
    },
    {
      type: KeyboardEventType.KEYUP,
      timestamp: moment().add(7, 'seconds'),
      key: 'a'
    },
    // long pause…
    {
      type: KeyboardEventType.KEYDOWN,
      timestamp: moment().add(50, 'seconds'),
      key: 'e'
    },
    {
      type: KeyboardEventType.KEYUP,
      timestamp: moment().add(53, 'seconds'),
      key: 'e'
    },
    {
      type: KeyboardEventType.KEYDOWN,
      timestamp: moment().add(52, 'seconds'),
      key: 'q'
    },
    {
      type: KeyboardEventType.KEYUP,
      timestamp: moment().add(54, 'seconds'),
      key: 'q'
    },
    {
      type: KeyboardEventType.KEYDOWN,
      timestamp: moment().add(55, 'seconds'),
      key: 'v'
    },
    {
      type: KeyboardEventType.KEYUP,
      timestamp: moment().add(59, 'seconds'),
      key: 'v'
    },
    {
      type: KeyboardEventType.KEYDOWN,
      timestamp: moment().add(56, 'seconds'),
      key: 'w'
    },
    {
      type: KeyboardEventType.KEYUP,
      timestamp: moment().add(58, 'seconds'),
      key: 'w'
    }
  ];

  beforeAll(() => {
    // tslint:disable:no-any no-string-literal
    (Window as any)['minWindowSize'] = 2;
    (Window as any)['maxWindowSize'] = 3;
    // tslint:enable
  });

  beforeEach(() => {
    mockSave.mockClear();
    mockAuth.mockClear();
  });

  it('should not authenticate until minimum size is reached', () => {
    const window = new Window(mockSave, mockAuth);
    const interaction = new InteractionConstructor(window.add);
    interaction.add(events[0]);
    interaction.add(events[1]);

    expect(mockSave.mock.calls.length).toBe(0);
    expect(mockAuth.mock.calls.length).toBe(0);
  });

  it('should authenticate once minimum size is reached', () => {
    const window = new Window(mockSave, mockAuth);
    const interaction = new InteractionConstructor(window.add);
    interaction.add(events[0]);
    interaction.add(events[1]);
    interaction.add(events[2]);
    interaction.add(events[3]);

    expect(mockSave.mock.calls.length).toBe(0);
    expect(mockAuth.mock.calls.length).toBe(1);
    expect(mockAuth.mock.calls[0][0]).toEqual([
      {
        key: events[0].key,
        press: events[0].timestamp,
        release: events[1].timestamp
      },
      {
        key: events[2].key,
        press: events[2].timestamp,
        release: events[3].timestamp
      }
    ]);
  });

  it('should clear window once pause exceeds the limit', () => {
    const window = new Window(mockSave, mockAuth);
    const interaction = new InteractionConstructor(window.add);
    interaction.add(events[2]);
    interaction.add(events[3]);
    interaction.add(events[4]);
    interaction.add(events[5]);
    interaction.add(events[6]);
    interaction.add(events[7]);

    expect(mockSave.mock.calls.length).toBe(0);
    expect(mockAuth.mock.calls.length).toBe(1);
    expect(mockAuth.mock.calls[0][0]).toEqual([
      {
        key: events[4].key,
        press: events[4].timestamp,
        release: events[5].timestamp
      },
      {
        key: events[6].key,
        press: events[6].timestamp,
        release: events[7].timestamp
      }
    ]);
  });

  it('should save old events when removing them', () => {
    const window = new Window(mockSave, mockAuth);
    const interaction = new InteractionConstructor(window.add);
    interaction.add(events[4]);
    interaction.add(events[5]);
    interaction.add(events[6]);
    interaction.add(events[7]);
    interaction.add(events[8]);
    interaction.add(events[9]);
    interaction.add(events[10]);
    interaction.add(events[11]);

    expect(mockAuth.mock.calls.length).toBe(3);
    expect(mockSave.mock.calls.length).toBe(1);
    expect(mockSave.mock.calls[0][0]).toEqual({
      key: events[4].key,
      press: events[4].timestamp,
      release: events[5].timestamp
    });
  });
});

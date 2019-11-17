import { KeyboardInteraction } from '../typings/common';

export interface DigraphDescription {
  firstKey: string;
  secondKey: string;
  timings: {
    uu: number;
    ud: number;
    dd: number;
    du: number;
  }[];
}

export interface SingleDescription {
  key: string;
  timings: number[];
}

export namespace FeatureExtractor {
  export function getDigraphs(
    window: KeyboardInteraction[]
  ): DigraphDescription[] {
    const digraphs = new Map<string, DigraphDescription>();

    const getKey = (first: KeyboardInteraction, second: KeyboardInteraction) =>
      `${first.key}-${second.key}`;

    window.forEach((current, index) => {
      if (index === 0) {
        // there is no previous interaction
        return;
      }

      const previous = window[index - 1];
      const timings = {
        uu: current.release.diff(previous.release, 'millisecond', true),
        ud: current.press.diff(previous.release, 'millisecond', true),
        du: current.release.diff(previous.press, 'millisecond', true),
        dd: current.press.diff(previous.press, 'millisecond', true)
      };

      const entry = digraphs.get(getKey(previous, current));
      if (!!entry) {
        // add new timings
        entry.timings.push(timings);
      } else {
        // create new digraph
        digraphs.set(getKey(previous, current), {
          firstKey: previous.key,
          secondKey: current.key,
          timings: [timings]
        });
      }
    });

    const result = [...digraphs.values()];
    result.sort((a, b) => -comparator(a, b)); // sort in descending order
    return result;
  }

  export function getSingle(
    window: KeyboardInteraction[]
  ): SingleDescription[] {
    const single = new Map<string, SingleDescription>();

    window.forEach(current => {
      const entry = single.get(current.key);
      const timing = current.release.diff(current.press, 'millisecond', true);
      if (!!entry) {
        // add new timings
        entry.timings.push(timing);
      } else {
        // create new single
        single.set(current.key, {
          key: current.key,
          timings: [timing]
        });
      }
    });

    const result = [...single.values()];
    result.sort((a, b) => -comparator(a, b)); // sort in descending order
    return result;
  }

  function comparator<T>(a: { timings: T[] }, b: { timings: T[] }): number {
    return (
      Number(a.timings.length > b.timings.length) -
      Number(a.timings.length < b.timings.length)
    );
  }
}

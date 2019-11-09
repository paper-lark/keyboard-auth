import {
  FeatureExtractor,
  SingleDescription,
  DigraphDescription
} from './FeatureExtractor';
import { KeyboardInteraction } from '../typings/common';
import moment from 'moment';

describe('FeatureExtractor', () => {
  const window: KeyboardInteraction[] = [
    {
      key: 'k',
      press: moment('1970-01-01T00:00:05.000Z'),
      release: moment('1970-01-01T00:00:05.120Z')
    },
    {
      key: 'y',
      press: moment('1970-01-01T00:00:05.100Z'),
      release: moment('1970-01-01T00:00:05.150Z')
    },
    {
      key: 'm',
      press: moment('1970-01-01T00:00:05.110Z'),
      release: moment('1970-01-01T00:00:05.160Z')
    },
    {
      key: 'y',
      press: moment('1970-01-01T00:00:05.170Z'),
      release: moment('1970-01-01T00:00:05.180Z')
    },
    {
      key: 'm',
      press: moment('1970-01-01T00:00:05.190Z'),
      release: moment('1970-01-01T00:00:05.250Z')
    }
  ];

  describe('single features', () => {
    it('should extract features', () => {
      const expected: SingleDescription[] = [
        {
          key: 'y',
          timings: [50, 10]
        },
        {
          key: 'm',
          timings: [50, 60]
        },
        {
          key: 'k',
          timings: [120]
        }
      ];
      const actual = FeatureExtractor.getSingle(window);

      expect(actual).toEqual(expected);
    });
  });

  describe('digraph features', () => {
    it('should extract features', () => {
      const expected: DigraphDescription[] = [
        {
          firstKey: 'y',
          secondKey: 'm',
          timings: [
            {
              dd: 10,
              ud: -40,
              uu: 10,
              du: 60
            },
            {
              dd: 20,
              ud: 10,
              uu: 70,
              du: 80
            }
          ]
        },
        {
          firstKey: 'k',
          secondKey: 'y',
          timings: [
            {
              dd: 100,
              ud: -20,
              uu: 30,
              du: 150
            }
          ]
        },
        {
          firstKey: 'm',
          secondKey: 'y',
          timings: [
            {
              dd: 60,
              ud: 10,
              uu: 20,
              du: 70
            }
          ]
        }
      ];
      const actual = FeatureExtractor.getDigraphs(window);

      expect(actual).toEqual(expected);
    });
  });
});

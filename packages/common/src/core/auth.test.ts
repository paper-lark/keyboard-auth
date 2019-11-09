import { Window } from './window';
import { KeyboardInteraction } from '../typings/common';
import moment from 'moment';
import { AuthenticationModel } from './auth';

describe('AuthenticationModel', () => {
  const groundTruth: KeyboardInteraction[] = [
    {
      key: 'm',
      press: moment('1970-01-01T00:00:00.000Z'),
      release: moment('1970-01-01T00:00:00.100Z')
    },
    {
      key: 'a',
      press: moment('1970-01-01T00:00:00.050Z'),
      release: moment('1970-01-01T00:00:00.150Z')
    },
    {
      key: 'm',
      press: moment('1970-01-01T00:00:00.150Z'),
      release: moment('1970-01-01T00:00:00.200Z')
    },
    {
      key: 'a',
      press: moment('1970-01-01T00:00:00.175Z'),
      release: moment('1970-01-01T00:00:00.250Z')
    },
    {
      key: 'w',
      press: moment('1970-01-01T00:00:00.200Z'),
      release: moment('1970-01-01T00:00:00.300Z')
    },
    {
      key: 'e',
      press: moment('1970-01-01T00:00:00.300Z'),
      release: moment('1970-01-01T00:00:00.315Z')
    },
    {
      key: 'a',
      press: moment('1970-01-01T00:00:00.310Z'),
      release: moment('1970-01-01T00:00:00.320Z')
    },
    {
      key: 'l',
      press: moment('1970-01-01T00:00:00.330Z'),
      release: moment('1970-01-01T00:00:00.350Z')
    },
    {
      key: 'l',
      press: moment('1970-01-01T00:00:00.360Z'),
      release: moment('1970-01-01T00:00:00.450Z')
    },
    {
      key: 'g',
      press: moment('1970-01-01T00:00:00.480Z'),
      release: moment('1970-01-01T00:00:00.500Z')
    },
    {
      key: 'o',
      press: moment('1970-01-01T00:00:00.485Z'),
      release: moment('1970-01-01T00:00:00.510Z')
    },
    {
      key: 't',
      press: moment('1970-01-01T00:00:00.520Z'),
      release: moment('1970-01-01T00:00:00.530Z')
    },
    {
      key: 'o',
      press: moment('1970-01-01T00:00:00.525Z'),
      release: moment('1970-01-01T00:00:00.540Z')
    },
    {
      key: 'h',
      press: moment('1970-01-01T00:00:00.535Z'),
      release: moment('1970-01-01T00:00:00.540Z')
    },
    {
      key: 'e',
      press: moment('1970-01-01T00:00:00.550Z'),
      release: moment('1970-01-01T00:00:00.590Z')
    },
    {
      key: 'l',
      press: moment('1970-01-01T00:00:00.610Z'),
      release: moment('1970-01-01T00:00:00.620Z')
    },
    {
      key: 'l',
      press: moment('1970-01-01T00:00:00.625Z'),
      release: moment('1970-01-01T00:00:00.700Z')
    }
  ];

  const input: KeyboardInteraction[] = [
    {
      key: 'k',
      press: moment('1970-01-01T00:00:05.000Z'),
      release: moment('1970-01-01T00:00:05.120Z')
    },
    {
      key: 'y',
      press: moment('1970-01-01T00:00:05.100Z'),
      release: moment('1970-01-01T00:00:05.150Z')
    }
  ];

  beforeAll(() => {
    // tslint:disable:no-any
    (Window as any).minWindowSize = 2;
    (Window as any).maxWindowSize = 3;
    // tslint:enable
  });

  it('should calculate deviation correctly', () => {
    const auth = new AuthenticationModel(groundTruth, 2);
    const actual = auth.getDeviation(input);
    expect(actual).toBeCloseTo(1.8125);
  });

  it('should authenticate if deviation is small', () => {
    const auth = new AuthenticationModel(groundTruth, 2);
    const actual = auth.authenticate(input);
    expect(actual).toBeTruthy();
  });
});

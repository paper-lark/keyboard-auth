import { Window } from './window';
import { KeyboardInteraction } from '../typings/common';
import moment from 'moment';
import { AuthenticationModel } from './auth';

describe('AuthenticationModel', () => {
  const data: KeyboardInteraction[] = [
    {
      key: '72',
      press: moment('2006-03-06T14:01:11.843Z'),
      release: moment('2006-03-06T14:01:11.937Z')
    },
    {
      key: '16',
      press: moment('2006-03-06T14:01:11.703Z'),
      release: moment('2006-03-06T14:01:11.968Z')
    },
    {
      key: '69',
      press: moment('2006-03-06T14:01:12.109Z'),
      release: moment('2006-03-06T14:01:12.203Z')
    },
    {
      key: '89',
      press: moment('2006-03-06T14:01:12.234Z'),
      release: moment('2006-03-06T14:01:12.312Z')
    },
    {
      key: '32',
      press: moment('2006-03-06T14:01:12.453Z'),
      release: moment('2006-03-06T14:01:12.562Z')
    },
    {
      key: '77',
      press: moment('2006-03-06T14:01:13.328Z'),
      release: moment('2006-03-06T14:01:13.406Z')
    },
    {
      key: '16',
      press: moment('2006-03-06T14:01:12.906Z'),
      release: moment('2006-03-06T14:01:13.484Z')
    },
    {
      key: '65',
      press: moment('2006-03-06T14:01:13.625Z'),
      release: moment('2006-03-06T14:01:13.734Z')
    },
    {
      key: '78',
      press: moment('2006-03-06T14:01:13.734Z'),
      release: moment('2006-03-06T14:01:13.796Z')
    },
    {
      key: '68',
      press: moment('2006-03-06T14:01:13.875Z'),
      release: moment('2006-03-06T14:01:13.968Z')
    },
    {
      key: '89',
      press: moment('2006-03-06T14:01:14.015Z'),
      release: moment('2006-03-06T14:01:14.093Z')
    },
    {
      key: '32',
      press: moment('2006-03-06T14:01:14.203Z'),
      release: moment('2006-03-06T14:01:14.281Z')
    },
    {
      key: '80',
      press: moment('2006-03-06T14:01:14.718Z'),
      release: moment('2006-03-06T14:01:14.812Z')
    },
    {
      key: '16',
      press: moment('2006-03-06T14:01:14.406Z'),
      release: moment('2006-03-06T14:01:14.859Z')
    },
    {
      key: '65',
      press: moment('2006-03-06T14:01:14.984Z'),
      release: moment('2006-03-06T14:01:15.093Z')
    },
    {
      key: '78',
      press: moment('2006-03-06T14:01:15.109Z'),
      release: moment('2006-03-06T14:01:15.187Z')
    },
    {
      key: '84',
      press: moment('2006-03-06T14:01:15.281Z'),
      release: moment('2006-03-06T14:01:15.375Z')
    },
    {
      key: '83',
      press: moment('2006-03-06T14:01:15.609Z'),
      release: moment('2006-03-06T14:01:15.687Z')
    },
    {
      key: '188',
      press: moment('2006-03-06T14:01:16.281Z'),
      release: moment('2006-03-06T14:01:16.375Z')
    },
    {
      key: '32',
      press: moment('2006-03-06T14:01:16.468Z'),
      release: moment('2006-03-06T14:01:16.562Z')
    }
  ];
  const gt = data.slice(0, 16);
  const input = data.slice(16);

  beforeAll(() => {
    // tslint:disable:no-any
    (Window as any).minWindowSize = 10;
    (Window as any).maxWindowSize = 15;
    // tslint:enable
  });

  it('should calculate deviation correctly', () => {
    const auth = new AuthenticationModel(gt, 2);
    const actual = auth.getDecision(input);
    expect(actual).toBeCloseTo(-62);
  });

  it.skip('should authenticate if deviation is small', () => {
    const auth = new AuthenticationModel(gt, 2);
    const actual = auth.authenticate(input);
    expect(actual).toBeTruthy();
  });
});

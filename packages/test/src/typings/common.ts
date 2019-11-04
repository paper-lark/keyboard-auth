import moment from 'moment';

// FIXME: join with common typings
export enum KeyboardEventType {
  KEYUP,
  KEYDOWN
}
export interface KeyboardEvent {
  type: KeyboardEventType;
  timestamp: moment.Moment;
  key: string;
}

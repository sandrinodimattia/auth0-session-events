import UserBlockedEventParser from './user_blocked';
import { Event, EventParser, LogStreamingEvent } from '../types';

const parsers: Array<EventParser> = [new UserBlockedEventParser()];

export default (event: LogStreamingEvent): Event | null => {
  const parser = parsers.find((p) => p.canHandle(event));
  if (parser === null || typeof parser === 'undefined') {
    return null;
  }

  return parser.parse(event);
};

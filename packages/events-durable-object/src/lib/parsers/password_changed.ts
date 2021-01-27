import { Event, EventParser, LogStreamingEvent } from '../types';

export default class PasswordChangedEventParser implements EventParser {
  canHandle(event: LogStreamingEvent): boolean {
    const { data } = event;
    return data && data.type === 'scp' && data.user_id;
  }

  parse(event: LogStreamingEvent): Event {
    const { log_id, data } = event;
    return {
      id: log_id,
      type: 'password_changed',
      date: data.date,
      user_id: data.user_id
    };
  }
}

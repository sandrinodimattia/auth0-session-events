import { Event, EventParser, LogStreamingEvent } from '../types';

export default class LogoutEventParser implements EventParser {
  canHandle(event: LogStreamingEvent): boolean {
    const { data } = event;
    return data && data.type === 'slo' && data.details && data.details.session_id && data.user_id;
  }

  parse(event: LogStreamingEvent): Event {
    const { log_id, data } = event;
    return {
      id: log_id,
      type: 'logout',
      date: data.date,
      user_id: data.user_id,
      session_id: data.details.session_id
    };
  }
}

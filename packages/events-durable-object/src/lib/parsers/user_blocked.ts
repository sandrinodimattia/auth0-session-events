import { Event, EventParser, LogStreamingEvent } from '../types';

export default class UserBlockedEventParser implements EventParser {
  canHandle(event: LogStreamingEvent): boolean {
    const { data } = event;
    return (
      data &&
      data.type === 'sapi' &&
      data.details &&
      data.details.request.method === 'patch' &&
      data.details.request.path &&
      data.details.request.path.indexOf('/api/v2/users/') === 0 &&
      data.details.request.body &&
      data.details.request.body.blocked === true &&
      data.details.response &&
      data.details.response.body &&
      data.details.response.body.user_id &&
      data.details.response.body.blocked === true
    );
  }

  parse(event: LogStreamingEvent): Event {
    const { data } = event;
    return {
      type: 'user_blocked',
      date: data.date,
      user_id: data.details.response.body.user_id
    };
  }
}

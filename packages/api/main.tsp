import "@typespec/http";

using Http;

/** Call Calendar API. Every route lives under `/api`. */
@service(#{ title: "Call Calendar API" })
@server("/api", "Call Calendar API")
namespace CallCalendar;

/** A field that failed validation. */
model ErrorDetail {
  /** JSON pointer to the field, for example `/durationMinutes`. */
  path: string;

  message: string;
}

/** The body of every 4xx and 5xx response. */
@error
model Error {
  /** A stable machine-readable code, for example `VALIDATION_ERROR` or `NOT_FOUND`. */
  code: string;

  message: string;
  details?: ErrorDetail[];
}

/** The fields of an Event Type that the Owner sets. */
model EventTypeInput {
  /** Must contain a non-space character. The server trims it before saving. */
  @minLength(1)
  @maxLength(100)
  name: string;

  /** May be empty. The server trims it before saving. */
  @maxLength(500)
  description: string;

  /** The length of the call. Must be a multiple of 15. */
  @minValue(15)
  @maxValue(540)
  durationMinutes: int32;
}

/** A kind of call the Owner offers. */
model EventType {
  /** Server-generated. */
  @format("uuid")
  id: string;

  ...EventTypeInput;
}

/** One possible start time for an Event Type. */
model SlotStart {
  /** Serialised exactly like `Date#toISOString()`. */
  start: utcDateTime;

  /** False when the start is past or the call would overlap a Booking. */
  available: boolean;
}

/** One day of the Booking Window, with every quarter-hour start whose call ends by 18:00 UTC. */
model SlotDay {
  date: plainDate;
  starts: SlotStart[];
}

/** The 14 days of the Booking Window, starting today in UTC. */
model Slots {
  days: SlotDay[];
}

@route("/event-types")
@tag("Event Types")
namespace EventTypes {
  /** Every Event Type, sorted by name. */
  @get
  op list(): EventType[];

  /** Creates an Event Type. A blank name or a duration that isn't a multiple of 15 is a 400. */
  @post
  op create(@body body: EventTypeInput): {
    @statusCode statusCode: 201;
    @body body: EventType;
  } | {
    @statusCode statusCode: 400;
    @body body: Error;
  };

  /** Every start of the Event Type in the Booking Window, each marked available or not. */
  @route("/{id}/slots")
  @get
  op slots(@path id: string): Slots | {
    @statusCode statusCode: 404;
    @body body: Error;
  };
}

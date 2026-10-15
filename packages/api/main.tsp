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
}

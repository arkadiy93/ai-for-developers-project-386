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

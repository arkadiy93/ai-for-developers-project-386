import type { components } from '@calendar/api';
import type { ErrorRequestHandler } from 'express';

type ApiError = components['schemas']['Error'];
type ErrorDetail = components['schemas']['ErrorDetail'];

interface HttpError {
  status?: number;
  message?: string;
  errors?: { path: string; message: string }[];
}

const codes: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  404: 'NOT_FOUND',
  405: 'METHOD_NOT_ALLOWED',
};

// The validator reports body fields as `/body/<field>`; the envelope uses pointers into the body.
function toDetail({ path, message }: { path: string; message: string }): ErrorDetail {
  return { path: path.replace(/^\/body(?=\/|$)/, '') || '/', message };
}

export const errorHandler: ErrorRequestHandler = (err: HttpError, _req, res, _next) => {
  const status = err.status && codes[err.status] ? err.status : 500;

  const body: ApiError =
    status === 500
      ? { code: 'INTERNAL', message: 'Internal server error' }
      : { code: codes[status], message: err.message ?? 'Request failed' };
  if (status === 400 && err.errors) {
    body.details = err.errors.map(toDetail);
  }
  if (status === 500) {
    console.error(err);
  }

  res.status(status).json(body);
};

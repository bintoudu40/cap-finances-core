// @ts-nocheck
import intl from 'react-intl-universal';

export const transformApiErrors = (errors) => {
  const fields = {};

  // Note: the backend emits underscore-separated error types (e.g.
  // EMAIL_EXISTS), not dot-separated ones — matching on the wrong format
  // here means the error silently fails to reach the user at all.
  if (
    errors.find((error) =>
      ['EMAIL_EXISTS', 'EMAIL_ALREADY_EXISTS', 'EMAIL_ALREADY_INVITED'].includes(
        error.type,
      ),
    )
  ) {
    fields.email = intl.get('email_is_already_used');
  }
  return fields;
};

/**
 * Error types that aren't tied to a specific form field — surfaced as a
 * toast instead, since setErrors() has nowhere to attach them.
 */
export const getNonFieldErrorMessage = (errors) => {
  if (errors.find((error) => error.type === 'SEAT_LIMIT_REACHED')) {
    return intl.get('team_seat_limit_reached');
  }
  return null;
};

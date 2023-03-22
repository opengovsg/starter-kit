import isEmail from 'validator/lib/isEmail';

// Returns whether the passed value is a valid whitelist email for admins.
export const isAdminEmail = (value: unknown) => {
  return (
    typeof value === 'string' &&
    isEmail(value) &&
    value.toString().endsWith('.gov.sg')
  );
};

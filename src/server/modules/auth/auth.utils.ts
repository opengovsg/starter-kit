import { createHash, getRandomValues } from 'node:crypto';
import { env } from '~/server/env';

export const createVfnToken = () => {
  const random = getRandomValues(new Uint8Array(8));
  return Buffer.from(random).toString('hex').slice(0, 6);
};

export const createTokenHash = (token: string) => {
  return createHash('sha256')
    .update(`${token}${env.OTP_HASH_SECRET}`)
    .digest('hex');
};

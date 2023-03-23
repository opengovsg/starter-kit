import wretch from 'wretch';
import { env } from '~/server/env';

type SendMailParams = {
  recipient: string;
  body: string;
  subject: string;
};

export const sendMail = async (params: SendMailParams) => {
  return await wretch('https://api.postman.gov.sg/v1/transactional/email/send')
    .auth(`Bearer ${env.POSTMAN_API_KEY}`)
    .post(params)
    .res();
};

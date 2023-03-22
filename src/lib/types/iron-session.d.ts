import { User } from '@prisma/client';
import { defaultUserSelect } from '~/server/modules/user/api/defaultUserSelect';

declare module 'iron-session' {
  interface IronSessionData {
    user: Pick<User, keyof typeof defaultUserSelect>;
  }
}

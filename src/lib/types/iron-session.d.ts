import { User } from '@prisma/client';

declare module 'iron-session' {
  interface IronSessionData {
    user?: User;
  }
}

import { cloudinary } from '~/lib/cloudinary';

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/lib/auth';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const apiSecret = cloudinary.config().api_secret!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // A timestamp is needed to generate the signature, as signatures are valid
  // for one hour in Cloudinary.
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      image_metadata: true,
    },
    apiSecret,
  );

  res.status(200).json({ timestamp, signature });
}

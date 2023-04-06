# R2 Setup

## Setup Instructions

1. Copy Account ID and create a bucket.
   ![](./create-bucket.png)
1. Create API Token with edit access. (Warning: this api token applies to all buckets)
   ![](./create-api-token.png)
1. Copy api key and secret
   ![](./api-token-success.png)
1. Allow public edit access to the bucket
   ![](./allow-public-access.png)
1. Set custom domain for the bucket
   ![](./custom-domain.png)
1. Set CORS to allow for your domain
   ![](./cors.png)

Set the following environment variables:

- `R2_ACCOUNT_ID`: **Your Cloudflare Account ID**
- `R2_BUCKET_NAME`: **Your Cloudflare Bucket Name**
- `R2_ACCESS_KEY_ID`: **R2 Access Key ID**
- `R2_SECRET_ACCESS_KEY`: **R2 Secret Access Key**
- `R2_PUBLIC_HOSTNAME`: **Your custom/dev public subdomain e.g. image.example.com**

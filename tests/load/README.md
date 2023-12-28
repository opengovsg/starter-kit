# Load Tests

## Prerequisites

- [`k6`](https://k6.io/)

## Setting up the Environment

1. Build the load test files.

   ```
   npm run test:load:build
   ```

1. Log in to the target environment with a test account and save the session cookie value.

## Runing the Load Tests

### Create Post Load Test

```
k6 run tests/load/build/create-post.test.js \
  -e SESSION_COOKIE={{ session cookie }} \
  -e BASE_URL={{ scheme }}://{{ hostname }}:{{ port }}
```

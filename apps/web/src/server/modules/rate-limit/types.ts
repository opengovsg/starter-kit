export interface RateLimiterConfig {
  /** Consumption points available per duration window */
  points?: number
  /** Duration window in seconds */
  duration?: number
  /** Consumption points available per bursty duration window */
  burstPoints?: number
  /** Burst duration window in seconds */
  burstDuration?: number
  /** Custom key prefix for namespacing different rate limiters */
  keyPrefix?: string
}

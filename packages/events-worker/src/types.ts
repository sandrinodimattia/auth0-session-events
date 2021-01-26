/**
 * The Cloudflare Worker environment.
 */
export interface WorkerEnvironment {
  /**
   * The registered namespace.
   */
  userEventSubscribers: DurableObjectNamespace;
}

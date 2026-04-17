import { AppEvent, EventType } from './event.types';

// We'll use a dynamic import for 'after' to support the futuristic Next.js version if it follows the 15+ spec
// If 'after' is not available, we fall back to a simple async execution
let afterFunc: any = null;
try {
  // @ts-ignore - 'after' might not be in the current TS types but available in runtime
  import('next/server').then(m => {
    afterFunc = m.after;
  }).catch(() => {
    afterFunc = null;
  });
} catch (e) {
  afterFunc = null;
}

type EventHandler<T extends EventType> = (event: AppEvent<T>) => Promise<void> | void;

const handlers: Record<string, EventHandler<any>[]> = {};

/**
 * Register a handler for a specific event type
 */
export function registerHandler<T extends EventType>(type: T, handler: EventHandler<T>) {
  if (!handlers[type]) {
    handlers[type] = [];
  }
  handlers[type].push(handler);
}

/**
 * Emit an event to all registered handlers
 */
export async function emitEvent<T extends EventType>(type: T, payload: AppEvent<T>['payload']) {
  const event: AppEvent<T> = {
    type,
    payload,
    timestamp: new Date().toISOString(),
  };

  const executeEvent = async () => {
    const eventHandlers = handlers[type] || [];
    
    // Execute all handlers in parallel with error isolation
    await Promise.allSettled(
      eventHandlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`[Event Engine] Error in handler for ${type}:`, error);
        }
      })
    );
  };

  // If 'after' is available, use it to ensure zero impact on response time
  if (afterFunc) {
    afterFunc(executeEvent);
  } else {
    // Fallback: trigger asynchronously without awaiting to avoid blocking the main flow
    executeEvent().catch(err => console.error('[Event Engine] Critical error:', err));
  }
}

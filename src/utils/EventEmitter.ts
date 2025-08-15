// Base event map that can be extended by specific classes
export interface EventMap {
  [event: string]: unknown[]
}

// Type-safe event callback
type EventCallback<T extends unknown[]> = (...args: T) => void

// Generic EventEmitter with type safety
export class EventEmitter<T extends EventMap = EventMap> {
  private events: Map<keyof T, EventCallback<unknown[]>[]> = new Map()

  protected emit<K extends keyof T>(event: K, ...args: T[K]): void {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => callback(...args))
    }
  }

  public on<K extends keyof T>(
    event: K,
    callback: EventCallback<T[K]>
  ): void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(callback as EventCallback<unknown[]>)
  }

  public off<K extends keyof T>(
    event: K,
    callback: EventCallback<T[K]>
  ): void {
    const callbacks = this.events.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback as EventCallback<unknown[]>)
      if (index !== -1) {
        callbacks.splice(index, 1)
      }
      if (callbacks.length === 0) {
        this.events.delete(event)
      }
    }
  }
}

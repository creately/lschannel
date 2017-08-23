import { Observable, Subject } from 'rxjs';

export class Channel<T> extends Subject<T> {
  private static instances: Map<string, Channel<any>> = new Map();

  // create
  // create creates a new Channel instance. If a channel already exists
  // with given name, it will return the existing instance without creating.
  public static create<T>(key: string): Channel<T> {
    const existingChannel = this.instances.get(key);
    if (existingChannel) {
      return existingChannel;
    }
    const newChannel = new Channel<T>(key);
    this.instances.set(key, newChannel);
    return newChannel;
  }

  // constructor
  private constructor(public key: string) {
    super();
    Observable.fromEvent<any>(window, 'storage')
      .filter(e => e.key === this.key)
      .map(e => JSON.parse(e.newValue).data)
      .subscribe(data => this.emit(data));
  }

  // next
  // next sets the value on localStorage for given key which
  // will trigger a 'storage' event on listening windows/tabs.
  public next(data: T): void {
    const event = { id: this.randomId(), data };
    const value = JSON.stringify(event);
    localStorage.setItem(this.key, value);
    this.emit(data);
  }

  // emit
  // emit emits the data to all subscribers in this window/tab.
  private emit(data: T): void {
    super.next(data);
  }

  // randomId
  // randomId creates a random string which will be used as event ids.
  private randomId(): string {
    let id = '';
    while (id.length < 16) {
      const r = Math.random().toString(36).slice(2);
      id += r.slice(0, 16 - id.length);
    }
    return id;
  }
}

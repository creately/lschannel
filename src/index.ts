import { Observable } from 'rxjs';

export class Channel<T> {
  // local
  // local is an observable of lschannel events
  public events: Observable<T>;

  // constructor
  // constructor creates a new LsChannel instance. The key parameter
  // is mandatory and will be used as the localStorage key.
  constructor(public key: string) {
    this.events = Observable.fromEvent<any>(window, 'storage')
      .filter(e => e.key === this.key)
      .map(e => JSON.parse(e.newValue).data);
  }

  // send
  // send sets the value on localStorage for given key which
  // will trigger a 'storage' event on other listening windows.
  public send(data: T): void {
    const event = { id: this.randomId(), data };
    const value = JSON.stringify(event);
    localStorage.setItem(this.key, value);
    this.dispatch(value);
  }

  // recv
  // recv returns an observable which will emit lschannel events
  // triggered by other windows. Events created by this window
  // will not trigger a "storage" event so it will not emit.
  public recv(): Observable<T> {
    return this.events;
  }

  // dispatch
  // dispatch emits a "storage" event on window object. It will use
  // the lschannel key as the key and given value as newValue.
  private dispatch(value: string) {
    const storageEvent = new StorageEvent('storage', { key: this.key, newValue: value, url: location.href });
    window.dispatchEvent(storageEvent);
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

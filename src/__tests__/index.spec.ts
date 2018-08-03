import { take, toArray } from 'rxjs/operators';
import { Channel } from '../';

describe('Channel', () => {
  function prepare() {
    const key = `test-key-${Math.random()}`;
    const ch = Channel.create<number>(key);
    return { key, ch };
  }

  function takeAndTest(count: number, action: Function, assert: Function, done: Function) {
    const { key, ch } = prepare();
    ch.pipe(
      take(count),
      toArray()
    ).subscribe({
      next: val => assert(val),
      error: err => fail(err),
      complete: () => done(),
    });
    action(key, ch);
  }

  const dispatchEvent = (key: string, val: any) => {
    const event = new StorageEvent('storage', { key, newValue: JSON.stringify(val) } as any);
    window.dispatchEvent(event);
  };

  it('should emit when window emits a "storage" event with watched key', done => {
    const action = (key: string, _ch: Channel<number>) => {
      dispatchEvent(key, { id: 'e1', data: 1 });
      dispatchEvent(key, { id: 'e2', data: 2 });
    };
    const assert = (val: any) => {
      expect(val).toEqual([1, 2]);
    };
    takeAndTest(2, action, assert, done);
  });

  it('should emit when the send method is called on the same instance', done => {
    const action = (_key: string, ch: Channel<number>) => {
      ch.next(1);
      ch.next(2);
    };
    const assert = (val: any) => {
      expect(val).toEqual([1, 2]);
    };
    takeAndTest(2, action, assert, done);
  });

  it('should emit when the send method is called on the an instance with same key', done => {
    const action = (key: string, ch: Channel<number>) => {
      const ch2 = Channel.create<number>(key);
      ch.next(1);
      ch2.next(2);
    };
    const assert = (val: any) => {
      expect(val).toEqual([1, 2]);
    };
    takeAndTest(2, action, assert, done);
  });

  it('should not emit when window emits a "storage" event with different key', done => {
    const action = (key: string, _ch: Channel<number>) => {
      dispatchEvent('not-' + key, { id: 'e0', data: 0 });
      dispatchEvent(key, { id: 'e1', data: 1 });
      dispatchEvent(key, { id: 'e2', data: 2 });
    };
    const assert = (val: any) => {
      expect(val).toEqual([1, 2]);
    };
    takeAndTest(2, action, assert, done);
  });

  it('should not emit when localStorage is changed in current browser window', done => {
    const action = (key: string, _ch: Channel<number>) => {
      localStorage.setItem(key, JSON.stringify({ id: 'e0', data: 0 }));
      dispatchEvent(key, { id: 'e1', data: 1 });
      dispatchEvent(key, { id: 'e2', data: 2 });
    };
    const assert = (val: any) => {
      expect(val).toEqual([1, 2]);
    };
    takeAndTest(2, action, assert, done);
  });

  describe('next', () => {
    it('should return undefined', () => {
      const { ch } = prepare();
      expect(ch.next(1)).toBe(undefined);
    });

    it('should modify the value for given key on local storage', () => {
      const { key, ch } = prepare();
      localStorage.setItem(key, 'previous-val');
      expect(localStorage.getItem(key)).toBe('previous-val');
      ch.next(1);
      expect(localStorage.getItem(key)).not.toBe('previous-val');
    });
  });
});

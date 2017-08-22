import { Channel } from '../';
import { Observable } from 'rxjs';

describe('Channel', () => {
  function prepare() {
    const key = `test-key-${Math.random()}`;
    const ch = new Channel<number>(key);
    return { key, ch };
  }

  describe('send', () => {
    it('should return undefined', () => {
      const { ch } = prepare();
      expect(ch.send(1)).toBe(undefined);
    });

    it('should modify the value for given key on local storage', () => {
      const { key, ch } = prepare();
      localStorage.setItem(key, 'previous-val');
      expect(localStorage.getItem(key)).toBe('previous-val');
      ch.send(1);
      expect(localStorage.getItem(key)).not.toBe('previous-val');
    });
  });

  describe('recv', () => {
    it('should return an observable', () => {
      const { ch } = prepare();
      expect(ch.recv()).toEqual(jasmine.any(Observable));
    });

    describe('return value', () => {
      it('should emit when window emits a "storage" event with watched key', async () => {
        const { key, ch } = prepare();
        const promise = ch.recv().take(2).toArray().toPromise();
        window.dispatchEvent(
          new StorageEvent('storage', { key, newValue: JSON.stringify({ id: 'e1', data: 1 }) } as any)
        );
        window.dispatchEvent(
          new StorageEvent('storage', { key, newValue: JSON.stringify({ id: 'e2', data: 2 }) } as any)
        );
        const result = await promise;
        expect(result).toEqual([1, 2]);
      });

      it('should emit when the send method is called on the same instance', async () => {
        const { ch } = prepare();
        const promise = ch.recv().take(2).toArray().toPromise();
        ch.send(1);
        ch.send(2);
        const result = await promise;
        expect(result).toEqual([1, 2]);
      });

      it('should emit when the send method is called on the an instance with same key', async () => {
        const { key, ch } = prepare();
        const promise = ch.recv().take(2).toArray().toPromise();
        const ch2 = new Channel(key);
        ch2.send(1);
        ch2.send(2);
        const result = await promise;
        expect(result).toEqual([1, 2]);
      });

      it('should not emit when window emits a "storage" event with different key', async () => {
        const { key, ch } = prepare();
        const promise = ch.recv().take(1).toArray().toPromise();
        window.dispatchEvent(
          new StorageEvent('storage', { key: 'not-key', newValue: JSON.stringify({ id: 'e1', data: 1 }) } as any)
        );
        window.dispatchEvent(
          new StorageEvent('storage', { key, newValue: JSON.stringify({ id: 'e2', data: 2 }) } as any)
        );
        const result = await promise;
        expect(result).toEqual([2]);
      });

      it('should not emit when localStorage is changed in current browser window', async () => {
        const { key, ch } = prepare();
        const promise = ch.recv().take(1).toArray().toPromise();
        localStorage.setItem(key, JSON.stringify({ id: 'e1', data: 1 }));
        window.dispatchEvent(
          new StorageEvent('storage', { key, newValue: JSON.stringify({ id: 'e2', data: 2 }) } as any)
        );
        const result = await promise;
        expect(result).toEqual([2]);
      });
    });
  });
});

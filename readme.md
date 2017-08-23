# lschannel

Send and receive messages across multiple tabs and windows. LocalStorage channels extend the RxJS subject to provide an api which will work well with applications which use Observables. To get started, first install the module with npm.

```shell
npm install @creately/lschannel
```

When creating a channel, provide a unique key to identify the channel. The key will be the key on localStorage data will be stored on.

```ts
import { Channel } from '@creately/lschannel';

// create a channel
const ch = Channel.create<number>('unique-key');

// subscribe to data
ch.subscribe((n: number) => {
  console.log('received', n)
});

// on a different tab
ch.next(1);
ch.next(2);
ch.next(3);
```

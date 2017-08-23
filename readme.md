# lschannel

Send and receive messages across multiple tabs and windows. To get started, first install the module with npm.

```shell
npm install @creately/lschannel
```

When creating a channel, provide a unique key to identify the channel. The key will be the key on localStorage data will be stored on.

```ts
import { Channel } from '@creately/lschannel';

const ch = Channel.create<number>('unique-key');

// subscribe to data
ch.recv().subscribe((n: number) => {
  console.log('received', n)
});

// on a different tab
ch.send(1);
ch.send(2);
ch.send(3);
```

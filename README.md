# NATS Event

Help emit and handle events by nats

## Installation

```
npm install --save nats-event
```

## Usage

```
const connectNats = require('nats-event')

const natsEvent = connectNats('nats://localhost:4222')
  .setEventPrefix('test') // optional
  .setQueueGroup('test') // optional, but you should provide it if you want to launch multiple instances.
  .on('error', console.error) // optional
    
natsEvent.listen('hello', msg => console.log(msg))

natsEvent.send('test.hello', 'Bob')

natsMethod.close()
```

## License

MIT
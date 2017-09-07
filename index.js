const NATS = require('nats')
const logger = require('env-pino')

const defaultOptions = {
  url: 'nats://localhost:4222',
  maxReconnectAttempts: -1, // infinite
}

module.exports = function connect (options) {
  // process options
  if (!options) options = {}
  if (typeof options === 'string') options = {url: options}
  options = Object.assign({}, defaultOptions, options)

  // connect nats
  const nats = NATS.connect(options)

  // define default event handlers
  nats.on('error', (err) => {
    logger.error(err)
    process.exit(-1)
  })
  nats.on('connect', () => logger.info('event nats connected'))
  nats.on('disconnect', () => logger.info('event nats disconnected'))
  nats.on('reconnecting', () => logger.info('event nats reconnecting'))
  nats.on('reconnect', () => logger.info('event nats reconnected'))
  nats.on('close', () => logger.info('event nats connection closed'))

  let eventPrefix = null
  let queueGroup = null

  nats.setEventPrefix = prefix => {
    eventPrefix = prefix
    return nats
  }
  nats.setQueueGroup = group => {
    queueGroup = group
    return nats
  }

  nats.send = (name, msg) => {
    nats.publish(name, msg)
  }

  /**
   * @param name
   * @param handler // async func(msg, subject)
   */
  nats.listen = (name, handler) => {
    const subject = eventPrefix ? `${eventPrefix}.${name}` : name
    nats.subscribe(subject, {queue: queueGroup}, (msg, reply, subject) => {
      Promise.resolve().then(() => handler(msg, subject)).catch(err => nats.emit('error', err))
    })
  }

  return nats
}
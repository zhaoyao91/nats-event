const NATS = require('nats')
const logger = require('simple-json-logger')

module.exports = function connect (options) {
  // process options
  options = processOptions(options)

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

  let queueGroup = null

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
    nats.subscribe(name, {queue: queueGroup}, (msg, reply, subject) => {
      Promise.resolve().then(() => handler(msg, subject)).catch(err => nats.emit('error', err))
    })
  }

  return nats
}

function processOptions (options) {
  const defaultOptions = {
    maxReconnectAttempts: -1, // infinite
  }

  if (!options) options = {}

  if (typeof options === 'string') {
    const urls = options.split(',')
    if (urls.length === 1) options = {url: urls[0]}
    else options = {servers: urls}
  }

  return Object.assign({}, defaultOptions, options)
}
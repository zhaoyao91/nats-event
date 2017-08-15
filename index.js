const NATS = require('nats')

module.exports = function connect (options) {
  const nats = NATS.connect(options)

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
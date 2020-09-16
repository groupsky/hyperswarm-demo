const hyperswarm = require('hyperswarm')
const crypto = require('crypto')

const swarm = hyperswarm()

// look for peers listed under this topic
const topic = crypto.createHash('sha256')
  .update(process.env.TOPIC || 'do me a favor and change me')
  .digest()

console.log(`topic: `, topic.toString('hex'))

const detailsToString = (details) => {
  const referrer = details.peer && details.peer.referrer ? `through ${details.peer.referrer.host}:${details.peer.referrer.port}` : 'direct'
  return `${details.client ? `${details.peer.host}:${details.peer.port} ${details.peer.local ? 'local' : ''} ${referrer}` : 'incoming'}`
}

const close = () => {
  console.log('Shutting down...')
  swarm.destroy()
}

const onError = (err) => {
  console.error(err)
}

swarm.on('listening', () => {
  const address = swarm.address()
  console.log(`Started listening on ${address.family} ${address.address}:${address.port}`)
  swarm.connectivity((err, stats) => {
    if (err) {
      onError(err)
      return
    }
    console.log(`Connectivity: ${Object.keys(stats).filter(k => stats[k]).join(', ')}`)
  })
})

swarm.on('connection', (socket, details) => {
  console.log(`  + ${details.type} ${detailsToString(details)}`)
})

swarm.on('disconnection', (socket, details) => {
  console.log(`  - ${details.type} ${detailsToString(details)}`)
})

swarm.on('error', onError)

process.on('SIGINT', close)
process.on('SIGTERM', close)

swarm.join(topic, {
  lookup: true, // find & connect to peers
  announce: true // optional- announce self as a connection target
})

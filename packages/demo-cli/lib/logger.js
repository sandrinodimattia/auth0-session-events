const pino = require('pino');

module.exports = pino({
  level: 'debug',
  prettyPrint: {
    levelFirst: true,
    translateTime: true,
    ignore: 'hostname,pid'
  },
  prettifier: require('pino-pretty')
});

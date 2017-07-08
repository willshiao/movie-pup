'use strict';

const logger = require('winston');

logger.remove(logger.transports.Console);

logger.add(logger.transports.Console, {
  level: 'debug',
  prettyPrint: true,
  colorize: true,
  silent: false,
  timestamp: false,
});

module.exports = logger;

'use strict';

const config = require('config');
const express = require('express');
// const Promise = require('bluebird');
// const fs = Promise.promisify(require('fs'));

const logger = require('./lib/logger');
require('./lib/extend').extendResponse(express.response);

const apiRoutes = require('./routes/api');

const app = express();
app.use(apiRoutes);

app.listen(config.get('app.port'), () => {
  logger.debug(`Listening on port ${config.get('app.port')}`);
});

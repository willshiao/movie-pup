'use strict';

const config = require('config');
const express = require('express');
const db = require('sqlite');
const Promise = require('bluebird');
// const fs = Promise.promisify(require('fs'));

const logger = require('./lib/logger');
require('./lib/extend').extendResponse(express.response);

const apiRoutes = require('./routes/api');

const app = express();
app.use(apiRoutes);


Promise.resolve()
  .then(() => db.open(config.get('db'), { Promise }))
  .catch(logger.error)
  .then(() => {
    app.listen(config.get('app.port'), () => {
      logger.debug(`Listening on port ${config.get('app.port')}`);
    });
  });

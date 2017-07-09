'use strict';

const logger = require('../lib/logger');

module.exports.extendResponse = function extendResponse(response) {
  response.successJson = function successJson(data = {}) {
    return this.json({
      status: 'success',
      data,
    });
  };

  response.errorJson = function errorJson(err) {
    logger.error(err);
    return this.json({
      status: 'error',
      error: err.message || err,
    });
  };

  response.failMsg = function failMsg(msg) {
    return this.json({
      status: 'fail',
      message: msg,
    });
  };

  response.errorMsg = function errorMsg(msg) {
    return this.json({
      status: 'error',
      message: msg,
    });
  };
};

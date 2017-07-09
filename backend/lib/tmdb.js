'use strict';

const rp = require('request-promise');
const config = require('config');

const options = {
  uri: config.get('tmDB.url'),
  qs: {
    api_key: config.get('tmDB.apiKey'),
    include_adult: false,
  },
  json: true,
};

function findMovieByKeywords(keywords) {
  options.qs.with_keywords = keywords.join(',');
  return rp.get(options);
}

function findMovieByKeyword(keyword) {
  options.qs.with_keywords = keyword;
  return rp.get(options);
}

module.exports = { findMovieByKeywords, findMovieByKeyword };

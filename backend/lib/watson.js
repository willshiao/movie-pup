'use strict';

const config = require('config');
const Promise = require('bluebird');
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

const nlu = new NaturalLanguageUnderstandingV1(Object.assign(config.get('watson'), {
  'version_date': NaturalLanguageUnderstandingV1.VERSION_DATE_2017_02_27
}));

const parameters = {
  url: '',
  features: {
    entities: {
      emotion: true,
      sentiment: true,
      limit: 10,
    },
    keywords: {
      emotion: true,
      sentiment: true,
      limit: 10,
    },
  },
};

const asyncAnalyze = Promise.promisify(nlu.analyze);

function processUrl(url, cb) {
  parameters.url = url;
  return asyncAnalyze(parameters).asCallback(cb);
}

module.exports = { processUrl };

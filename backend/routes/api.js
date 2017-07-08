'use strict';

const config = require('config');
// const Promise = require('bluebird');
const router = require('express').Router();
const db = require('sqlite');
const bodyParser = require('body-parser');
const _ = require('lodash');
const watson = require('../lib/watson');

router.use(bodyParser.json());

function cleanUp(word) {
  return word.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/ +/g, ' ');
}

//---------------------------
// Routes
//---------------------------
router.get('/', (req, res) => res.successJson({ msg: 'It works!' }));

router.get('/history', (req, res) => {
  if(!res.body) return res.failMsg('Missing body');

  // Asssume input is sorted by "rank" field, which is calculated by the client
  const items = _.map(res.body, (item) => {
    item.title = cleanUp(item.title);
    return item;
  });

  // const topItems = items.slice(config.get('ranking.topHistory'));

  db.all('SELECT * FROM tags LIMIT 100')
    .then((data) => {
      res.successJson(data);
    })
    .catch(err => res.errorJson(err));
});

router.get('/watson', (req, res) => {
  watson.processUrl('https://en.wikipedia.org/wiki/Sheelagh_Nefdt')
    .then(res => res.successJson(res));
});

module.exports = router;

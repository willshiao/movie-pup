'use strict';

const config = require('config');
// const Promise = require('bluebird');
const router = require('express').Router();
const db = require('sqlite');
const bodyParser = require('body-parser');
const _ = require('lodash');
const watson = require('../lib/watson');
const tmdb = require('../lib/tmdb');

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
    .then(info => res.successJson(info));
});

router.get('/findTags', (req, res) => {
  console.time('findTags');
  let watsonInfo;

  watson.processUrl('https://en.wikipedia.org/wiki/Chess')
    .then((info) => {
      console.log('Got: ', info);
      const queries = [];
      info.keywords.forEach((item) => {
        queries.push(db.all("SELECT * FROM tags WHERE (name LIKE ?)", cleanUp(item.text)));
      });
      return Promise.all(queries);
    })
    .then(matching => {
      const items = _(matching).flatten().uniqBy('id').value();

      console.log('Found tags: ', items);
      // const ids = _.map(items, 'id');
      const requests = [];

      items.forEach((item) => {
        requests.push(tmdb.findMovieByKeyword(item.id));
      });
      return Promise.all(requests);
    })
    .then((movieLists) => {
      console.log('Got multiple movies: ', movieLists);
      movieLists = _.map(movieLists, 'results');
      let weight = 1;
      const masterList = movieLists[0];
      masterList.forEach(m => m.weight = weight);

      movieLists.slice(1).forEach((movieList) => {
        weight /= 2;
        movieList.forEach((movie) => {
          if(_.includes(masterList, movie)) {
            const foundItem = _.find(masterList, movie);
            foundItem.weight += weight;
          } else {
            movie.weight = weight;
            masterList.push(movie);
          }
        });
      });
      console.timeEnd('findTags');
      return res.successJson(_.orderBy(masterList, 'weight', 'desc'));
    });
});

module.exports = router;

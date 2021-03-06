'use strict';

const config = require('config');
const Promise = require('bluebird');
const router = require('express').Router();
const db = require('sqlite');
const bodyParser = require('body-parser');
const _ = require('lodash');
const watson = require('../lib/watson');
const tmdb = require('../lib/tmdb');
const logger = require('../lib/logger');

router.use(bodyParser.json());

function cleanUp(word) {
  // console.log('Word:', typeof word, word);
  const newWord = word
    .toLowerCase()
    .replace(/free|stream|live|watch|online|tips|resign|button/g, '')
    // .replace(/\(.*\)/g, ' ')
    .replace(/[^a-z ]/g, ' ')
    .replace(/ +/g, ' ');
  return (newWord.length < 2) ? '' : newWord;
}

/**
 * @param  { [[ {keywords: [ {text: String, relevance: Number} ]} ]] }   Nested array of keyword objects
 * @return {[[{id: Number, name: String}]]}                              Nested array of tags
 */
function findTags(info) {
  if(info && info.keywords) console.log('Got: ', info.map(a => a.keywords));

  const pageInfos = _.flatten(info);
  const queries = [];
  pageInfos.forEach((pageInfo) => {
    if(!pageInfo || !pageInfo.keywords) return;
    pageInfo.keywords = pageInfo.keywords.map(i => cleanUp(i.text)).filter(i => i);
    pageInfo.keywords.forEach((keyword) => {
      queries.push(db.all('SELECT * FROM tags WHERE (name LIKE ?)', keyword)
        .catch(err => logger.error(err)));
    });
  });
  return Promise.all(queries);
}

/**
 * Find movies based on matching tags
 * @param  {[[{id: Number, name: String}]]}   Nested array of tags
 * @return {Promise([[Movie]])}               Nested array of movies
 */
function findMovies(matching) {
  let items = _(matching).flatten().uniqBy('id').value();
  if(items.length > 20) items = items.slice(0, 20);

  console.log('Found tags: ', items);
  // const ids = _.map(items, 'id');
  const requests = [];

  items.forEach((item) => {
    requests.push(tmdb.findMovieByKeyword(item.id));
  });
  return Promise.all(requests);
}

//---------------------------
// Routes
//---------------------------

router.get('/', (req, res) => res.successJson({ msg: 'It works!' }));

router.post('/history', (req, res) => {
  if(!req.body) return res.failMsg('Missing body');

  console.time('history');
  // Asssume input is sorted by "rank" field, which is calculated by the client
  const historyItems = _.map(req.body, (item) => { // Clean up movie titles, might be used later
    item.title = cleanUp(item.title);
    return item;
  }).filter(item => item); // Remove empty titles (after cleanup)

  const topUrls = _.map(historyItems, 'url').slice(0, 5); // Get top 5 URLs
  const toParse = [];
  topUrls.forEach((url) => {
    toParse.push(watson.processUrl(url).catch(err => logger.error(err)));
  });
  let keyTags;

  return Promise.all(toParse)
    .then(findTags)
    .then((data) => {
      keyTags = _(data).flatten().uniqBy('id').value();
      let weight = 1;
      keyTags.forEach((tag) => {
        tag.weight = weight;
        weight /= 1.1;
      });
      return Promise.resolve(data);
    })
    .then(findMovies)
    .then((tMovieLists) => {
      console.log('Got multiple movies: ', tMovieLists);
      const movieLists = _.map(tMovieLists, 'results');
      let weight = 1;

      if(movieLists.length === 0) return res.failMsg('No matching movies found.');
      let masterList = movieLists[0];
      masterList.forEach((m) => { m.weight = weight; });

      movieLists.slice(1).forEach((movieList) => {
        weight /= 1.1;
        movieList.forEach((movie) => {
          const index = _.findIndex(masterList, target => target.id === movie.id);
          if(index >= 0) {
            masterList[index].weight += weight;
            console.log('Added weight: ', masterList[index].weight);
          } else {
            movie.weight = weight;
            masterList.push(movie);
          }
        });
      });

      if(masterList.length > 7) {
        // Group movies by weight and remove ones with more than 3 items and then flatten
        masterList = _(masterList)
          .groupBy('weight');
        if(masterList.keys().value().length === 1) {
          masterList = masterList
            .values()
            .flatten()
            .value();
        } else {
          masterList = masterList
            .mapValues((group) => {
              console.log('Group:', group);
              if(group.length > 4) return group.slice(0, 4);
              return group;
            })
            .values()
            .flatten()
            .value();
        }
      }
      console.timeEnd('history');
      return res.json({
        status: 'success',
        data: _.orderBy(masterList, 'weight', 'desc'),
        keywords: keyTags,
      });
    })
    .catch(err => res.errorJson(err));

  // const topItems = items.slice(config.get('ranking.topHistory'));

  // db.all('SELECT * FROM tags LIMIT 100')
  //   .then((data) => {
  //     res.successJson(data);
  //   })
  //   .catch(err => res.errorJson(err));
});

router.post('/historySearch', (req, res) => {
  if(!req.body) return res.failMsg('Missing body');

  console.time('history');
  // Asssume input is sorted by "rank" field, which is calculated by the client
  const historyItems = _.map(req.body, (item) => { // Clean up movie titles, might be used later
    item.title = cleanUp(item.title);
    return item;
  }).filter(item => item); // Remove empty titles (after cleanup)

  const topUrls = _.map(historyItems, 'url').slice(0, 4); // Get top 4 URLs
  const toParse = [];
  topUrls.forEach((url) => {
    toParse.push(watson.processUrl(url).catch(err => logger.error(err)));
  });
  let keyTags = [];

  return Promise.all(toParse)
    .then((info) => {
      if(info) console.log('Got2:', info.map(a => a.keywords));
      info.forEach((infoItem) => {
        console.log('infoItem:', infoItem);
        let weight = 1;
        infoItem.keywords.forEach((keyWord) => {
          keyWord.weight = weight;
          keyTags.push(keyWord);
          weight /= 1.1;
        });
      });

      const pageInfos = _.flatten(info);
      const queries = [];
      pageInfos.forEach((pageInfo) => {
        if(!pageInfo || !pageInfo.keywords) return;
        pageInfo.keywords
          .forEach((i) => {
            i.text = cleanUp(i.text);
          });
        pageInfo.keywords = pageInfo.keywords
          .filter(i => i.text);
        pageInfo.keywords.forEach((keyword) => {
          console.log('Searching with: ', keyword.text);
          queries.push(tmdb.searchMovie(keyword.text)
            .then((movie) => {
              movie.weight = keyword.weight;
              return Promise.resolve(movie);
            })
            .catch(err => logger.error(err)));
        });
      });
      return Promise.all(queries);
    })
    .then((tMovieLists) => {
      console.log('Got multiple movies: ', tMovieLists);
      const movieLists = _.map(tMovieLists, 'results');
      let weight = 1;

      if(movieLists.length === 0) return res.failMsg('No matching movies found.');
      let masterList = movieLists[0];
      masterList.forEach((m) => { m.weight = weight; });

      movieLists.slice(1).forEach((movieList) => {
        weight /= 1.1;
        movieList.forEach((movie) => {
          const index = _.findIndex(masterList, target => target.id === movie.id);
          if(index >= 0) {
            masterList[index].weight += weight;
            // console.log('Added weight: ', masterList[index].weight);
          } else {
            movie.weight = weight;
            masterList.push(movie);
          }
        });
      });

      if(masterList.length > 7) {
        // Group movies by weight and remove ones with more than 3 items and then flatten
        masterList = _(masterList)
          .groupBy('weight');
        if(masterList.keys().value().length === 1) {
          masterList = masterList
            .values()
            .flatten()
            .value();
        } else {
          masterList = masterList
            .mapValues((group) => {
              console.log('Group:', group);
              if(group.length > 4) return group.slice(0, 4);
              return group;
            })
            .values()
            .flatten()
            .value();
        }
      }
      console.timeEnd('history');
      return res.json({
        status: 'success',
        data: _.orderBy(masterList, 'weight', 'desc'),
        keywords: keyTags,
      });
    })
    .catch(err => res.errorJson(err));

  // const topItems = items.slice(config.get('ranking.topHistory'));

  // db.all('SELECT * FROM tags LIMIT 100')
  //   .then((data) => {
  //     res.successJson(data);
  //   })
  //   .catch(err => res.errorJson(err));
});

router.get('/watson', (req, res) => {
  watson.processUrl('https://en.wikipedia.org/wiki/Sheelagh_Nefdt')
    .then(info => res.successJson(info));
});

module.exports = router;

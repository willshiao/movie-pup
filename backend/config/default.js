'use strict';

module.exports = {
  app: {
    port: 3000,
  },
  db: '../other/movies.db',
  ranking: {
    topHistory: 5, // Number of items to check with Watson from user history
  },
  watson: {
    version: 'v1',
  },
};

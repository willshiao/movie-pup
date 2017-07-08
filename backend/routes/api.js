'use strict';

const router = require('express').Router();

router.get('/', (req, res) => {
  return res.successJson();
});

module.exports = router;

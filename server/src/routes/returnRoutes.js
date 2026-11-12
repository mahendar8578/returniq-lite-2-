const express = require('express');
const router = express.Router();
const {
  createReturn,
  getReturns,
  getReturnById,
  deleteReturn
} = require('../controllers/returnController');
const {
  createReturnRules,
  validate
} = require('../middleware/returnValidator');

router.route('/')
  .post(createReturnRules, validate, createReturn)
  .get(getReturns);

router.route('/:id')
  .get(getReturnById)
  .delete(deleteReturn);

module.exports = router;


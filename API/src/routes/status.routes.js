const router = require('express').Router();
const { getStatus } = require('../controllers/status.controller');

router.get('/status', getStatus);
module.exports = router;

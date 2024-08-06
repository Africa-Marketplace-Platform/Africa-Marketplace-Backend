const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendMessage, getMessages } = require('../controllers/messageController');

router.route('/')
  .post(protect, sendMessage);

router.route('/:userId1/:userId2')
  .get(protect, getMessages);

module.exports = router;

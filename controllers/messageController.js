const Message = require('../models/Message');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;

  try {
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ msg: 'Receiver not found' });
    }

    const message = new Message({
      sender: req.user.id,
      receiver: receiverId,
      content,
    });

    await message.save();
    res.status(201).json(message);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ timestamp: -1 });

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

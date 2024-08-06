const Message = require('../models/Message');

// Send a message
exports.sendMessage = async (req, res) => {
  const { receiverId, message } = req.body;

  try {
    const newMessage = new Message({
      sender: req.user.id,
      receiver: receiverId,
      message,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get messages between two users
exports.getMessages = async (req, res) => {
  const { userId1, userId2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 },
      ],
    }).sort({ date: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

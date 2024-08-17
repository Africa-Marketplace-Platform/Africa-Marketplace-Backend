const Message = require('../models/Message');

// Send a message
exports.sendMessage = async (req, res) => {
  const { receiverId, message } = req.body;

  try {
    // Check if the message body is empty
    if (!message || !receiverId) {
      return res.status(400).json({ message: 'Message content and receiver ID are required.' });
    }

    const newMessage = new Message({
      sender: req.user.id,
      receiver: receiverId,
      message,
    });

    await newMessage.save();
    res.status(201).json({
      message: 'Message sent successfully',
      newMessage,
    });
  } catch (err) {
    console.error(`Error sending message: ${err.message}`);
    res.status(500).json({ message: 'Server error. Unable to send message.' });
  }
};

// Get messages between two users
exports.getMessages = async (req, res) => {
  const { userId1, userId2 } = req.params;

  try {
    // Check if both user IDs are provided
    if (!userId1 || !userId2) {
      return res.status(400).json({ message: 'Both user IDs are required.' });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 },
      ],
    }).sort({ createdAt: 1 }); // Sorting messages by creation date

    if (messages.length === 0) {
      return res.status(404).json({ message: 'No messages found between the users.' });
    }

    res.status(200).json({
      message: 'Messages retrieved successfully',
      messages,
    });
  } catch (err) {
    console.error(`Error retrieving messages: ${err.message}`);
    res.status(500).json({ message: 'Server error. Unable to retrieve messages.' });
  }
};

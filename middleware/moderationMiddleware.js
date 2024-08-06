// middleware/moderationMiddleware.js
const Perspective = require('perspective-api-client');

const perspective = new Perspective({ apiKey: process.env.PERSPECTIVE_API_KEY });

const moderateContent = async (req, res, next) => {
  const { content } = req.body;

  try {
    const result = await perspective.analyze(content, { attributes: ['TOXICITY', 'INSULT', 'THREAT'] });

    const toxicityScore = result.attributeScores.TOXICITY.summaryScore.value;

    if (toxicityScore > 0.7) { // Threshold can be adjusted
      return res.status(400).json({ message: 'Content flagged as inappropriate.' });
    }

    next();
  } catch (error) {
    console.error('Moderation error:', error.message);
    res.status(500).json({ message: 'Moderation service error.' });
  }
};

module.exports = moderateContent;

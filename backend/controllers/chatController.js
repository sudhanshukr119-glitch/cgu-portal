const Chat = require("../models/Chat");

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user.id;
    const msgs = await Chat.find({
      $or: [
        { from: myId, to: userId },
        { from: userId, to: myId },
      ]
    }).sort({ createdAt: 1 }).limit(100);
    res.json(msgs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.sendMessage = async (req, res) => {
  try {
    const { toId, toName, text } = req.body;
    const msg = await Chat.create({
      from: req.user.id,
      to: toId,
      fromName: req.user.name || "User",
      toName,
      text,
    });
    res.json(msg);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getConversations = async (req, res) => {
  try {
    const myId = req.user.id;
    const msgs = await Chat.find({
      $or: [{ from: myId }, { to: myId }]
    }).sort({ createdAt: -1 });
    // Get unique conversations
    const seen = new Set();
    const convs = [];
    for (const m of msgs) {
      const otherId = String(m.from) === String(myId) ? String(m.to) : String(m.from);
      if (!seen.has(otherId)) {
        seen.add(otherId);
        convs.push({ otherId, otherName: String(m.from) === String(myId) ? m.toName : m.fromName, lastMsg: m });
      }
    }
    res.json(convs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

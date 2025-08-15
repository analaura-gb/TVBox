const statusService = require('../services/status.service');

const getStatus = async (req, res) => {
  try {
    const data = await statusService.getStatus();
    res.json(data);
  } catch (err) {
    console.error('Erro /api/status:', err);
    res.status(500).json({ error: 'internal_error' });
  }
};

module.exports = { getStatus };

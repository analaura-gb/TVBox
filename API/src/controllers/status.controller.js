const statusService = require('../services/status.service');

const getStatus = async (req, res) => {
  try {
    const status = await statusService.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Erro ao obter status da TVBox:', error);
    res.status(500).json({ error: 'Erro interno ao obter status' });
  }
}

module.exports = {
  getStatus
};

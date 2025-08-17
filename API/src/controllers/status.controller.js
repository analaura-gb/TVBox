const statusService = require('../services/status.service');

async function getStatus(req, res) {
  try {
    //query instantanea
    const instant = req.query.instant === '1';
    const data = await statusService.getStatus({ instant });
    res.json(data);
  } catch (e) {
    console.error('Erro /api/status', e);
    res.status(500).json({ error: 'internal_error' });
  }
}
module.exports = { getStatus };

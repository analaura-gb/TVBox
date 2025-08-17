import axios from 'axios';

const DEFAULT_TIMEOUT = 3000;

export async function getStatus(baseUrl = '', opts = {}) {
  const { instant = false, signal, timeout = DEFAULT_TIMEOUT } = opts;
  const urlBase = baseUrl?.trim() || '';
  const url = `${urlBase}/api/status${instant ? '?instant=1' : ''}`;

  const res = await axios.get(url, { timeout, signal });
  return res.data;
}

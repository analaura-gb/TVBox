import axios from 'axios';

export function getStatus(baseUrl, apiKey) {
  return axios.get(`${baseUrl}/api/status`, {
    timeout: 3000
  });
}

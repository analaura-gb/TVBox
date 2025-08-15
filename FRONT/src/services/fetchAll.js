import { tvboxes } from './tvboxes';
import { getStatus } from './api';

const API_KEY = import.meta.env.VITE_API_KEY || '';

export async function fetchAllStatuses() {
  const reqs = tvboxes.map(async (b) => {
    try {
      const { data } = await getStatus(b.baseUrl, API_KEY);
      return { ...data, baseUrl: b.baseUrl };
    } catch (_) {
      return { boxId: b.id, name: b.name, baseUrl: b.baseUrl, error: true };
    }
  });
  return Promise.all(reqs);
}

import client from './client';

export const healthApi = {
  check: () => client.get('/health').then((r) => r.data),
};

export const dashboardApi = {
  get: () => client.get('/dashboard').then((r) => r.data),
};

export const liveLogsApi = {
  get: (params = {}) =>
    client.get('/live-logs', { params }).then((r) => r.data),
};

export const anomalyApi = {
  get: (params = {}) =>
    client.get('/anomaly-detection', { params }).then((r) => r.data),
  post: (logs) =>
    client.post('/anomaly-detection', { logs }).then((r) => r.data),
};

export const analyticsApi = {
  get: (period = '7d') =>
    client.get('/analytics', { params: { period } }).then((r) => r.data),
};

export const incidentsApi = {
  list: (params = {}) =>
    client.get('/incidents', { params }).then((r) => r.data),
  get: (incidentId) =>
    client.get(`/incidents/${incidentId}`).then((r) => r.data),
};

export const modelEvalApi = {
  get: () => client.get('/model-evaluation').then((r) => r.data),
  retrain: () => client.post('/model-evaluation/retrain').then((r) => r.data),
};

export const warRoomApi = {
  get: () => client.get('/war-room').then((r) => r.data),
};

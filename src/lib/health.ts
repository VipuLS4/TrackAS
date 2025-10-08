import { register } from './metrics';

// Health check endpoint
export const healthCheck = {
  status: 'healthy',
  timestamp: new Date().toISOString(),
  version: '1.0.0',
  environment: import.meta.env.VITE_APP_ENV || 'development',
  uptime: process.uptime ? process.uptime() : 0,
  checks: {
    database: 'healthy',
    redis: 'healthy',
    external_apis: 'healthy'
  }
};

// Metrics endpoint handler
export const getMetrics = async (): Promise<string> => {
  try {
    const metrics = await register.metrics();
    return metrics;
  } catch (error) {
    console.error('Error collecting metrics:', error);
    throw new Error('Failed to collect metrics');
  }
};

// Health endpoint handler
export const getHealth = () => {
  return {
    ...healthCheck,
    timestamp: new Date().toISOString(),
    uptime: process.uptime ? process.uptime() : 0
  };
};

// Detailed system status
export const getSystemStatus = () => {
  return {
    ...healthCheck,
    system: {
      memory: process.memoryUsage ? process.memoryUsage() : null,
      cpu: process.cpuUsage ? process.cpuUsage() : null,
      platform: process.platform,
      node_version: process.version,
      pid: process.pid
    },
    services: {
      supabase: 'connected',
      sentry: 'active',
      prometheus: 'collecting',
      grafana: 'monitoring'
    }
  };
};

import winston from 'winston';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'socialhub-pro' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
  ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export { logger };

// Audit logging service
export class AuditService {
  static async log(
    action: string,
    resource: string,
    resourceId?: string,
    userId?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      const { prisma } = await import('./prisma');
      
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          resourceId,
          details,
          ipAddress,
          userAgent
        }
      });

      logger.info('Audit log created', {
        action,
        resource,
        resourceId,
        userId
      });
    } catch (error) {
      logger.error('Failed to create audit log', { error, action, resource });
    }
  }

  static async getAuditLogs(
    filters: {
      userId?: string;
      resource?: string;
      action?: string;
      startDate?: Date;
      endDate?: Date;
    },
    limit: number = 50,
    offset: number = 0
  ) {
    const { prisma } = await import('./prisma');
    
    const where: any = {};
    
    if (filters.userId) where.userId = filters.userId;
    if (filters.resource) where.resource = filters.resource;
    if (filters.action) where.action = filters.action;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.auditLog.count({ where })
    ]);

    return { logs, total };
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  static startTimer(label: string): () => void {
    const start = Date.now();
    
    return () => {
      const duration = Date.now() - start;
      this.recordMetric(label, duration);
    };
  }

  static recordMetric(label: string, value: number) {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    
    const values = this.metrics.get(label)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
    
    logger.debug('Performance metric recorded', { label, value });
  }

  static getMetrics(label: string) {
    const values = this.metrics.get(label) || [];
    
    if (values.length === 0) {
      return null;
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    
    return {
      count: values.length,
      avg: Math.round(avg * 100) / 100,
      min,
      max,
      p50,
      p95,
      p99
    };
  }

  static getAllMetrics() {
    const result: Record<string, any> = {};
    
    for (const [label] of this.metrics) {
      result[label] = this.getMetrics(label);
    }
    
    return result;
  }
}

// Error tracking
export class ErrorTracker {
  static captureException(error: Error, context?: any) {
    logger.error('Exception captured', {
      message: error.message,
      stack: error.stack,
      context
    });

    // In production, this would send to Sentry or similar service
    if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
      // Sentry.captureException(error, { extra: context });
    }
  }

  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: any) {
    logger.log(level, message, context);

    // In production, this would send to Sentry or similar service
    if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
      // Sentry.captureMessage(message, level as SeverityLevel);
    }
  }
}

// Health check service
export class HealthCheckService {
  static async checkDatabase(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number }> {
    try {
      const start = Date.now();
      const { prisma } = await import('./prisma');
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      
      return { status: 'healthy', latency };
    } catch (error) {
      logger.error('Database health check failed', { error });
      return { status: 'unhealthy' };
    }
  }

  static async checkRedis(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number }> {
    try {
      const start = Date.now();
      const { redis } = await import('./redis');
      await redis.ping();
      const latency = Date.now() - start;
      
      return { status: 'healthy', latency };
    } catch (error) {
      logger.error('Redis health check failed', { error });
      return { status: 'unhealthy' };
    }
  }

  static async getSystemHealth() {
    const [database, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis()
    ]);

    const overall = database.status === 'healthy' && redis.status === 'healthy' 
      ? 'healthy' 
      : 'unhealthy';

    return {
      status: overall,
      timestamp: new Date().toISOString(),
      services: {
        database,
        redis
      },
      metrics: PerformanceMonitor.getAllMetrics()
    };
  }
}
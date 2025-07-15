import winston from 'winston';
import { supabaseAdmin } from './supabase';

const logLevel = process.env.LOG_LEVEL || 'info';

// Create Winston logger
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'socialhub-pro' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export interface AuditLogData {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

export class LogService {
  static async info(message: string, meta?: any) {
    logger.info(message, meta);
  }

  static async error(message: string, error?: Error, meta?: any) {
    logger.error(message, { error: error?.stack, ...meta });
  }

  static async warn(message: string, meta?: any) {
    logger.warn(message, meta);
  }

  static async debug(message: string, meta?: any) {
    logger.debug(message, meta);
  }

  static async auditLog(data: AuditLogData) {
    try {
      // Log to database
      await supabaseAdmin.from('audit_logs').insert({
        user_id: data.userId,
        action: data.action,
        resource_type: data.resourceType,
        resource_id: data.resourceId,
        details: data.details,
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
      });

      // Also log to Winston
      logger.info('Audit log', data);
    } catch (error) {
      logger.error('Failed to create audit log', { error, data });
    }
  }

  static async getAuditLogs(userId?: string, limit: number = 100, offset: number = 0) {
    try {
      let query = supabaseAdmin
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('Failed to get audit logs', { error });
      return [];
    }
  }
}

export { logger };
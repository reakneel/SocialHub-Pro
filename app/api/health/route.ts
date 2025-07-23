import { NextRequest, NextResponse } from 'next/server';
import { HealthCheckService } from '@/lib/monitoring';
import { 
  withErrorHandling, 
  withLogging, 
  withPerformanceMonitoring,
  withMiddleware 
} from '@/lib/middleware';

async function healthCheck(request: NextRequest) {
  const healthStatus = await HealthCheckService.checkHealth();
  
  const status = healthStatus.status === 'healthy' ? 200 : 503;
  
  return NextResponse.json(healthStatus, { status });
}

// Export handlers with middleware
export const GET = withMiddleware(
  healthCheck,
  withErrorHandling,
  withLogging,
  withPerformanceMonitoring
);
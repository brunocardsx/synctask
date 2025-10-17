import { logger } from './logger.js';

interface SecurityEvent {
  type:
    | 'AUTHENTICATION_FAILURE'
    | 'RATE_LIMIT_EXCEEDED'
    | 'INVALID_DATA'
    | 'UNAUTHORIZED_ACCESS'
    | 'SUSPICIOUS_ACTIVITY';
  userId?: string;
  socketId?: string;
  ip?: string | undefined;
  userAgent?: string | undefined;
  details?: any;
  timestamp: Date;
}

export const logSecurityEvent = (event: Omit<SecurityEvent, 'timestamp'>) => {
  const securityEvent: SecurityEvent = {
    ...event,
    timestamp: new Date(),
  };

  // Log estruturado para análise de segurança
  logger.warn('Security Event', {
    type: securityEvent.type,
    userId: securityEvent.userId,
    socketId: securityEvent.socketId,
    ip: securityEvent.ip,
    userAgent: securityEvent.userAgent,
    details: securityEvent.details,
    timestamp: securityEvent.timestamp.toISOString(),
  });

  // Em produção, enviar para sistema de monitoramento de segurança
  if (process.env.NODE_ENV === 'production') {
    // Aqui você pode integrar com sistemas como Sentry, DataDog, etc.
    console.log('SECURITY_EVENT:', JSON.stringify(securityEvent));
  }
};

export const logAuthenticationFailure = (
  socketId: string,
  ip?: string,
  userAgent?: string,
  reason?: string
) => {
  logSecurityEvent({
    type: 'AUTHENTICATION_FAILURE',
    socketId,
    ip,
    userAgent,
    details: { reason },
  });
};

export const logRateLimitExceeded = (
  userId: string,
  socketId: string,
  event: string,
  ip?: string
) => {
  logSecurityEvent({
    type: 'RATE_LIMIT_EXCEEDED',
    userId,
    socketId,
    ip,
    details: { event, limit: 'exceeded' },
  });
};

export const logInvalidData = (
  userId: string,
  socketId: string,
  validationErrors: string[],
  ip?: string
) => {
  logSecurityEvent({
    type: 'INVALID_DATA',
    userId,
    socketId,
    ip,
    details: { validationErrors },
  });
};

export const logUnauthorizedAccess = (
  userId: string,
  socketId: string,
  resource: string,
  ip?: string
) => {
  logSecurityEvent({
    type: 'UNAUTHORIZED_ACCESS',
    userId,
    socketId,
    ip,
    details: { resource, action: 'access_denied' },
  });
};

export const logSuspiciousActivity = (
  userId: string,
  socketId: string,
  activity: string,
  ip?: string
) => {
  logSecurityEvent({
    type: 'SUSPICIOUS_ACTIVITY',
    userId,
    socketId,
    ip,
    details: { activity },
  });
};

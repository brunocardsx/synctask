type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown> | undefined;
  userId?: string | undefined;
  requestId?: string | undefined;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel];
};

const formatLogEntry = (entry: LogEntry): string => {
  const base = `${entry.timestamp} [${entry.level.toUpperCase()}] ${entry.message}`;
  
  if (entry.context || entry.userId || entry.requestId) {
    const metadata = {
      ...entry.context,
      ...(entry.userId && { userId: entry.userId }),
      ...(entry.requestId && { requestId: entry.requestId }),
    };
    return `${base} ${JSON.stringify(metadata)}`;
  }
  
  return base;
};

const createLogger = (level: LogLevel) => {
  return (message: string, context?: Record<string, unknown>) => {
    if (!shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    const formatted = formatLogEntry(entry);
    
    if (level === 'error') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  };
};

export const logger = {
  debug: createLogger('debug'),
  info: createLogger('info'),
  warn: createLogger('warn'),
  error: createLogger('error'),
};

export const createRequestLogger = (req: any, res: any, next: any) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  req.requestId = requestId;
  
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId,
  });

  const originalSend = res.send;
  res.send = function(data: any) {
    logger.info('Request completed', {
      statusCode: res.statusCode,
      method: req.method,
      url: req.url,
      requestId,
    });
    
    return originalSend.call(this, data);
  };

  next();
};

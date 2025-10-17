import { NextFunction, Request, Response } from 'express';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting configurations
export const createRateLimit = (windowMs: number, max: number, message: string) => {
    return rateLimit({
        windowMs,
        max,
        message: { message },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                message,
                retryAfter: Math.round(windowMs / 1000)
            });
        }
    });
};

// General API rate limiting
export const generalLimiter = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // limit each IP to 100 requests per windowMs
    'Muitas requisições deste IP, tente novamente em 15 minutos.'
);

// Auth endpoints rate limiting (stricter)
export const authLimiter = createRateLimit(
    1 * 60 * 1000, // 1 minute
    50, // limit each IP to 50 requests per windowMs (more permissive for dev)
    'Muitas tentativas de login, tente novamente em 1 minuto.'
);

// Password reset rate limiting
export const passwordResetLimiter = createRateLimit(
    60 * 60 * 1000, // 1 hour
    3, // limit each IP to 3 password reset requests per hour
    'Muitas tentativas de reset de senha, tente novamente em 1 hora.'
);

// Helmet configuration for security headers
export const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
});

// MongoDB injection protection
export const mongoSanitizeConfig = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`MongoDB injection attempt detected in ${key}:`, req.body);
    }
});

// HTTP Parameter Pollution protection (manual implementation)
export const hppConfig = (req: Request, res: Response, next: NextFunction) => {
    // Remove duplicate parameters, keep last one
    const cleanQuery: any = {};
    for (const [key, value] of Object.entries(req.query)) {
        if (Array.isArray(value)) {
            cleanQuery[key] = value[value.length - 1]; // Keep last value
        } else {
            cleanQuery[key] = value;
        }
    }
    req.query = cleanQuery;
    next();
};

// HTTP compression
export const compressionConfig = compression();

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');

    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    next();
};

// Request ID middleware for tracking
export const requestId = (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.headers['x-request-id'] ||
        `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    (req as any).requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
};

// Security logging middleware
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            requestId: (req as any).requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        };

        // Log security events
        if (res.statusCode >= 400) {
            console.warn('Security Event:', logData);
        }

        // Log all requests in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Request:', logData);
        }
    });

    next();
};

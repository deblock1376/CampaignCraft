import { apiRequest } from "@/lib/queryClient";

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private sessionId: string;
  private userId: number | null = null;
  private newsroomId: number | null = null;
  private queue: any[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly FLUSH_INTERVAL = 5000; // Flush every 5 seconds
  private readonly MAX_QUEUE_SIZE = 50;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeUser();
    this.setupGlobalErrorHandlers();
    this.startFlushInterval();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeUser() {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.userId = user.id || null;
        this.newsroomId = user.newsroomId || null;
      }
    } catch (error) {
      console.error('Failed to initialize logger user:', error);
    }
  }

  public updateUser(userId: number | null, newsroomId: number | null) {
    this.userId = userId;
    this.newsroomId = newsroomId;
  }

  private setupGlobalErrorHandlers() {
    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.error('Unhandled error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack,
      });
    });
  }

  private startFlushInterval() {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL);
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const logsToSend = [...this.queue];
    this.queue = [];

    try {
      await apiRequest('POST', '/api/logs', { logs: logsToSend });
    } catch (error) {
      // Silent fail - don't want logging to break the app
      console.error('Failed to send logs:', error);
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const logEntry = {
      userId: this.userId,
      newsroomId: this.newsroomId,
      sessionId: this.sessionId,
      level,
      message,
      context: context || {},
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.queue.push(logEntry);

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](`[${level.toUpperCase()}]`, message, context);
    }

    // Flush if queue is too large
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      this.flush();
    }
  }

  public error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }

  public warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  public info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  public debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  public trackAction(action: string, context?: LogContext) {
    this.info(`User action: ${action}`, context);
  }

  public destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

export const logger = new Logger();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  logger.destroy();
});

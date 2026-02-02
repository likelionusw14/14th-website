import { EventEmitter } from 'events';

class Logger extends EventEmitter {
    private logs: string[] = [];
    private readonly MAX_LOGS = 100;

    log(message: string, type: 'INFO' | 'ERROR' | 'WARN' = 'INFO') {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const formattedMessage = `[${timestamp}] [${type}] ${message}`;

        console.log(formattedMessage); // Keep server console output

        this.logs.push(formattedMessage);
        if (this.logs.length > this.MAX_LOGS) {
            this.logs.shift();
        }

        this.emit('log', formattedMessage);
    }

    info(message: string) {
        this.log(message, 'INFO');
    }

    error(message: string) {
        this.log(message, 'ERROR');
    }

    warn(message: string) {
        this.log(message, 'WARN');
    }

    getRecentLogs() {
        return this.logs;
    }
}

export const logger = new Logger();

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../context/AuthContext';

const Terminal = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const eventSource = new EventSource(`${API_BASE_URL}/api/logs`);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setLogs((prev) => [...prev, data.message]);
            } catch (e) {
                console.error('Log parse error', e);
            }
        };

        eventSource.onerror = (e) => {
            console.error('SSE Error', e);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="w-full h-64 bg-black/90 rounded-lg border border-slate-700 font-mono text-xs p-4 overflow-y-auto shadow-inner relative">
            <div className="absolute top-2 right-2 flex gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="text-slate-500 mb-2 border-b border-slate-800 pb-1">server-logs@likelion-usw:~# tail -f /var/log/auth.log</div>
            <div className="space-y-1">
                {logs.map((log, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`break-all ${log.includes('ERROR') ? 'text-red-400' : log.includes('WARN') ? 'text-yellow-400' : 'text-green-400'}`}
                    >
                        {log}
                    </motion.div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default Terminal;

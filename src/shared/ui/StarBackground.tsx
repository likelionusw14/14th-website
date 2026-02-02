import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Generate random stars
const generateStars = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2,
    }));
};

const StarBackground = () => {
    const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);

    useEffect(() => {
        setStars(generateStars(50));
    }, []);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-deep-navy">
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: star.size,
                        height: star.size,
                    }}
                    animate={{
                        opacity: [0.2, 1, 0.2],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
            {/* Optional: Add a subtle gradient overlay to simulate nebula depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-blue-900/10 pointer-events-none" />
        </div>
    );
};

export default StarBackground;

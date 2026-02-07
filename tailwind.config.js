/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'deep-navy': '#0f172a',
                'starlight-white': '#f8fafc',
                'nebula-purple': '#8b5cf6',
                'comet-blue': '#3b82f6',
                'lion-navy': '#003670',
                'lion-gold': '#E9B800',
            },
            backgroundImage: {
                'gradient-lion': 'linear-gradient(135deg, #003670 0%, #E9B800 100%)',
                'gradient-lion-reverse': 'linear-gradient(135deg, #E9B800 0%, #003670 100%)',
                'gradient-lion-horizontal': 'linear-gradient(90deg, #003670 0%, #E9B800 100%)',
                'gradient-lion-vertical': 'linear-gradient(180deg, #003670 0%, #E9B800 100%)',
            },
            fontFamily: {
                sans: ['Pretendard', 'Montserrat', 'sans-serif'],
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                twinkle: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                }
            },
            animation: {
                float: 'float 6s ease-in-out infinite',
                twinkle: 'twinkle 3s ease-in-out infinite',
            }
        },
    },
    plugins: [],
}

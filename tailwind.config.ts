import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#F0F7F4',
                    100: '#DCEDE4',
                    200: '#B9DBC9',
                    300: '#8CC2A6',
                    400: '#5CA582',
                    500: '#3D8A66',
                    600: '#2E6E50',
                    700: '#275741',
                    800: '#1B4D3E',
                    900: '#163E33',
                    950: '#0C241D'
                },
                cream: {
                    50: '#FDFCFA',
                    100: '#FAF7F2',
                    200: '#F3EDE2',
                    300: '#E9DFCF',
                    400: '#DCCBB0'
                },
                sage: {
                    50: '#F4F7F5',
                    100: '#E5ECE7',
                    200: '#CBDAD0',
                    300: '#A3BFAC',
                    400: '#7AA088',
                    500: '#5C846B'
                },
                gold: {
                    300: '#DEC99A',
                    400: '#D2B67D',
                    500: '#C9A96E',
                    600: '#B08F4F'
                },
                ink: {
                    DEFAULT: '#2D2A26',
                    soft: '#5C574F',
                    faint: '#8A847A'
                }
            },
            fontFamily: {
                sans: ['var(--font-plex)', 'IBM Plex Sans Arabic', 'sans-serif'],
                display: ['var(--font-amiri)', 'Amiri', 'serif']
            },
            borderRadius: {
                xl2: '12px'
            },
            boxShadow: {
                card: '0 1px 3px rgba(45, 42, 38, 0.04), 0 4px 16px rgba(45, 42, 38, 0.04)'
            }
        },
    },
    plugins: [],
};
export default config;

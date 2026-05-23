/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                space: "#0a0a0a",
                pinkNeon: "#ec4899",
                blueNeon: "#22d3ee",
                greenNeon: "#10b981",
            },
        },
    },
    plugins: [],
}
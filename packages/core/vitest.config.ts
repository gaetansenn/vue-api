import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        reporters: ["verbose"], 
        include: ['src/**/*.test.ts'],
        globals: true,
        environment: 'jsdom',
        onConsoleLog: (log) => {
            console.log(log);
        }
    }
})
import app from './app.js';

const server = app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});

server.on('error', (err) => {
    console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    process.exit(1);
});

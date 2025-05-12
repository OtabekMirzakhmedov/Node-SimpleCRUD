import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';
import userRouter from './routes/userRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

const PORT = process.env.PORT || 4000;

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

    try {
        if (req.url.startsWith('/api/users')) {
            userRouter(req, res);
        } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Resource not found' }));
        }
    } catch (error) {
        console.error('Server error:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Internal server error' }));
    }
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    server.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}/`);
    });
}

export default server;
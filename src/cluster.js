import cluster from 'cluster';
import os from 'os';
import http from 'http';
import { config } from 'dotenv';

config();

const PORT = parseInt(process.env.PORT) || 4000;
const numCPUs = os.cpus().length;

let dbState = [];

if (cluster.isPrimary) {
    console.log(`Master process ${process.pid} is running`);

    const loadBalancer = http.createServer((req, res) => {
        const workerIds = Object.keys(cluster.workers);
        const workerId = workerIds[nextWorker];
        nextWorker = (nextWorker + 1) % workerIds.length;

        const worker = cluster.workers[workerId];
        const workerPort = PORT + parseInt(workerId);

        const options = {
            hostname: 'localhost',
            port: workerPort,
            path: req.url,
            method: req.method,
            headers: req.headers
        };

        const proxyReq = http.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });

        proxyReq.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`);
            res.statusCode = 500;
            res.end('Internal Server Error');
        });

        req.pipe(proxyReq, { end: true });
    });

    loadBalancer.listen(PORT, () => {
        console.log(`Load balancer listening on port ${PORT}`);
    });

    let nextWorker = 0;

    for (let i = 1; i < numCPUs; i++) {
        const worker = cluster.fork();
        console.log(`Worker ${worker.id} started on port ${PORT + i}`);

        worker.on('message', (message) => {
            if (message.type === 'DB_UPDATE') {
                dbState = message.data;

                Object.values(cluster.workers).forEach((w) => {
                    if (w.id !== worker.id) { // Don't send back to the sender
                        w.send({ type: 'DB_UPDATE', data: dbState });
                    }
                });
            }
        });
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.id} died`);
        const newWorker = cluster.fork();
        console.log(`Worker ${newWorker.id} started on port ${PORT + parseInt(newWorker.id)}`);

        newWorker.send({ type: 'DB_UPDATE', data: dbState });
    });
} else {
    const workerPort = PORT + cluster.worker.id;

    import('./server.js').then((serverModule) => {
        const server = serverModule.default;

        server.listen(workerPort, () => {
            console.log(`Worker ${cluster.worker.id} listening on port ${workerPort}`);
        });
    });
}
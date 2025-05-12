import * as userController from '../controllers/userController.js';

const userRouter = (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const method = req.method;

    let userId = null;
    const userIdMatch = path.match(/^\/api\/users\/([^/]+)$/);
    if (userIdMatch) {
        userId = userIdMatch[1];
        req.params = { userId };
    }

    if (path === '/api/users' && method === 'GET') {
        userController.getUsers(req, res);
    } else if (userId && method === 'GET') {
        userController.getUserById(req, res);
    } else if (path === '/api/users' && method === 'POST') {
        userController.createUser(req, res);
    } else if (userId && method === 'PUT') {
        userController.updateUser(req, res);
    } else if (userId && method === 'DELETE') {
        userController.deleteUser(req, res);
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Resource not found' }));
    }
};

export default userRouter;
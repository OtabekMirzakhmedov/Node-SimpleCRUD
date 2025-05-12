import * as db from '../db/inMemoryDb.js';
import validateUuid from '../utils/validateUuid.js';

export const getUsers = async (req, res) => {
    try {
        const users = await db.getAllUsers();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(users));
    } catch (error) {
        console.error('Error getting users:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Internal server error' }));
    }
};

export const getUserById = async (req, res) => {
    try {
        const id = req.params.userId;

        if (!validateUuid(id)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Invalid user ID format' }));
            return;
        }

        const user = await db.getUserById(id);

        if (!user) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'User not found' }));
            return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(user));
    } catch (error) {
        console.error('Error getting user by ID:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Internal server error' }));
    }
};

export const createUser = async (req, res) => {
    try {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const userData = JSON.parse(body);

                if (!userData.username || typeof userData.username !== 'string') {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ message: 'Username is required and must be a string' }));
                    return;
                }

                if (userData.age === undefined || typeof userData.age !== 'number') {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ message: 'Age is required and must be a number' }));
                    return;
                }

                if (!Array.isArray(userData.hobbies)) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ message: 'Hobbies must be an array' }));
                    return;
                }

                const newUser = await db.createUser(userData);

                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(newUser));
            } catch (error) {
                console.error('Error creating user:', error);

                if (error.message.includes('required')) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ message: error.message }));
                } else {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ message: 'Internal server error' }));
                }
            }
        });
    } catch (error) {
        console.error('Error in create user handler:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Internal server error' }));
    }
};

export const updateUser = async (req, res) => {
    try {
        const id = req.params.userId;

        if (!validateUuid(id)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Invalid user ID format' }));
            return;
        }

        let body = '';

        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const userData = JSON.parse(body);

                const existingUser = await db.getUserById(id);
                if (!existingUser) {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ message: 'User not found' }));
                    return;
                }

                const updatedUser = await db.updateUser(id, userData);

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(updatedUser));
            } catch (error) {
                console.error('Error updating user:', error);

                if (error.message.includes('must be')) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ message: error.message }));
                } else {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ message: 'Internal server error' }));
                }
            }
        });
    } catch (error) {
        console.error('Error in update user handler:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Internal server error' }));
    }
};

export const deleteUser = async (req, res) => {
    try {
        const id = req.params.userId;

        if (!validateUuid(id)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Invalid user ID format' }));
            return;
        }

        const existingUser = await db.getUserById(id);
        if (!existingUser) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'User not found' }));
            return;
        }
r
        await db.deleteUser(id);

        res.statusCode = 204;
        res.end();
    } catch (error) {
        console.error('Error deleting user:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Internal server error' }));
    }
};

export default {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
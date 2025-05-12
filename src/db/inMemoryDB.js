import { v4 as uuidv4 } from 'uuid';

let users = [];

if (process.env.NODE_ENV !== 'test') {
    if (process.send) {
        process.on('message', (message) => {
            if (message.type === 'DB_UPDATE') {
                users = message.data;
            }
        });
    }
}

const broadcastDbState = () => {
    if (process.send) {
        process.send({ type: 'DB_UPDATE', data: users });
    }
};

export const getAllUsers = async () => {
    return [...users];
};

export const getUserById = async (id) => {
    return users.find(user => user.id === id) || null;
};

export const createUser = async (userData) => {
    if (!userData.username || typeof userData.username !== 'string') {
        throw new Error('Username is required and must be a string');
    }

    if (userData.age === undefined || typeof userData.age !== 'number') {
        throw new Error('Age is required and must be a number');
    }

    if (!Array.isArray(userData.hobbies)) {
        throw new Error('Hobbies must be an array');
    }

    const newUser = {
        id: uuidv4(),
        username: userData.username,
        age: userData.age,
        hobbies: userData.hobbies
    };

    users.push(newUser);
    broadcastDbState();
    return { ...newUser };
};

export const updateUser = async (id, userData) => {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;

    if (userData.username !== undefined && typeof userData.username !== 'string') {
        throw new Error('Username must be a string');
    }

    if (userData.age !== undefined && typeof userData.age !== 'number') {
        throw new Error('Age must be a number');
    }

    if (userData.hobbies !== undefined && !Array.isArray(userData.hobbies)) {
        throw new Error('Hobbies must be an array');
    }

    const updatedUser = {
        ...users[index],
        ...userData,
        id
    };

    users[index] = updatedUser;
    broadcastDbState();
    return { ...updatedUser };
};

export const deleteUser = async (id) => {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return false;

    users.splice(index, 1);
    broadcastDbState();
    return true;
};

export default {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
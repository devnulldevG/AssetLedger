import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const registeredUsers = new Map<string, string>();

function verifyAuthToken(req: any, res: any, next: any) {
    const authToken = req.headers['authorization'];
    const token = authToken && authToken.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

async function createPasswordHash(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

async function checkPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
}

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (registeredUsers.has(username)) {
            return res.status(400).send('User already exists');
        }
        const hashedPassword = await createPasswordHash(password);
        registeredUsers.set(username, hashedPassword);
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(500).send('Server error during registration');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPasswordForUser = registeredUsers.get(username);
        if (hashedPasswordForUser && await checkPassword(password, hashedPasswordForUser)) {
            const accessToken = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1h' });
            res.json({ accessToken });
        } else {
            res.status(400).send('Invalid username or password');
        }
    } catch (error) {
        res.status(500).send('Server error during login');
    }
});

app.get('/protected', verifyAuthToken, (req, res) => {
    res.send(`Welcome! Your user information is protected.`);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server active on port ${port}`);
});
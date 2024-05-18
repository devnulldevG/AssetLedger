import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const registeredUsers = new Map<string, string>();
const refreshTokens = new Set<string>();

function verifyAuthToken(req: any, res: any, next: any) {
    const authToken = req.headers['authorization'];
    const token = authToken && authToken.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err: any, user: any) => {
        if (err) return res.status(403).send('Access token is invalid or has expired');
        req.user = user;
        next();
    });
}

function generateAccessToken(user: any) {
    try {
        return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1h' });    
    } catch (error) {
        throw new Error('Failed to generate access token');
    }
}

async function createPasswordHash(password: string): Promise<string> {
    const saltRounds = 10;
    try {
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        throw new Error('Password hashing failed');
    }
}

async function checkPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
}

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send('Username and password are required');
        }
        if (registeredUsers.has(username)) {
            return res.status(400).send('User already exists');
        }
        const hashedPassword = await createPasswordHash(password);
        registeredUsers.set(username, hashedPassword);
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(500).send(`Server error during registration: ${error.message}`);
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPasswordForUser = registeredUsers.get(username);
        if (hashedPasswordForUser && await checkPassword(password, hashedPasswordForUser)) {
            const user = { username };
            const accessToken = generateAccessToken(user);
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET!);
            refreshTokens.add(refreshToken);
            res.json({ accessToken, refreshToken });
        } else {
            res.status(400).send('Invalid username or password');
        }
    } catch (error) {
        res.status(500).send(`Server error during login: ${error.message}`);
    }
});

app.post('/token', (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);
    if (!refreshTokens.has(refreshToken)) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!, (err, user) => {
        if (err) return res.status(403).send('Refresh token is invalid or has expired');

        const accessToken = generateAccessToken({ username: user.username });
        res.json({ accessToken });
    });
});

app.delete('/logout', (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken) {
        return res.status(400).send('Token is required for logout');
    }
    
    const deleted = refreshTokens.delete(refreshToken);
    if (deleted) {
        res.sendStatus(204);
    } else {
        res.status(400).send('Invalid or unknown token');
    }
});

app.get('/protected', verifyAuthToken, (req, res) => {
    res.send(`Welcome! Your user information is protected.`);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server active on port ${port}`);
});
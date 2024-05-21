import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const userCredentials = new Map<string, string>();
const activeRefreshTokens = new Set<string>();

function authenticateRequest(req: any, res: any, next: any) {
    const authHeader = req.headers['authorization'];
    const authToken = authHeader && authHeader.split(' ')[1];
    if (authToken == null) return res.sendStatus(401);

    jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET!, (err: any, userInfo: any) => {
        if (err) return res.status(403).send('Access token is invalid or has expired');
        req.user = userInfo;
        next();
    });
}

function createAccessToken(userInfo: any) {
    try {
        return jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1h' });    
    } catch (error) {
        throw new Error('Failed to generate access token');
    }
}

async function hashUserPassword(password: string): Promise<string> {
    const saltRounds = 10;
    try {
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        throw new Error('Password hashing failed');
    }
}

async function verifyUserPassword(password: string, hashedPassword: string): Promise<boolean> {
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
        if (userCredentials.has(username)) {
            return res.status(400).send('User already exists');
        }
        const hashedPassword = await hashUserPassword(password);
        userCredentials.set(username, hashedPassword);
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(500).send(`Server error during registration: ${error.message}`);
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = userCredentials.get(username);
        if (hashedPassword && await verifyUserPassword(password, hashedPassword)) {
            const userInfo = { username };
            const accessToken = createAccessToken(userInfo);
            const refreshToken = jwt.sign(userInfo, process.env.REFRESH_TOKEN_SECRET!);
            activeRefreshTokens.add(refreshToken);
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
    if (!activeRefreshTokens.has(refreshToken)) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!, (err, userInfo) => {
        if (err) return res.status(403).send('Refresh token is invalid or has expired');

        const accessToken = createAccessToken({ username: userInfo.username });
        res.json({ accessToken });
    });
});

app.delete('/logout', (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken) {
        return res.status(400).send('Token is required for logout');
    }
    
    const removed = activeRefreshTokens.delete(refreshToken);
    if (removed) {
        res.sendStatus(204);
    } else {
        res.status(400).send('Invalid or unknown token');
    }
});

app.get('/protected', authenticateRequest, (req, res) => {
    res.send(`Welcome! Your user information is protected.`);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server active on port ${port}`);
});
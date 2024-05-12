import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(express.json());
const users = new Map<string, string>(); 
function authenticateToken(req: any, res: any, next: any) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}
async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}
async function validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
}
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (users.has(username)) {
            return res.status(400).send('User already exists');
        }
        const hashedPassword = await hashPassword(password);
        users.set(username, hashedPassword);
        res.status(201).send('User created');
    } catch (error) {
        res.status(500).send('Something went wrong');
    }
});
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = users.get(username);
        if (user && await validatePassword(password, user)) {
            const accessToken = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1h' });
            res.json({ accessToken });
        } else {
            res.status(400).send('Username or password is incorrect');
        }
    } catch (error) {
        res.status(500).send('Something went wrong');
    }
});
app.get('/protected', authenticateToken, (req, res) => {
    res.send(`Welcome! Your user data is protected.`);
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
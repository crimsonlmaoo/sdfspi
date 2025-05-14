import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'users.json');

function readUsers() {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data || '[]');
}

function writeUsers(users) {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

export default function handler(req, res) {
  const { method } = req;

  if (method === 'POST') {
    const { username, password } = req.body;
    const users = readUsers();

    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    users.push({ username, password, profileImagePath: '' });
    writeUsers(users);
    return res.status(201).json({ message: 'Account created.' });
  }

  if (method === 'GET') {
    const { username, password } = req.query;
    const users = readUsers();

    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    return res.status(200).json(user);
  }

  if (method === 'PUT') {
    const { username, profileImagePath } = req.body;
    const users = readUsers();
    const index = users.findIndex(u => u.username === username);

    if (index === -1) {
      return res.status(404).json({ message: 'User not found.' });
    }

    users[index].profileImagePath = profileImagePath;
    writeUsers(users);
    return res.status(200).json({ message: 'User updated.' });
  }

  res.setHeader('Allow', ['POST', 'GET', 'PUT']);
  res.status(405).end(`Method ${method} Not Allowed`);
}

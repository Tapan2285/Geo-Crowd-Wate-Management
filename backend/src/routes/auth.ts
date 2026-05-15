import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import MunicipalityCode from '../models/MunicipalityCode';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Register User
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, location, municipalityCode } = req.body;

    let user = await User.findOne({ email });
    if (user) {
       res.status(400).json({ message: 'User already exists' });
       return;
    }

    if (role === 'municipality') {
      if (!municipalityCode) {
        res.status(400).json({ message: 'Municipality Access Code is required.' });
        return;
      }
      
      const mCode = await MunicipalityCode.findOne({ code: municipalityCode, isUsed: false });
      if (!mCode) {
        res.status(400).json({ message: 'Invalid or already used Municipality Access Code.' });
        return;
      }
      
      mCode.isUsed = true;
      mCode.usedBy = email;
      await mCode.save();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      location
    });

    await user.save();

    const payload = {
      id: user.id,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Login User
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
       res.status(400).json({ message: 'Invalid credentials' });
       return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
       res.status(400).json({ message: 'Invalid credentials' });
       return;
    }

    const payload = {
      id: user.id,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get all users (Admin only in real app)
router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const mapped = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      location: u.location,
      createdAt: u.createdAt
    }));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

export default router;

import express, { Request, Response } from 'express';
import MunicipalityCode from '../models/MunicipalityCode';

const router = express.Router();

// Generate a new code
router.post('/codes', async (req: Request, res: Response): Promise<void> => {
  try {
    const { designatedTo } = req.body;
    // Generate a random 6-character alphanumeric code
    const code = 'MUNI-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newCode = new MunicipalityCode({
      code,
      designatedTo
    });

    await newCode.save();
    res.status(201).json(newCode);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate code' });
  }
});

// Get all codes
router.get('/codes', async (req: Request, res: Response): Promise<void> => {
  try {
    const codes = await MunicipalityCode.find().sort({ createdAt: -1 });
    res.json(codes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch codes' });
  }
});

export default router;

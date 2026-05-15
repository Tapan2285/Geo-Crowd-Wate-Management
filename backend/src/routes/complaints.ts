import { Router } from 'express';
import Complaint from '../models/Complaint';
import User from '../models/User';
import mongoose from 'mongoose';

const router = Router();

// GET all complaints (filter by role/municipality later)
router.get('/', async (req, res) => {
  try {
    const { userId, assignedMunicipalityId } = req.query;
    const filter: any = {};
    if (userId) filter.userId = userId;
    if (assignedMunicipalityId) filter.assignedMunicipalityId = assignedMunicipalityId;

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    
    // Fetch user details for these complaints
    const userIds = [...new Set(complaints.map(c => c.userId).filter(id => id && mongoose.isValidObjectId(id)))];
    const muniIds = [...new Set(complaints.map(c => c.assignedMunicipalityId).filter(id => id && mongoose.isValidObjectId(id)))];
    
    const allUsers = await User.find({ _id: { $in: [...userIds, ...muniIds] } }, 'name email role');
    const userMap = allUsers.reduce((acc: any, u: any) => {
      acc[u._id.toString()] = { name: u.name, email: u.email, role: u.role };
      return acc;
    }, {});

    // Map _id to id for the frontend
    const mapped = complaints.map(c => ({
      id: c._id,
      imageUrl: c.imageUrl,
      location: c.location,
      address: c.address,
      description: c.description,
      userId: c.userId,
      user: userMap[c.userId] || { name: 'Unknown User', email: 'unknown@example.com' },
      status: c.status,
      aiValidation: c.aiValidation,
      assignedMunicipalityId: c.assignedMunicipalityId,
      assignedMunicipality: userMap[c.assignedMunicipalityId] || { name: c.assignedMunicipalityId === 'm1' ? 'Default Muni' : 'Unknown' },
      feedback: c.feedback,
      createdAt: c.createdAt
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// POST a new complaint
router.post('/', async (req, res) => {
  const { imageUrl, location, address, description, userId } = req.body;

  try {
    // We send a mock image since we are just passing base64 strings right now, 
    // but the AI service expects a multipart file. We'll convert it in the real implementation.
    // For now, we'll send a dummy blob if imageUrl is base64, or just string.
    
    // Convert base64 to Blob to send to FastAPI
    let formData = new FormData();
    if (imageUrl && imageUrl.startsWith('data:image')) {
        const base64Data = imageUrl.split(';base64,').pop();
        const buffer = Buffer.from(base64Data, 'base64');
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        formData.append('file', blob, 'upload.jpg');
    } else {
        // Fallback dummy blob
        formData.append('file', new Blob(['dummy'], { type: 'image/jpeg' }), 'dummy.jpg');
    }

    const aiResponse = await fetch('http://localhost:8000/detect', {
      method: 'POST',
      body: formData
    });
    
    const aiResult = await aiResponse.json();
    console.log("AI Service Response:", aiResponse.status, aiResult);

    if (!aiResponse.ok) {
        throw new Error(`AI Service failed: ${JSON.stringify(aiResult)}`);
    }

    if (!aiResult.is_waste) {
        return res.status(400).json({ error: `AI Validation Failed: ${aiResult.message}. Please point the camera at actual waste.` });
    }

    const municipalities = await User.find({ role: 'municipality' });
    let assignedMunicipalityId = municipalities.length > 0 ? municipalities[0]?._id?.toString() || null : null; // Default fallback to first real muni

    if (location && location.lat && location.lng && municipalities.length > 0) {
        let closestMuni = null;
        let minDistance = Infinity;

        const deg2rad = (deg: number) => deg * (Math.PI / 180);
        const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const R = 6371; // Earth radius in km
          const dLat = deg2rad(lat2 - lat1);
          const dLon = deg2rad(lon2 - lon1);
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
          return R * c;
        };

        for (const muni of municipalities) {
          if (muni.location && typeof muni.location.lat === 'number' && typeof muni.location.lng === 'number') {
            const dist = getDistance(location.lat, location.lng, muni.location.lat, muni.location.lng);
            if (dist < minDistance) {
              minDistance = dist;
              closestMuni = muni;
            }
          }
        }

        if (closestMuni) {
          assignedMunicipalityId = closestMuni._id.toString();
          console.log(`Assigned report to closest municipality: ${closestMuni.name} (Distance: ${minDistance.toFixed(2)}km)`);
        }
    }

    if (!assignedMunicipalityId) {
       return res.status(500).json({ error: 'No municipalities registered in the system to handle reports.' });
    }

    const newComplaint = new Complaint({
      imageUrl,
      location,
      address,
      description,
      userId,
      status: 'Reported',
      aiValidation: aiResult,
      assignedMunicipalityId,
    });

    await newComplaint.save();

    res.status(201).json({
        id: newComplaint._id,
        ...newComplaint.toObject()
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to process complaint' });
  }
});

// PUT update complaint status
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, feedback, assignedMunicipalityId } = req.body;
  
  try {
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (feedback !== undefined) complaint.feedback = feedback;
    if (assignedMunicipalityId) complaint.assignedMunicipalityId = assignedMunicipalityId;

    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update complaint' });
  }
});

// DELETE a complaint
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Complaint.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Complaint not found' });
    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
});

export default router;

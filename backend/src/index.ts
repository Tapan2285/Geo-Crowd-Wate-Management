import express from 'express';
import dotenv from 'dotenv';
import corsMiddleware from 'cors';
import connectDB from './config/db';
import User from './models/User';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(corsMiddleware({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' })); // Allow large image payloads
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB
connectDB().then(async () => {
    // Seed initial users if they don't exist
    const count = await User.countDocuments();
    if (count === 0) {
        // We need to import bcrypt here just for the seed
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        
        await User.insertMany([
            { name: 'John User', email: 'user@test.com', password: hashedPassword, role: 'user' },
            { name: 'Downtown Municipality', email: 'municipality@test.com', password: hashedPassword, role: 'municipality', location: { lat: 40.7128, lng: -74.0060 } },
            { name: 'Super Admin', email: 'admin@test.com', password: hashedPassword, role: 'admin' }
        ]);
        console.log('Database seeded with initial users (with passwords)');
    } else {
        // Fix existing users if they don't have passwords
        const users = await User.find({});
        let updated = false;
        const bcrypt = require('bcryptjs');
        for (const user of users) {
            // Delete legacy users that don't have an email
            if (!user.email) {
                await User.deleteOne({ _id: user._id });
                continue;
            }

            if (!user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash('password123', salt);
                
                // Also fix emails to match the test buttons if they are the old examples
                if (user.email === 'john@example.com') user.email = 'user@test.com';
                if (user.email === 'muni@example.com') user.email = 'municipality@test.com';
                if (user.email === 'admin@example.com') user.email = 'admin@test.com';
                
                await user.save();
                updated = true;
            }
        }
        if (updated) console.log('Fixed missing passwords and emails for seeded users');
    }

    // Seed extra data if requested
    const muniCount = await User.countDocuments({ role: 'municipality' });
    if (muniCount < 4) { // Currently only 1 exists by default
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        
        await User.insertMany([
            { name: 'Uptown Municipality', email: 'uptown@test.com', password: hashedPassword, role: 'municipality', location: { lat: 40.7300, lng: -73.9900 } },
            { name: 'Westside Municipality', email: 'westside@test.com', password: hashedPassword, role: 'municipality', location: { lat: 40.7500, lng: -74.0100 } },
            { name: 'Eastside Municipality', email: 'eastside@test.com', password: hashedPassword, role: 'municipality', location: { lat: 40.7200, lng: -73.9700 } },
            { name: 'Jane Citizen', email: 'jane@test.com', password: hashedPassword, role: 'user' },
            { name: 'Bob Resident', email: 'bob@test.com', password: hashedPassword, role: 'user' }
        ]);
        console.log('Extra users and municipalities seeded');
    }

    const Complaint = require('./models/Complaint').default;
    const complaintCount = await Complaint.countDocuments();
    if (complaintCount < 5) {
        // Fetch some users and municipalities to assign
        const someUser = await User.findOne({ email: 'jane@test.com' });
        const someUser2 = await User.findOne({ email: 'bob@test.com' });
        const someMuni1 = await User.findOne({ email: 'uptown@test.com' });
        const someMuni2 = await User.findOne({ email: 'westside@test.com' });

        if (someUser && someUser2 && someMuni1 && someMuni2) {
            await Complaint.insertMany([
                {
                    imageUrl: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800&auto=format&fit=crop&q=60',
                    location: { lat: 40.7350, lng: -73.9950 },
                    description: 'Pile of trash bags near the park',
                    userId: someUser._id.toString(),
                    status: 'Reported',
                    aiValidation: { is_waste: true, confidence: 0.95, message: 'Waste detected' },
                    assignedMunicipalityId: someMuni1._id.toString()
                },
                {
                    imageUrl: 'https://images.unsplash.com/photo-1595278069441-2f03ce888b54?w=800&auto=format&fit=crop&q=60',
                    location: { lat: 40.7550, lng: -74.0150 },
                    description: 'Overflowing public bin',
                    userId: someUser2._id.toString(),
                    status: 'Reported',
                    aiValidation: { is_waste: true, confidence: 0.88, message: 'Waste detected' },
                    assignedMunicipalityId: someMuni2._id.toString()
                },
                {
                    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=60',
                    location: { lat: 40.7320, lng: -73.9920 },
                    description: 'Graffiti and litter',
                    userId: someUser._id.toString(),
                    status: 'Cleaned',
                    aiValidation: { is_waste: true, confidence: 0.99, message: 'Waste detected' },
                    assignedMunicipalityId: someMuni1._id.toString(),
                    feedback: 'Cleaned up the area'
                }
            ]);
            console.log('Dummy complaints seeded');
        }
    }
});

// Routes
import authRoutes from './routes/auth';
import complaintRoutes from './routes/complaints';
import adminRoutes from './routes/admin';

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

// Also mount on /_/backend/api for Vercel experimentalServices routing
app.use('/_/backend/api/auth', authRoutes);
app.use('/_/backend/api/complaints', complaintRoutes);
app.use('/_/backend/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Waste Management API is running (MongoDB Connected)');
});
app.get('/_/backend', (req, res) => {
  res.send('Waste Management API is running (MongoDB Connected)');
});

// Only listen if not running on Vercel Serverless (which sets default env vars)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;

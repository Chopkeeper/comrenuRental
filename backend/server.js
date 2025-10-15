import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import computerRoutes from './routes/computers.js';
import bookingRoutes from './routes/bookings.js';
import userRoutes from './routes/users.js';
import User from './models/User.js';


// Load env vars
dotenv.config();

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/computers', computerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);


// Connect to database and seed initial data
connectDB().then(async () => {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            await User.create({
                name: 'admin',
                password: 'admin', // This will be hashed by the pre-save hook
                role: 'admin'
            });
            console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
            console.log('Database was empty. Default admin user created.');
            console.log('Username: admin');
            console.log('Password: admin');
            console.log('Please change the password after first login.');
            console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
        }
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
});


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Basic route for testing
app.get('/', (req, res) => {
    res.send('API is running...');
});
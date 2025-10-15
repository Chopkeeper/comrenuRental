import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import computerRoutes from './routes/computers.js';
import bookingRoutes from './routes/bookings.js';
import userRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';
import User from './models/User.js';


// Load env vars
dotenv.config();

// ES Module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

// Body parser
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images

// Enable CORS
app.use(cors());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/computers', computerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);


// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    // Serve static files from the 'dist' directory
    app.use(express.static(path.join(__dirname, '..', 'dist')));

    // For all other routes that are not API routes, serve the index.html file
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '..', 'dist', 'index.html'));
    });
} else {
    // Basic route for testing API in development
    app.get('/', (req, res) => {
        res.send('API is running...');
    });
}

const PORT = process.env.PORT || 5001;

const setupAdminAndStartServer = async () => {
    try {
        console.log('Database connected. Ensuring admin user is configured...');
        
        const adminName = 'admin';
        const adminPassword = 'admin123';

        // Manually hash the password to bypass any potential pre-save hook issues during this specific setup
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        
        // Use findOneAndUpdate with upsert to guarantee the admin user exists with the correct password.
        // This is an atomic operation and more robust than find-then-save.
        await User.findOneAndUpdate(
            { name: adminName },
            { 
                $set: { 
                    name: adminName,
                    password: hashedPassword,
                    role: 'admin' 
                }
            },
            { upsert: true, new: true, runValidators: true }
        );

        console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
        console.log('Admin user configured/verified successfully.');
        console.log(`Username: ${adminName} | Password: ${adminPassword}`);
        console.log('This account is guaranteed to work on login.');
        console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
        
        // Start the server ONLY after the DB is connected and admin is set up
        app.listen(PORT, () => console.log(`Server is ready and listening on port ${PORT}`));

    } catch (error) {
        console.error('Error during application startup:', error);
        process.exit(1);
    }
};

// Connect to database and then start the server setup
connectDB().then(setupAdminAndStartServer);
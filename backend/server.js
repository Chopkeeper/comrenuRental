import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
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

// Connect to database and start server
connectDB().then(async () => {
    try {
        console.log('Database connected. Setting up admin user...');
        
        const adminName = 'admin';
        const adminPassword = 'admin123';

        let adminUser = await User.findOne({ name: adminName }).select('+password');

        if (!adminUser) {
            await User.create({
                name: adminName,
                password: adminPassword,
                role: 'admin'
            });
            console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
            console.log('Default admin user created.');
            console.log(`Username: ${adminName} | Password: ${adminPassword}`);
            console.log('Please change the password after first login.');
            console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
        } else {
            const isMatch = await adminUser.matchPassword(adminPassword);
            if (!isMatch) {
                adminUser.password = adminPassword;
                await adminUser.save();
                console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
                console.log('Default admin user password has been RESET.');
                console.log(`Username: ${adminName} | Password: ${adminPassword}`);
                console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
            } else {
                 console.log('Admin user is configured correctly.');
            }
        }
        
        console.log('Admin user setup complete.');

        // Start the server ONLY after the DB is connected and admin is set up
        app.listen(PORT, () => console.log(`Server is ready and listening on port ${PORT}`));

    } catch (error) {
        console.error('Error during application startup:', error);
        process.exit(1);
    }
});

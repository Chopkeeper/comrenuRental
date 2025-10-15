import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.error('!!! DATABASE CONNECTION FAILED !!!');
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.error(`Error: ${error.message}`);
        console.error('\nPOSSIBLE CAUSES:');
        console.error('1. MONGO_URI Environment Variable is incorrect or missing.');
        console.error('   - Check username, password, and database name.');
        console.error('   - Ensure special characters in the password are URL-encoded.');
        console.error('2. MongoDB IP Access List does not allow connections from this service.');
        console.error('   - Ensure you have added `0.0.0.0/0` (Allow Access from Anywhere).');
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        process.exit(1);
    }
};

export default connectDB;
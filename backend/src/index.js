import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leadpilot';
// Middleware
app.use(cors());
app.use(express.json());
// Routes
app.use('/api', apiRoutes);
app.get('/', (req, res) => {
    res.send('LeadPilot - Autonomous B2B Lead Generation Agent API');
});
// Database Connection
mongoose.connect(MONGODB_URI)
    .then(() => {
    console.log('Connected to MongoDB via local setup successfully');
    app.listen(PORT, () => console.log(`Backend API running on http://localhost:${PORT}`));
})
    .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map
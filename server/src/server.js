import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import networkRoutes from './routes/networkRoutes.js';
import helpdeskRoutes from './routes/helpdeskRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import licenseRoutes from './routes/licenseRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import userRoutes from './routes/userRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    system: 'SIIIMS Node.js Backend API',
    database: 'PostgreSQL',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/helpdesk', helpdeskRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/systems', systemRoutes);
app.use('/api/dashboard', dashboardRoutes);


// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ message: `API Endpoint ${req.method} ${req.url} not found` });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  SIIIMS Node.js Backend Server running on port ${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
import fs from 'fs';
import path from 'path';

//env setup:
dotenv.config();

//custom routes:
import tableRoute from './routes/tableRoute';
import memoRoute from './routes/memoRoute';
import userRoute from './routes/userRoute';
import invoiceRoute from './routes/invoiceRoute';
import vendorRoute from './routes/vendorRoute'; 
import backupRoute from './routes/backupRoute';
import { Request, Response, NextFunction } from 'express';

const app = express(); 
app.use(express.json());
app.use(express.urlencoded({extended:true}));

const allowedOrigin = process.env.NODE_ENV === 'production'
  ? 'http://127.0.0.1'  // Electron in production
  : 'http://localhost:3000';  // React dev server in development

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));
app.options('*', cors());  // Preflight for all routes


const checkDBExistence = (req: Request, res: Response, next: NextFunction) => {
    const databasePath = path.join(__dirname, 'prisma', 'dev.db'); 

    if (!fs.existsSync(databasePath)) {
      console.error(`Database file not found at ${databasePath}!`); 
      return res.status(404).send({message: "Database is missing or inaccessible! Upload Backup!"})
    }
    next();
} 

app.use("/api/userRoute", checkDBExistence, userRoute);
app.use("/api/invoiceRoute", checkDBExistence, invoiceRoute);  
app.use("/api/vendorRoute", checkDBExistence, vendorRoute);
app.use("/api/tableRoute", checkDBExistence, tableRoute);
app.use("/api/memoRoute", checkDBExistence, memoRoute); 
app.use('/api/backupRoute', backupRoute);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ message: 'An unexpected error occurred!' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => { 
  console.log(`Backend server is running on http://0.0.0.0:${PORT}`);
});
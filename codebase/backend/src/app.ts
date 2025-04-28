import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger';


import authRoutes from "./routes/auth.routes";
import receptionRoutes from "./routes/rescptions.route";  
import doctorRoutes from "./routes/doctor.route";       

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reception', receptionRoutes);  
app.use('/api/doctor', doctorRoutes);       

// Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/', (req, res) => {
  res.send('Welcome to eHealth APIs');
});

export default app;
import express from 'express';
import { getCrimeData } from '../controllers/crimeController.js';

const router = express.Router();

router.get('/crime', getCrimeData);

export default router;

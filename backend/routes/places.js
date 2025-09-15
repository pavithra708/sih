import express from 'express';
import { getPlaceInfo } from '../controllers/placesController.js';

const router = express.Router();

// Endpoint: /api/places?q=Bangalore
router.get('/', getPlaceInfo);

export default router;

// backend/routes/roads.js
import express from 'express';
import { getRoadsData } from '../controllers/roadsController.js';

const router = express.Router();

router.get('/', getRoadsData); // /api/roads?q=Bengaluru

export default router;

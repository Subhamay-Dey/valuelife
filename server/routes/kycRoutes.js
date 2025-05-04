// src/routes/kycRoutes.js

import express from 'express';
import { getAllKycRequests, getKycRequestById, createKycRequest, updateKycRequest } from '../controllers/kycController.js';

const router = express.Router();

// Base path: /api/db/kycRequests

router.get('/', getAllKycRequests); // GET /api/db/kycRequests
router.get('/:id', getKycRequestById); // GET /api/db/kycRequests/:id
router.post('/', createKycRequest); // POST /api/db/kycRequests
router.put('/:id', updateKycRequest); // PUT /api/db/kycRequests/:id

export default router;
// src/controllers/kycController.js

import { KycRequestModel, UserModel } from '../models/index.js';


// Get all KYC requests
export const getAllKycRequests = async (req, res) => {
  try {
    const requests = await KycRequestModel.find().sort({ submissionDate: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Error getting KYC requests:', error);
    res.status(500).json({ error: 'Failed to retrieve KYC requests' });
  }
};

// Get a single KYC request by ID
export const getKycRequestById = async (req, res) => {
  try {
    const request = await KycRequestModel.findOne({ id: req.params.id });
    if (request) {
      res.json(request);
    } else {
      res.status(404).json({ error: 'KYC request not found' });
    }
  } catch (error) {
    console.error('Error getting KYC request by ID:', error);
    res.status(500).json({ error: 'Failed to retrieve KYC request' });
  }
};

// Create a new KYC request (Backend logic to update user status/history)
export const createKycRequest = async (req, res) => {
  try {
    const requestData = req.body;
     // Ensure date is Date object
     if (typeof requestData.submissionDate === 'string') requestData.submissionDate = new Date(requestData.submissionDate);
     // Ensure document IDs are Mongoose ObjectIds if the schema uses ObjectId refs
     // This depends on how frontend sends file references after uploading.
     // Assuming frontend uploads files first and sends the returned File._id strings.
     // Need to convert string IDs to ObjectId if necessary, or use String refs in schema.
     // Schema uses ObjectId refs, assume requestData.documents contains valid ObjectId strings.
     // Mongoose should handle casting strings to ObjectIds for refs on save/update if they are valid format.

    const newRequest = new KycRequestModel(requestData);
    await newRequest.save(); // Save the new request document

    // --- Backend Logic: Update User KYC Status and History ---
    const user = await UserModel.findOne({ id: newRequest.userId });
    if (user) {
       user.kycStatus = 'pending'; // Status becomes pending when a new request is submitted
       if (!user.kycHistory) {
           user.kycHistory = [];
       }
       // Create a new submission history entry
       const newSubmission = {
           documentType: 'KYC Documents', // Or infer from requestData.documents
           status: 'pending',
           submittedAt: newRequest.submissionDate, // Use date from request
           // reviewDate, notes added later
       };
       user.kycHistory.push(newSubmission);
       await user.save(); // Save updated user document
       console.log(`User ${user.id} KYC status updated to pending and history entry added.`);
    } else {
       console.warn(`User ${newRequest.userId} not found when creating KYC request.`);
    }
    // --- End Backend Logic ---


    res.status(201).json(newRequest); // Respond with created request
  } catch (error) {
    console.error('Error creating KYC request:', error);
    res.status(500).json({ error: 'Failed to create KYC request', details: error.message });
  }
};

// Update a KYC request by ID (Backend logic to update user status/history)
export const updateKycRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const updateData = req.body; // Contains status, reviewDate, reviewNotes


     // Find and update the request document by its custom 'id' field
     // Use { new: true } to get the updated document after the update is applied.
    const updatedRequest = await KycRequestModel.findOneAndUpdate({ id: requestId }, updateData, { new: true });

    if (updatedRequest) {
       // --- Backend Logic: Update User KYC Status and History ---
       // Find the user associated with the updated request
       const user = await UserModel.findOne({ id: updatedRequest.userId });
       if (user) {
           // Update user's main kycStatus field to match the request status
           user.kycStatus = updatedRequest.status;

            // Update status on the corresponding submission in user's history (find the latest pending one)
           if (user.kycHistory) {
               const latestPendingSubmission = user.kycHistory.find(sub => sub.status === 'pending'); // Find the entry that was pending
               if (latestPendingSubmission) {
                   latestPendingSubmission.status = updatedRequest.status; // Update its status
                   latestPendingSubmission.reviewedAt = updatedRequest.reviewDate; // Add review date
                   latestPendingSubmission.notes = updatedRequest.reviewNotes; // Add notes
               } else {
                   console.warn(`No pending history entry found for user ${user.id} when updating KYC request ${updatedRequest.id}.`);
                   // Optional: Add a new history entry if no pending one was found? Depends on flow.
               }
           } else {
                // If kycHistory array didn't exist, create it? Or log error.
                console.warn(`User ${user.id} has no kycHistory array when updating KYC request ${updatedRequest.id}.`);
                // user.kycHistory = []; // Create if null
                // user.kycHistory.push({...}); // Add a new entry for the reviewed status?
           }
           await user.save(); // Save updated user document
           console.log(`User ${user.id} KYC status updated to ${updatedRequest.status} and history entry updated.`);
       } else {
          console.warn(`User ${updatedRequest.userId} not found when updating KYC request ${updatedRequest.id}.`);
       }
       // --- End Backend Logic ---


      res.json(updatedRequest); // Respond with updated request document
    } else {
      res.status(404).json({ error: 'KYC request not found' });
    }
  } catch (error) {
    console.error('Error updating KYC request:', error);
    res.status(500).json({ error: 'Failed to update KYC request' });
  }
};
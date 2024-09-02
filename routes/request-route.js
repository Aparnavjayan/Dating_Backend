import express from 'express';
import User from '../schema/User.js';
import Request from '../schema/Request.js';
import PersonalDetail from '../schema/PersonalDetail.js';
import authenticateJWT from '../middleware/Authtoken.js';
//import updateLastActive from '../middleware/updateLastActive.js';


const router = express.Router();

router.post('/sendRequest/:userId', authenticateJWT,  async (req, res) => {
    try {
      const loggedInUserId = req.user._id;
      const { userId } = req.params;
  
    
      let loggedInUserRequest = await Request.findOne({ userId: loggedInUserId });
      if (!loggedInUserRequest) {
        loggedInUserRequest = new Request({ userId: loggedInUserId, requestSentIds: [], requestInIds: [], requestAcceptIds: [] });
      }
  
     
      let targetUserRequest = await Request.findOne({ userId });
      if (!targetUserRequest) {
        targetUserRequest = new Request({ userId, requestSentIds: [], requestInIds: [], requestAcceptIds: [] });
      }
  
      
      if (!loggedInUserRequest.requestSentIds.includes(userId) && !targetUserRequest.requestInIds.includes(loggedInUserId)) {
       
        loggedInUserRequest.requestSentIds.addToSet(userId);
        targetUserRequest.requestInIds.addToSet(loggedInUserId);
  
       
        await loggedInUserRequest.save();
        await targetUserRequest.save();
  
        res.status(200).send('Request sent');
      } else {
        res.status(400).send('Request already sent');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      res.status(500).send('Error sending request');
    }
  });

  router.get('/sent-requests', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;

        // Find the request record where the user is the sender
        const request = await Request.findOne({ userId }).select('requestSentIds');

        if (!request) {
            console.log(`No request record found for user: ${userId}`);
            return res.status(404).json({ message: 'No sent requests found.' });
        }

        const requestSentIds = request.requestSentIds || [];

        if (requestSentIds.length === 0) {
            console.log(`No sent requests for user: ${userId}`);
            return res.status(404).json({ message: 'No sent requests found.' });
        }

        // Fetch personal details and user details separately
        const personalDetails = await PersonalDetail.find({ userId: { $in: requestSentIds } }).select('profilePicUrl userId');
        const users = await User.find({ _id: { $in: requestSentIds } }).select('name');

        // Combine user information with their personal details
        const sentRequests = requestSentIds.map(id => {
            const detail = personalDetails.find(pd => pd.userId.toString() === id.toString());
            const user = users.find(u => u._id.toString() === id.toString());
            return {
                userId: id,
                name: user ? user.name : 'Unknown',
                profilePicUrl: detail ? detail.profilePicUrl : ''
            };
        });

        res.status(200).json({ sentRequests });
    } catch (error) {
        console.error('Error fetching sent requests:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


router.get('/received-requests', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the requests where the user is the recipient
    const request = await Request.findOne({ userId }).select('requestInIds requestAcceptIds');

    if (!request) {
      return res.status(404).json({ message: 'No received requests found.' });
    }

    const { requestInIds, requestAcceptIds } = request;

    if (requestInIds.length === 0) {
      return res.status(404).json({ message: 'No received requests found.' });
    }

    const users = await User.find({ _id: { $in: requestInIds } }).select('name');
    const personalDetails = await PersonalDetail.find({ userId: { $in: requestInIds } }).select('profilePicUrl userId');

    const receivedRequests = requestInIds.map(id => {
      const user = users.find(u => u._id.toString() === id.toString());
      const detail = personalDetails.find(pd => pd.userId.toString() === id.toString());
      const isAccepted = requestAcceptIds.some(accepted => accepted.userId.toString() === id.toString());
      return {
        userId: id,
        name: user ? user.name : 'Unknown',
        profilePicUrl: detail ? detail.profilePicUrl : '',
        accepted: isAccepted, // Check if the request is accepted
      };
    });

    res.status(200).json(receivedRequests);
  } catch (error) {
    console.error('Error fetching received requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});





  // Accept request
  router.post('/accept-request', authenticateJWT, async (req, res) => {
    const { requestId } = req.body;
    const userId = req.user.id;

    try {
        const userRequest = await Request.findOne({ userId });

        if (userRequest) {
            if (userRequest.requestInIds.includes(requestId)) {
                // Check if the request is already accepted to avoid duplicates
                const isAlreadyAccepted = userRequest.requestAcceptIds.some(
                    (request) => request.userId.toString() === requestId
                );

                if (!isAlreadyAccepted) {
                    userRequest.requestAcceptIds.push({ userId: requestId, acceptedAt: new Date() });
                    await userRequest.save();
                    res.status(200).json({ message: 'Request accepted successfully.' });
                } else {
                    res.status(400).json({ message: 'Request already accepted.' });
                }
            } else {
                res.status(404).json({ message: 'Request ID not found in incoming requests.' });
            }
        } else {
            res.status(404).json({ message: 'User request document not found.' });
        }
    } catch (error) {
        console.error('Error accepting request:', error);
        res.status(500).json({ message: 'Error accepting request.', error });
    }
});

  

// Reject request
router.post('/reject-request', authenticateJWT, async (req, res) => {
  const { requestId } = req.body;
  const userId = req.user.id;

  try {
      console.log('Rejecting request:', requestId, 'for user:', userId);

      // Find the user's request document
      const userRequest = await Request.findOne({ userId });

      if (userRequest) {
          console.log('User request found:', userRequest);

          // Remove the requestId from requestInIds
          userRequest.requestInIds = userRequest.requestInIds.filter(id => id.toString() !== requestId);

          // Check if requestRejectedIds exists, and if not, initialize it
          if (!userRequest.requestRejectedIds) {
              userRequest.requestRejectedIds = [];
          }

          // Add the requestId to requestRejectedIds
          userRequest.requestRejectedIds.push(requestId);

          // Remove the requestId from requestAcceptIds if it exists
          userRequest.requestAcceptIds = userRequest.requestAcceptIds.filter(id => id.userId.toString() !== requestId);

          await userRequest.save();
          res.status(200).json({ message: 'Request rejected successfully.' });
      } else {
          console.log('User request document not found for user:', userId);
          res.status(404).json({ message: 'Request not found.' });
      }
  } catch (error) {
      console.error('Error rejecting request:', error);
      res.status(500).json({ message: 'Error rejecting request.', error });
  }
});




// Fetch accepted requests

router.get('/accepted-requests', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the requests where the user has accepted requests
    const request = await Request.findOne({ userId }).select('requestAcceptIds');

    if (!request || request.requestAcceptIds.length === 0) {
      return res.status(404).json({ message: 'No accepted requests found.' });
    }

    const acceptedRequests = request.requestAcceptIds.map(request => request.userId);

    // Fetch user details and acceptance time
    const users = await User.find({ _id: { $in: acceptedRequests } }).select('name personalDetailId');
    const personalDetails = await PersonalDetail.find({ userId: { $in: acceptedRequests } }).select('profilePicUrl userId');

    // Combine user information with their personal details
    const response = request.requestAcceptIds.map(id => {
      const user = users.find(u => u._id.toString() === id.userId.toString());
      const detail = personalDetails.find(pd => pd.userId.toString() === id.userId.toString());
      return {
        userId: id.userId,
        name: user ? user.name : 'Unknown',
        profilePicUrl: detail ? detail.profilePicUrl : '',
        acceptedAt: id.acceptedAt, // Include the accepted time
      };
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching accepted requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Fetch Rejected Requests

router.get('/rejected-profiles', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the requests where the user has rejected requests
    const request = await Request.findOne({ userId }).select('requestRejectedIds');

    if (!request || request.requestRejectedIds.length === 0) {
      return res.status(404).json({ message: 'No rejected profiles found.' });
    }

    // Fetch user details
    const rejectedUsers = request.requestRejectedIds;
    const users = await User.find({ _id: { $in: rejectedUsers } }).select('name');
    const personalDetails = await PersonalDetail.find({ userId: { $in: rejectedUsers } }).select('profilePicUrl userId');

    // Combine user information with their personal details
    const response = rejectedUsers.map(userId => {
      const user = users.find(u => u._id.toString() === userId.toString());
      const detail = personalDetails.find(pd => pd.userId.toString() === userId.toString());
      return {
        userId: userId,
        name: user ? user.name : 'Unknown',
        profilePicUrl: detail ? detail.profilePicUrl : '',
      };
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching rejected profiles:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

  export default router;
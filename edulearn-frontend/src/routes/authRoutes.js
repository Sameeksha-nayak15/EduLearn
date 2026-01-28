import express from 'express';
import { adminLogin, getDashboardStats, getAllUsers } from '../services/adminAuth.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Admin login endpoint
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Call the admin login function
    const result = await adminLogin(email, password);

    res.json(result);
  } catch (error) {
    console.error('Login endpoint error:', error);
    res.json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * GET /api/auth/dashboard-stats
 * Get dashboard statistics (Admin only)
 */
router.get('/dashboard-stats', async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.json({ 
      success: false, 
      message: 'Failed to fetch stats' 
    });
  }
});

/**
 * GET /api/auth/users
 * Get all users (Admin only)
 */
router.get('/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.json({ 
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
});

export default router;
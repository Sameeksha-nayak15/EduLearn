// Create new file: src/services/adminAuth.js
import { supabase } from './supabase';

/**
 * Admin login with email and password
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<{success: boolean, message: string, user: object}>}
 */
export const adminLogin = async (email, password) => {
  try {
    // Validate input
    if (!email || !password) {
      return { 
        success: false, 
        message: 'Email and password are required' 
      };
    }

    // Query Supabase database for user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, password, college_name')
      .eq('email', email)
      .single();

    // Check if user exists
    if (error || !user) {
      return { 
        success: false, 
        message: 'Invalid email or password' 
      };
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return { 
        success: false, 
        message: 'Admin access only' 
      };
    }

    // Compare plain text passwords
    if (user.password !== password) {
      return { 
        success: false, 
        message: 'Invalid email or password' 
      };
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Return success response
    return { 
      success: true, 
      message: 'Login successful',
      user: userWithoutPassword 
    };
  } catch (error) {
    console.error('Admin login error:', error);
    return { 
      success: false, 
      message: 'Server error. Please try again.' 
    };
  }
};

/**
 * Get all users (Admin only)
 * @returns {Promise<Array>}
 */
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, college_name, created_at, online_status')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Fetch all users error:', err);
    return [];
  }
};

/**
 * Get dashboard statistics (Admin only)
 * @returns {Promise<{students: number, teachers: number, videos: number}>}
 */
export const getDashboardStats = async () => {
  try {
    // Get students count
    const { data: students, error: studentError } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('role', 'student');

    // Get teachers count
    const { data: teachers, error: teacherError } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('role', 'teacher');

    // Get videos count
    const { data: videos, error: videoError } = await supabase
      .from('videos')
      .select('id', { count: 'exact' });

    return {
      students: students ? students.length : 0,
      teachers: teachers ? teachers.length : 0,
      videos: videos ? videos.length : 0,
    };
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return { students: 0, teachers: 0, videos: 0 };
  }
};
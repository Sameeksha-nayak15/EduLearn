import { supabase } from './supabase';

/**
 * Get all users with optional filtering
 * @param {object} filters - Filter options (role, online_status)
 * @returns {Promise<Array>}
 */
export const getAllUsers = async (filters = {}) => {
  try {
    let query = supabase.from('users').select('*');

    if (filters.role) {
      query = query.eq('role', filters.role);
    }

    if (filters.onlineStatus !== undefined) {
      query = query.eq('online_status', filters.onlineStatus);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Fetch all users error:', err);
    throw new Error(err.message || 'Failed to fetch users');
  }
};

/**
 * Get user statistics (counts)
 * @returns {Promise<{totalStudents: number, totalTeachers: number, onlineStudents: number, onlineTeachers: number}>}
 */
export const getUserStatistics = async () => {
  try {
    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'student');

    const { data: teachers, error: teachersError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'teacher');

    const { data: onlineStudents, error: onlineStudentsError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'student')
      .eq('online_status', true);

    const { data: onlineTeachers, error: onlineTeachersError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'teacher')
      .eq('online_status', true);

    if (studentsError || teachersError || onlineStudentsError || onlineTeachersError) {
      throw new Error('Failed to fetch statistics');
    }

    return {
      totalStudents: students?.length || 0,
      totalTeachers: teachers?.length || 0,
      onlineStudents: onlineStudents?.length || 0,
      onlineTeachers: onlineTeachers?.length || 0,
    };
  } catch (err) {
    console.error('Fetch statistics error:', err);
    throw new Error(err.message || 'Failed to fetch user statistics');
  }
};

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Promise<object>}
 */
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Fetch user profile error:', err);
    throw new Error(err.message || 'Failed to fetch user profile');
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>}
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Update user profile error:', err);
    throw new Error(err.message || 'Failed to update user profile');
  }
};

/**
 * Get teachers for a specific student (if needed for analytics)
 * @returns {Promise<Array>}
 */
export const getTeachers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, college_name')
      .eq('role', 'teacher')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Fetch teachers error:', err);
    throw new Error(err.message || 'Failed to fetch teachers');
  }
};

/**
 * Get students for a specific teacher (if needed for analytics)
 * @returns {Promise<Array>}
 */
export const getStudents = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, college_name')
      .eq('role', 'student')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Fetch students error:', err);
    throw new Error(err.message || 'Failed to fetch students');
  }
};

/**
 * Search users by name or email
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>}
 */
export const searchUsers = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }

    const lowerSearchTerm = searchTerm.toLowerCase();

    // Fetch all users and filter (since Supabase FTS might not be available)
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      throw error;
    }

    return (data || []).filter(
      (user) =>
        user.name.toLowerCase().includes(lowerSearchTerm) ||
        user.email.toLowerCase().includes(lowerSearchTerm) ||
        user.college_name.toLowerCase().includes(lowerSearchTerm)
    );
  } catch (err) {
    console.error('Search users error:', err);
    throw new Error(err.message || 'Failed to search users');
  }
};

/**
 * Check if user is online
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export const isUserOnline = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('online_status')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data?.online_status || false;
  } catch (err) {
    console.error('Check online status error:', err);
    throw new Error(err.message || 'Failed to check online status');
  }
};

/**
 * Get teacher name by ID
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<string>}
 */
export const getTeacherName = async (teacherId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('name')
      .eq('id', teacherId)
      .single();

    if (error) {
      throw error;
    }

    return data?.name || 'Unknown Teacher';
  } catch (err) {
    console.error('Fetch teacher name error:', err);
    return 'Unknown Teacher';
  }
};
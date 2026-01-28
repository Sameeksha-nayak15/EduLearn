import { supabase } from './supabase';

/**
 * Create a new signup request (for pending approval)
 * @param {string} email - User email
 * @param {string} name - User full name
 * @param {string} role - Role: 'teacher' or 'student'
 * @param {string} collegeName - College/Institution name
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const createSignupRequest = async (email, name, role, collegeName) => {
  try {
    // Check if email already exists in pending_requests or users
    const { data: existingPending } = await supabase
      .from('pending_requests')
      .select('id')
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existingPending) {
      throw new Error('You already have a pending signup request with this email.');
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('This email is already registered.');
    }

    // Create pending request
    const { data, error } = await supabase
      .from('pending_requests')
      .insert([
        {
          email,
          name,
          role,
          college_name: collegeName,
          status: 'pending',
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'Signup request submitted successfully! Please wait for admin approval.',
      data,
    };
  } catch (err) {
    console.error('Signup request error:', err);
    throw new Error(err.message || 'Failed to create signup request');
  }
};

/**
 * Create a new user account (Admin only - after approval)
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User full name
 * @param {string} role - Role: 'admin', 'teacher', or 'student'
 * @param {string} collegeName - College/Institution name
 * @returns {Promise<{user: object, success: boolean}>}
 */
export const createUserAccount = async (email, password, name, role, collegeName) => {
  try {
    // Create Auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      throw authError;
    }

    // Create user profile in users table
    const { data, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          name,
          role,
          college_name: collegeName,
          online_status: false,
        },
      ])
      .select();

    if (profileError) {
      // Rollback: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    return {
      success: true,
      user: authData.user,
      profile: data[0],
    };
  } catch (err) {
    console.error('User creation error:', err);
    throw new Error(err.message || 'Failed to create user account');
  }
};

/**
 * Approve a signup request and create user account
 * @param {string} requestId - Pending request ID
 * @param {string} tempPassword - Temporary password for the new user
 * @returns {Promise<{success: boolean, user: object}>}
 */
export const approvePendingRequest = async (requestId, tempPassword) => {
  try {
    // Get the pending request
    const { data: request, error: fetchError } = await supabase
      .from('pending_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      throw new Error('Pending request not found');
    }

    // Create user account
    const { user, profile } = await createUserAccount(
      request.email,
      tempPassword,
      request.name,
      request.role,
      request.college_name
    );

    // Update pending request status
    const { error: updateError } = await supabase
      .from('pending_requests')
      .update({ status: 'approved' })
      .eq('id', requestId);

    if (updateError) {
      throw updateError;
    }

    return {
      success: true,
      user,
      profile,
    };
  } catch (err) {
    console.error('Approval error:', err);
    throw new Error(err.message || 'Failed to approve request');
  }
};

/**
 * Reject a signup request
 * @param {string} requestId - Pending request ID
 * @returns {Promise<{success: boolean}>}
 */
export const rejectPendingRequest = async (requestId) => {
  try {
    const { error } = await supabase
      .from('pending_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (err) {
    console.error('Rejection error:', err);
    throw new Error(err.message || 'Failed to reject request');
  }
};

/**
 * Get all pending signup requests (Admin only)
 * @returns {Promise<Array>}
 */
export const getPendingRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('pending_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Fetch pending requests error:', err);
    throw new Error(err.message || 'Failed to fetch pending requests');
  }
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<object>}
 */
export const getUserById = async (userId) => {
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
    console.error('Fetch user error:', err);
    throw new Error(err.message || 'Failed to fetch user');
  }
};

/**
 * Get all users by role
 * @param {string} role - Role: 'admin', 'teacher', or 'student'
 * @returns {Promise<Array>}
 */
export const getUsersByRole = async (role) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Fetch users error:', err);
    throw new Error(err.message || 'Failed to fetch users');
  }
};

/**
 * Get online users count by role
 * @param {string} role - Role: 'teacher' or 'student'
 * @returns {Promise<number>}
 */
export const getOnlineUsersCount = async (role) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('role', role)
      .eq('online_status', true);

    if (error) {
      throw error;
    }

    return data ? data.length : 0;
  } catch (err) {
    console.error('Fetch online users error:', err);
    throw new Error(err.message || 'Failed to fetch online users count');
  }
};

/**
 * Get total users count by role
 * @param {string} role - Role: 'teacher' or 'student'
 * @returns {Promise<number>}
 */
export const getTotalUsersCount = async (role) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('role', role);

    if (error) {
      throw error;
    }

    return data ? data.length : 0;
  } catch (err) {
    console.error('Fetch total users error:', err);
    throw new Error(err.message || 'Failed to fetch total users count');
  }
};

/**
 * Update user online status
 * @param {string} userId - User ID
 * @param {boolean} isOnline - Online status
 * @returns {Promise<{success: boolean}>}
 */
export const updateUserOnlineStatus = async (userId, isOnline) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ online_status: isOnline })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (err) {
    console.error('Update online status error:', err);
    throw new Error(err.message || 'Failed to update online status');
  }
};

/**
 * Change user password
 * @param {string} newPassword - New password
 * @returns {Promise<{success: boolean}>}
 */
export const changePassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (err) {
    console.error('Change password error:', err);
    throw new Error(err.message || 'Failed to change password');
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<{success: boolean}>}
 */
export const sendPasswordResetEmail = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (err) {
    console.error('Password reset error:', err);
    throw new Error(err.message || 'Failed to send password reset email');
  }
};
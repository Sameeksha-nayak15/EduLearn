import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { initDB } from '../services/indexedDB';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApproved, setIsApproved] = useState(false);

  // Initialize IndexedDB on mount
  useEffect(() => {
    initDB().catch((err) => console.error('IndexedDB initialization failed:', err));
  }, []);

  // Check auth state on mount and subscribe to changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);

          // Fetch user role and approval status from users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role, email')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error('User fetch error:', userError);
            setUserRole(null);
            setIsApproved(false);
          } else if (userData) {
            setUserRole(userData.role);
            setIsApproved(true);
          }
        } else {
          setUser(null);
          setUserRole(null);
          setIsApproved(false);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);

          // Fetch updated user data
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role, email')
            .eq('id', session.user.id)
            .single();

          if (userData) {
            setUserRole(userData.role);
            setIsApproved(true);
          }
        } else {
          setUser(null);
          setUserRole(null);
          setIsApproved(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signup = useCallback(async (email, password, name, role, collegeName) => {
    try {
      setError(null);

      // Check if email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('pending_requests')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('This email already has a pending signup request.');
      }

      // Create pending request (no auth user yet)
      const { data, error: insertError } = await supabase
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

      if (insertError) {
        throw new Error(`Failed to create signup request: ${insertError.message}`);
      }

      return {
        success: true,
        message: 'Signup request submitted successfully! Please wait for admin approval.',
        data,
      };
    } catch (err) {
      const errorMessage = err.message || 'Signup failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);

      // Check if user exists in users table (approved)
      const { data: userData, error: userCheckError } = await supabase
        .from('users')
        .select('id, role')
        .eq('email', email)
        .maybeSingle();

      if (userCheckError) {
        throw new Error(`Database error: ${userCheckError.message}`);
      }

      if (!userData) {
        throw new Error('User not found or not approved. Please contact admin.');
      }

      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(`Login failed: ${authError.message}`);
      }

      if (authData.user) {
        // Update online status
        await supabase
          .from('users')
          .update({ online_status: true })
          .eq('id', authData.user.id)
          .catch((err) => console.error('Online status update failed:', err));

        setUser(authData.user);
        setUserRole(userData.role);
        setIsApproved(true);

        return {
          success: true,
          user: authData.user,
          role: userData.role,
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setError(null);

      // Update online status
      if (user) {
        await supabase
          .from('users')
          .update({ online_status: false })
          .eq('id', user.id)
          .catch((err) => console.error('Online status update failed:', err));
      }

      // Sign out
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);
      setUserRole(null);
      setIsApproved(false);

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Logout failed';
      setError(errorMessage);
      throw err;
    }
  }, [user]);

  const value = {
    user,
    userRole,
    loading,
    error,
    isApproved,
    signup,
    login,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
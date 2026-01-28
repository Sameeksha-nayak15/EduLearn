import { supabase } from './supabase';

/**
 * Save or update video progress
 * @param {string} userId - User ID
 * @param {string} videoId - Video ID
 * @param {number} lastWatchedTime - Last watched time in seconds
 * @param {boolean} completed - Whether video is completed
 * @returns {Promise<object>}
 */
export const saveVideoProgress = async (userId, videoId, lastWatchedTime, completed = false) => {
  try {
    // Check if progress already exists
    const { data: existingProgress, error: checkError } = await supabase
      .from('video_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('video_id', videoId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is fine
      throw checkError;
    }

    let result;

    if (existingProgress) {
      // Update existing progress
      const { data, error } = await supabase
        .from('video_progress')
        .update({
          last_watched_time: lastWatchedTime,
          completed,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProgress.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      result = data;
    } else {
      // Create new progress record
      const { data, error } = await supabase
        .from('video_progress')
        .insert([
          {
            user_id: userId,
            video_id: videoId,
            last_watched_time: lastWatchedTime,
            completed,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      result = data;
    }

    return result;
  } catch (err) {
    console.error('Save video progress error:', err);
    throw new Error(err.message || 'Failed to save video progress');
  }
};

/**
 * Get video progress for a user
 * @param {string} userId - User ID
 * @param {string} videoId - Video ID
 * @returns {Promise<object>}
 */
export const getVideoProgress = async (userId, videoId) => {
  try {
    const { data, error } = await supabase
      .from('video_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('video_id', videoId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data || null;
  } catch (err) {
    console.error('Fetch video progress error:', err);
    throw new Error(err.message || 'Failed to fetch video progress');
  }
};

/**
 * Get all progress for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
export const getUserProgress = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('video_progress')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Fetch user progress error:', err);
    throw new Error(err.message || 'Failed to fetch user progress');
  }
};

/**
 * Mark video as completed
 * @param {string} userId - User ID
 * @param {string} videoId - Video ID
 * @returns {Promise<object>}
 */
export const markVideoAsCompleted = async (userId, videoId) => {
  try {
    const { data, error } = await supabase
      .from('video_progress')
      .update({
        completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('video_id', videoId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Mark as completed error:', err);
    throw new Error(err.message || 'Failed to mark video as completed');
  }
};

/**
 * Get completed videos for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
export const getCompletedVideos = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('video_progress')
      .select('video_id')
      .eq('user_id', userId)
      .eq('completed', true);

    if (error) {
      throw error;
    }

    return (data || []).map((p) => p.video_id);
  } catch (err) {
    console.error('Fetch completed videos error:', err);
    throw new Error(err.message || 'Failed to fetch completed videos');
  }
};

/**
 * Get in-progress videos for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
export const getInProgressVideos = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('video_progress')
      .select('video_id, last_watched_time')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Fetch in-progress videos error:', err);
    throw new Error(err.message || 'Failed to fetch in-progress videos');
  }
};

/**
 * Get completion percentage for a video (for a user)
 * @param {string} userId - User ID
 * @param {string} videoId - Video ID
 * @returns {Promise<number>}
 */
export const getCompletionPercentage = async (userId, videoId) => {
  try {
    const progress = await getVideoProgress(userId, videoId);

    if (!progress) {
      return 0;
    }

    // Note: This is a simplified calculation
    // In a real app, you'd have video duration from metadata
    // For now, we return a simple completion status
    return progress.completed ? 100 : Math.min(99, Math.round((progress.last_watched_time / 3600) * 100));
  } catch (err) {
    console.error('Calculate completion error:', err);
    return 0;
  }
};

/**
 * Get watch statistics for a video
 * @param {string} videoId - Video ID
 * @returns {Promise<object>}
 */
export const getVideoWatchStats = async (videoId) => {
  try {
    const { data: allProgress, error } = await supabase
      .from('video_progress')
      .select('*')
      .eq('video_id', videoId);

    if (error) {
      throw error;
    }

    const progress = allProgress || [];
    const completed = progress.filter((p) => p.completed).length;
    const inProgress = progress.length - completed;
    const avgWatchTime =
      progress.length > 0
        ? Math.round(progress.reduce((sum, p) => sum + p.last_watched_time, 0) / progress.length)
        : 0;

    return {
      totalWatches: progress.length,
      completed,
      inProgress,
      avgWatchTime,
    };
  } catch (err) {
    console.error('Fetch watch stats error:', err);
    throw new Error(err.message || 'Failed to fetch watch statistics');
  }
};

/**
 * Delete progress record
 * @param {string} userId - User ID
 * @param {string} videoId - Video ID
 * @returns {Promise<{success: boolean}>}
 */
export const deleteProgress = async (userId, videoId) => {
  try {
    const { error } = await supabase
      .from('video_progress')
      .delete()
      .eq('user_id', userId)
      .eq('video_id', videoId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (err) {
    console.error('Delete progress error:', err);
    throw new Error(err.message || 'Failed to delete progress');
  }
};
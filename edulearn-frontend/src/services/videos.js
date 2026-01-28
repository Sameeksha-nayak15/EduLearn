import { supabase } from './supabase';

/**
 * Upload video via YouTube URL
 * @param {object} videoData - {title, description, subject, videoUrl, uploadedBy}
 * @returns {Promise<object>}
 */
export const uploadYouTubeVideo = async (videoData) => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .insert([
        {
          title: videoData.title,
          description: videoData.description,
          subject: videoData.subject,
          video_url: videoData.videoUrl,
          video_type: 'youtube',
          uploaded_by: videoData.uploadedBy,
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    return data[0];
  } catch (err) {
    console.error('Upload YouTube video error:', err);
    throw new Error(err.message || 'Failed to upload video');
  }
};

/**
 * Upload video file to Supabase Storage
 * @param {File} file - Video file
 * @param {object} videoData - {title, description, subject, uploadedBy}
 * @returns {Promise<object>}
 */
export const uploadVideoFile = async (file, videoData) => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const storagePath = `videos/${videoData.uploadedBy}/${fileName}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // Create video record in database
    const { data, error: dbError } = await supabase
      .from('videos')
      .insert([
        {
          title: videoData.title,
          description: videoData.description,
          subject: videoData.subject,
          video_url: publicUrl,
          video_type: 'uploaded',
          uploaded_by: videoData.uploadedBy,
          storage_path: storagePath,
        },
      ])
      .select();

    if (dbError) {
      // Rollback: delete uploaded file if DB insertion fails
      await supabase.storage.from('videos').remove([storagePath]);
      throw dbError;
    }

    return data[0];
  } catch (err) {
    console.error('Upload video file error:', err);
    throw new Error(err.message || 'Failed to upload video file');
  }
};

/**
 * Get all videos
 * @returns {Promise<Array>}
 */
export const getAllVideos = async () => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Fetch all videos error:', err);
    throw new Error(err.message || 'Failed to fetch videos');
  }
};

/**
 * Get videos by teacher ID
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Array>}
 */
export const getVideosByTeacher = async (teacherId) => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('uploaded_by', teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Fetch videos by teacher error:', err);
    throw new Error(err.message || 'Failed to fetch videos');
  }
};

/**
 * Get video by ID
 * @param {string} videoId - Video ID
 * @returns {Promise<object>}
 */
export const getVideoById = async (videoId) => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Fetch video by ID error:', err);
    throw new Error(err.message || 'Failed to fetch video');
  }
};

/**
 * Get videos by subject
 * @param {string} subject - Subject name
 * @returns {Promise<Array>}
 */
export const getVideosBySubject = async (subject) => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('subject', subject)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Fetch videos by subject error:', err);
    throw new Error(err.message || 'Failed to fetch videos');
  }
};

/**
 * Search videos by title or description
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>}
 */
export const searchVideos = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const { data, error } = await supabase
      .from('videos')
      .select('*');

    if (error) {
      throw error;
    }

    return (data || []).filter(
      (video) =>
        video.title.toLowerCase().includes(lowerSearchTerm) ||
        video.description.toLowerCase().includes(lowerSearchTerm) ||
        video.subject.toLowerCase().includes(lowerSearchTerm)
    );
  } catch (err) {
    console.error('Search videos error:', err);
    throw new Error(err.message || 'Failed to search videos');
  }
};

/**
 * Update video details
 * @param {string} videoId - Video ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>}
 */
export const updateVideo = async (videoId, updates) => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', videoId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Update video error:', err);
    throw new Error(err.message || 'Failed to update video');
  }
};

/**
 * Delete video
 * @param {string} videoId - Video ID
 * @param {string} storagePath - Storage path (if uploaded file)
 * @returns {Promise<{success: boolean}>}
 */
export const deleteVideo = async (videoId, storagePath = null) => {
  try {
    // Delete from storage if uploaded file
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from('videos')
        .remove([storagePath]);

      if (storageError) {
        console.warn('Storage deletion warning:', storageError);
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (err) {
    console.error('Delete video error:', err);
    throw new Error(err.message || 'Failed to delete video');
  }
};

/**
 * Get video watch count (number of students who watched)
 * @param {string} videoId - Video ID
 * @returns {Promise<number>}
 */
export const getVideoWatchCount = async (videoId) => {
  try {
    const { data, error } = await supabase
      .from('video_progress')
      .select('id')
      .eq('video_id', videoId);

    if (error) {
      throw error;
    }

    return data?.length || 0;
  } catch (err) {
    console.error('Fetch watch count error:', err);
    throw new Error(err.message || 'Failed to fetch watch count');
  }
};

/**
 * Get detailed video analytics (for admin)
 * @returns {Promise<Array>}
 */
export const getVideoAnalytics = async () => {
  try {
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('id, title, uploaded_by')
      .order('created_at', { ascending: false });

    if (videosError) {
      throw videosError;
    }

    // Fetch teacher names and watch counts
    const analyticsData = await Promise.all(
      (videos || []).map(async (video) => {
        const { data: teacher } = await supabase
          .from('users')
          .select('name')
          .eq('id', video.uploaded_by)
          .single();

        const { data: progress } = await supabase
          .from('video_progress')
          .select('id')
          .eq('video_id', video.id);

        return {
          ...video,
          teacher_name: teacher?.name || 'Unknown',
          watch_count: progress?.length || 0,
        };
      })
    );

    return analyticsData;
  } catch (err) {
    console.error('Fetch video analytics error:', err);
    throw new Error(err.message || 'Failed to fetch video analytics');
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
 * Get all unique subjects
 * @returns {Promise<Array>}
 */
export const getAllSubjects = async () => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('subject')
      .neq('subject', null);

    if (error) {
      throw error;
    }

    // Extract unique subjects
    const uniqueSubjects = [...new Set((data || []).map((v) => v.subject))];
    return uniqueSubjects.sort();
  } catch (err) {
    console.error('Fetch subjects error:', err);
    throw new Error(err.message || 'Failed to fetch subjects');
  }
};
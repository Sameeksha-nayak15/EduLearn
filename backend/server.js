
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Supabase Config
const SUPABASE_URL = 'https://nwitcdidqaclokkxikrp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WVtWxgVLrYRiCyinoNLe6A_8jlGrrpn';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Backend Server Started - Port 5000\n');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Signup request - FAST VERSION (no duplicate checking)
app.post('/api/signup-request', async (req, res) => {
  const { email, name, role, collegeName } = req.body;

  try {
    if (!email || !name || !role || !collegeName) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    // Insert directly - database will reject duplicates
    const { error } = await supabase
      .from('pending_requests')
      .insert([{
        email: email.toLowerCase(),
        name: name.trim(),
        role: role.trim(),
        college_name: collegeName.trim(),
        status: 'pending'
      }]);

    if (error) {
      if (error.message.includes('duplicate') || error.message.includes('Unique')) {
        return res.json({ success: false, message: 'Email already registered' });
      }
      return res.json({ success: false, message: error.message });
    }

    return res.json({ 
      success: true, 
      message: 'Request submitted! Waiting for admin approval.'
    });

  } catch (err) {
    console.error('Error:', err.message);
    res.json({ success: false, message: 'Server error' });
  }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, password, college_name')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    if (user.password !== password) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    if (user.role !== 'admin') {
      return res.json({ success: false, message: 'Admin only' });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({ 
      success: true, 
      message: 'Login successful',
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.json({ success: false, message: 'Server error' });
  }
});

// Get pending requests
app.get('/api/admin/pending-requests', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pending_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      return res.json({ success: true, data: [] });
    }

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error:', error.message);
    res.json({ success: true, data: [] });
  }
});

// Approve request
app.post('/api/admin/approve-request', async (req, res) => {
  const { requestId, email, name, role, collegeName } = req.body;

  try {
    const tempPassword = 'TempPassword@123';

    // Create user
    const { error: createError } = await supabase
      .from('users')
      .insert([{
        email: email.toLowerCase(),
        name: name.trim(),
        role: role.trim(),
        college_name: collegeName.trim(),
        password: tempPassword
      }]);

    if (createError) {
      return res.json({ success: false, message: 'Failed to create user' });
    }

    // Update request status
    await supabase
      .from('pending_requests')
      .update({ status: 'approved' })
      .eq('id', requestId);

    res.json({ 
      success: true, 
      message: `User ${name} approved!`
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.json({ success: false, message: 'Server error' });
  }
});

// Reject request
app.post('/api/admin/reject-request', async (req, res) => {
  const { requestId } = req.body;

  try {
    await supabase
      .from('pending_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    res.json({ success: true, message: 'Request rejected' });
  } catch (error) {
    console.error('Error:', error.message);
    res.json({ success: false, message: 'Server error' });
  }
});

// Get all users
app.get('/api/admin/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, college_name, created_at')
      .order('created_at', { ascending: false });

    if (error) return res.json({ success: true, data: [] });
    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

// Get stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const results = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'teacher'),
      supabase.from('videos').select('id', { count: 'exact', head: true }),
      supabase.from('pending_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    res.json({
      success: true,
      data: {
        students: results[0].count || 0,
        teachers: results[1].count || 0,
        videos: results[2].count || 0,
        pending: results[3].count || 0
      }
    });
  } catch (error) {
    res.json({
      success: true,
      data: { students: 0, teachers: 0, videos: 0, pending: 0 }
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║  🚀 EduLearn Backend                  ║
║  Running on: http://localhost:5000    ║
╚═══════════════════════════════════════╝
`);
});
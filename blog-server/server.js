const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Data storage (in production, use a database)
const BLOG_DATA_FILE = path.join(__dirname, 'blog-data.json');
const EMAIL_SUBSCRIBERS_FILE = path.join(__dirname, 'email-subscribers.json');

// Initialize data files if they don't exist
async function initializeDataFiles() {
  try {
    await fs.access(BLOG_DATA_FILE);
  } catch {
    await fs.writeFile(BLOG_DATA_FILE, JSON.stringify([]));
  }
  
  try {
    await fs.access(EMAIL_SUBSCRIBERS_FILE);
  } catch {
    await fs.writeFile(EMAIL_SUBSCRIBERS_FILE, JSON.stringify([]));
  }
}

// Email configuration (you'll need to set up your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, '../blog.html'));
});

// Get all blog posts
app.get('/api/posts', async (req, res) => {
  try {
    const data = await fs.readFile(BLOG_DATA_FILE, 'utf8');
    const posts = JSON.parse(data);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load posts' });
  }
});

// Simple admin auth middleware
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const expected = process.env.ADMIN_TOKEN || 'admin-token';
  if (token !== expected) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Create new blog post (admin only)
app.post('/api/posts', requireAdmin, async (req, res) => {
  try {
    const { title, content, location, imageUrl } = req.body;
    
    const newPost = {
      id: Date.now().toString(),
      title,
      content,
      location,
      imageUrl,
      date: new Date().toISOString(),
      likes: 0,
      comments: []
    };

    const data = await fs.readFile(BLOG_DATA_FILE, 'utf8');
    const posts = JSON.parse(data);
    posts.unshift(newPost); // Add to beginning
    await fs.writeFile(BLOG_DATA_FILE, JSON.stringify(posts, null, 2));

    // Send email notification to subscribers
    await sendEmailNotification(newPost);

    res.json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update blog post (admin only)
app.put('/api/posts/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, location, imageUrl } = req.body;

    const data = await fs.readFile(BLOG_DATA_FILE, 'utf8');
    const posts = JSON.parse(data);
    
    const postIndex = posts.findIndex(post => post.id === id);
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    posts[postIndex] = {
      ...posts[postIndex],
      title,
      content,
      location,
      imageUrl,
      updatedAt: new Date().toISOString()
    };

    await fs.writeFile(BLOG_DATA_FILE, JSON.stringify(posts, null, 2));
    res.json(posts[postIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete blog post (admin only)
app.delete('/api/posts/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const data = await fs.readFile(BLOG_DATA_FILE, 'utf8');
    const posts = JSON.parse(data);
    
    const filteredPosts = posts.filter(post => post.id !== id);
    await fs.writeFile(BLOG_DATA_FILE, JSON.stringify(filteredPosts, null, 2));

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Add comment to post
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { author, text } = req.body;

    const data = await fs.readFile(BLOG_DATA_FILE, 'utf8');
    const posts = JSON.parse(data);
    
    const postIndex = posts.findIndex(post => post.id === id);
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = {
      id: Date.now().toString(),
      author: author || 'Anonymous',
      text,
      date: new Date().toISOString()
    };

    posts[postIndex].comments.push(newComment);
    await fs.writeFile(BLOG_DATA_FILE, JSON.stringify(posts, null, 2));

    res.json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Like/unlike post
app.post('/api/posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params;

    const data = await fs.readFile(BLOG_DATA_FILE, 'utf8');
    const posts = JSON.parse(data);
    
    const postIndex = posts.findIndex(post => post.id === id);
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    posts[postIndex].likes += 1;
    await fs.writeFile(BLOG_DATA_FILE, JSON.stringify(posts, null, 2));

    res.json({ likes: posts[postIndex].likes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Email subscription
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    const data = await fs.readFile(EMAIL_SUBSCRIBERS_FILE, 'utf8');
    const subscribers = JSON.parse(data);

    if (subscribers.includes(email)) {
      return res.status(400).json({ error: 'Email already subscribed' });
    }

    subscribers.push(email);
    await fs.writeFile(EMAIL_SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));

    res.json({ message: 'Successfully subscribed!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Unsubscribe
app.post('/api/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    const data = await fs.readFile(EMAIL_SUBSCRIBERS_FILE, 'utf8');
    const subscribers = JSON.parse(data);

    const filteredSubscribers = subscribers.filter(sub => sub !== email);
    await fs.writeFile(EMAIL_SUBSCRIBERS_FILE, JSON.stringify(filteredSubscribers, null, 2));

    res.json({ message: 'Successfully unsubscribed!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// Send email notification to subscribers
async function sendEmailNotification(post) {
  try {
    const data = await fs.readFile(EMAIL_SUBSCRIBERS_FILE, 'utf8');
    const subscribers = JSON.parse(data);

    if (subscribers.length === 0) return;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: subscribers.join(', '),
      subject: `New Post: ${post.title}`,
      html: `
        <h2>${post.title}</h2>
        <p><strong>Date:</strong> ${new Date(post.date).toLocaleDateString()}</p>
        ${post.location ? `<p><strong>Location:</strong> ${post.location}</p>` : ''}
        <p>${post.content.substring(0, 200)}...</p>
        <p><a href="${process.env.SITE_URL}/blog">Read the full post</a></p>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

// Admin authentication (simple password check)
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'visualvisage2024';
  const token = process.env.ADMIN_TOKEN || 'admin-token';

  if (password === adminPassword) {
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Initialize and start server
initializeDataFiles().then(() => {
  app.listen(PORT, () => {
    console.log(`Blog server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the site`);
    console.log(`Visit http://localhost:${PORT}/blog to view the blog`);
  });
}); 

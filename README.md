# Visual Visage Portfolio & Blog

A creative portfolio website featuring posters, photography, designs, and video work with an integrated blog system for sharing behind-the-scenes content and creative process.

## ✨ Features

- **Portfolio**: Nintendo-style game menu interface with portfolio categories
- **Blog System**: Full-featured blog with posts, comments, likes, and email notifications
- **Mobile Admin**: iPhone-friendly admin interface for managing blog posts
- **Email Notifications**: Automatic email alerts to subscribers when new posts are published
- **Location Support**: Add location tags to blog posts
- **Responsive Design**: Modern, clean design with pastel colors and rounded edges
- **Lava Lamp Background**: Animated gradient background matching the about page

## 🚀 Quick Start

### Phase 1: Deploy Basic Site (Ready Now!)

1. **Add placeholder images**:
   - Open `assets/placeholder-images.html` in your browser
   - Take screenshots and save as the required filenames
   - Or add your actual portfolio images

2. **Deploy to hosting**:
   - **Netlify** (Recommended): Drag and drop your folder to [netlify.com](https://netlify.com)
   - **Vercel**: Connect GitHub and deploy at [vercel.com](https://vercel.com)
   - **GitHub Pages**: Upload to GitHub and enable Pages

3. **Your site is live!** 🎉

### Phase 2: Add Blog Functionality (Optional)

1. **Set up the blog server**:
   ```bash
   cd blog-server
   npm install
   npm start
   ```

2. **Configure email notifications**:
   - Set up Gmail or other email service
   - Add environment variables for email configuration

3. **Access admin panel**:
   - Visit `yourdomain.com/admin.html`
   - Login with password: `visualvisage2024` (change this!)

## 📋 Blog Features

### **For Readers**
- **Email Subscriptions**: Get notified when new posts are published
- **Interactive Comments**: Leave comments on blog posts
- **Like Posts**: Show appreciation for posts
- **Location Tags**: See where posts were created
- **Responsive Reading**: Optimized for all devices

### **For You (Admin)**
- **Mobile-Friendly Admin**: Manage posts from your iPhone
- **Easy Post Creation**: Simple form to create new posts
- **Image Support**: Add images to your posts via URL
- **Location Tracking**: Add location tags to posts
- **Email Notifications**: Automatically notify subscribers
- **Post Management**: Edit and delete posts

## 📁 File Structure

```
├── index.html              # Homepage with blog preview
├── blog.html               # Main blog page
├── admin.html              # Mobile admin interface
├── about.html              # About page with lava lamp background
├── contact.html            # Contact page
├── shop.html               # Shop page
├── posters.html            # Posters portfolio
├── photos.html             # Photography portfolio
├── designs.html            # Designs portfolio
├── videos.html             # Video portfolio
├── style.css               # Main stylesheet
├── assets/                 # Images and media files
│   ├── placeholder-images.html  # Placeholder image guide
│   ├── posters-preview.jpg      # (Add your image)
│   ├── photo-preview.jpg        # (Add your image)
│   ├── design-preview.jpg       # (Add your image)
│   ├── video-preview.jpg        # (Add your image)
│   └── about-photo.jpg          # (Add your image)
├── blog-server/            # Backend server for blog
│   ├── server.js           # Express server with blog API
│   ├── package.json        # Node.js dependencies
│   ├── blog-data.json      # Blog posts storage
│   └── email-subscribers.json # Email subscribers
├── DEPLOYMENT.md           # Deployment instructions
└── README.md               # This file
```

## 🎨 Design Features

- **Lava Lamp Background**: Animated gradient blobs on about and blog pages
- **Nintendo-Style Menu**: Retro game-inspired homepage navigation
- **Glass Morphism**: Semi-transparent cards with backdrop blur
- **Responsive Design**: Works perfectly on all devices
- **Consistent Branding**: Visual Visage color scheme throughout
- **Blog Integration**: Seamless portfolio + blog experience

## 📧 Blog & Email System

### **Email Subscriptions**
- Readers can subscribe to get notified of new posts
- Automatic email notifications when you publish
- Easy unsubscribe functionality
- Email service integration (Gmail, etc.)

### **Blog Management**
- **Create Posts**: Title, content, location, images
- **Edit Posts**: Update existing content
- **Delete Posts**: Remove unwanted posts
- **View Analytics**: See likes and comments
- **Mobile Admin**: Manage from your iPhone

## 🔧 Customization

- **Update blog content** through the admin interface
- **Modify portfolio sections** in individual HTML files
- **Customize colors** and styling in `style.css`
- **Add new portfolio categories** by following existing structure
- **Replace placeholder images** with your actual work
- **Change admin password** in `blog-server/server.js`

## 💻 Technical Stack

### **Frontend**
- HTML5, CSS3, JavaScript
- Responsive design with CSS Grid/Flexbox
- Progressive Web App features

### **Backend** (Blog System)
- Node.js with Express
- File-based data storage (JSON)
- Email notifications with Nodemailer
- RESTful API for blog operations

### **Deployment**
- Static hosting for frontend (Netlify, Vercel, GitHub Pages)
- Backend hosting for blog (Heroku, Railway, DigitalOcean)

## 📖 Documentation

- **Deployment Guide**: See `DEPLOYMENT.md` for detailed hosting instructions
- **Placeholder Images**: Use `assets/placeholder-images.html` as a guide
- **Blog Setup**: See `blog-server/README.md` for backend configuration

## 🎯 Current Status

✅ **Complete**: All HTML pages, styling, navigation, blog system
✅ **Ready**: Email notifications and mobile admin
✅ **Functional**: Blog posts, comments, likes, subscriptions
🔄 **Next**: Add images, deploy, test functionality
⏳ **Future**: Custom domain, analytics, enhanced admin features

## 🔐 Security Notes

- **Change default admin password** in production
- **Use HTTPS** for all communications
- **Implement proper authentication** for admin access
- **Backup blog data** regularly
- **Use environment variables** for sensitive data

Your Visual Visage portfolio + blog is ready to launch! 🚀

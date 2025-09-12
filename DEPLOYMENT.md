# 🚀 Visual Visage - Deployment Guide

## Quick Deploy Options

### Option 1: Netlify (Recommended - Free)
1. **Go to [netlify.com](https://netlify.com)** and sign up
2. **Drag and drop** your entire project folder to the deploy area
3. **Your site is live!** Get a URL like `https://your-site-name.netlify.app`
4. **Custom domain** can be added later

### Option 2: Vercel (Free)
1. **Go to [vercel.com](https://vercel.com)** and sign up
2. **Connect your GitHub** (if you have the code on GitHub)
3. **Import your project** and deploy
4. **Get a URL** like `https://your-project.vercel.app`

### Option 3: GitHub Pages (Free)
1. **Create a GitHub repository**
2. **Upload your files** to the repo
3. **Go to Settings > Pages**
4. **Select source branch** (usually `main`)
5. **Your site is live** at `https://yourusername.github.io/repository-name`

## 📁 Files to Deploy

Make sure these files are in your deployment folder:
```
├── index.html
├── pricing.html
├── about.html
├── contact.html
├── shop.html
├── posters.html
├── photos.html
├── designs.html
├── videos.html
├── style.css
├── assets/
│   ├── posters-preview.jpg
│   ├── photo-preview.jpg
│   ├── design-preview.jpg
│   ├── video-preview.jpg
│   └── about-photo.jpg
└── README.md
```

## 🖼️ Adding Your Images

1. **Open** `assets/placeholder-images.html` in your browser
2. **Take screenshots** of the placeholder boxes
3. **Save them** with the correct filenames in the `assets/` folder
4. **Replace with your actual work** when ready

## 📧 Contact/Booking Forms

Both `contact.html` and `pricing.html` submit to a single backend endpoint:

- Base URL: `https://visualvisage-contact-form-server-production.up.railway.app`
- Endpoint: `POST /contact`
- JSON body: `{ "name": "...", "email": "...", "message": "..." }`

Server expects Gmail credentials via environment variables:

- `EMAIL_USER`: your Gmail address (e.g., `pastorwix@gmail.com`)
- `EMAIL_PASS`: Gmail App Password (16 characters)

Notes:
- The server sends mail with `From = EMAIL_USER` and `Reply-To = visitor email` for reliable delivery.
- `pricing.html` composes a detailed booking message string and sends it as `message`.

## 🔧 Next Steps After Deployment

1. **Test all pages** work correctly
2. **Check mobile responsiveness**
3. **Add your actual portfolio images**
4. **Set up a custom domain** (optional)
5. **Add Google Analytics** (optional)

## 💳 Adding Payment System Later

When you're ready for payments:
1. **Set up Stripe account**
2. **Create backend server** (Node.js/Express)
3. **Update pricing.html** to use Stripe
4. **Deploy backend** to Heroku/Railway

## 🎯 Quick Launch Checklist

- [x] All HTML pages created
- [x] Styling complete
- [x] Navigation working
- [ ] Add placeholder images
- [ ] Deploy to hosting platform
- [ ] Test all functionality
- [ ] Share your live URL!

## 📞 Need Help?

- **Netlify Support**: [docs.netlify.com](https://docs.netlify.com)
- **Vercel Support**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Pages**: [pages.github.com](https://pages.github.com)

Your site is ready to go live! 🎉 

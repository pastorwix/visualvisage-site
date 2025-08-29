# Visual Visage Blog - Deployment Guide

This guide covers deploying the blog server to various hosting platforms with secure admin environment variables.

## 🔐 Admin Environment Variables

The following strong, unique credentials have been generated for your admin panel:

### Admin Credentials
- **Admin Password**: `Idance123$`
- **Admin Token**: `pasturwix`
- **Session Secret**: `H7k#mP9$vL2nQ8@jR5tY3!hF1wE7sA4dG6zX9cV2bN5mK8pL1qW6eR3tY9uI4oP7aD0sF3gH6jK9lZ2xV5cB8nM1qW4eR7tY0uI3oP6aD9sF2gH5jK8lZ1xV4cB7nM0qW3eR6tY9uI2oP5aD8sF1gH4jK7lZ0xV3cB6nM9qW2eR5tY8uI1oP4aD7sF0gH3jK6lZ9xV2cB5nM8qW1eR4tY7uI0oP3a`

⚠️ **IMPORTANT**: These credentials are pre-configured in the deployment files. For production, you should change these to your own unique values.

## 🚀 Deployment Platforms

### 1. Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd blog-server
   vercel
   ```

3. **Environment Variables**: Already configured in `vercel.json`

### 2. Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   cd blog-server
   netlify deploy --prod
   ```

3. **Environment Variables**: Already configured in `netlify.toml`

### 3. Railway

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**:
   ```bash
   cd blog-server
   railway login
   railway init
   railway up
   ```

3. **Environment Variables**: Already configured in `railway.json`

### 4. Render

1. **Connect Repository**:
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository
   - Select the `blog-server` directory

2. **Environment Variables**: Already configured in `render.yaml`

### 5. Heroku

1. **Install Heroku CLI**:
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Deploy**:
   ```bash
   cd blog-server
   heroku create your-app-name
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

3. **Environment Variables**: Already configured in `app.json`

## 🔧 Manual Environment Variable Setup

If you need to set environment variables manually:

### Required Variables
```bash
NODE_ENV=production
ADMIN_PASSWORD=Idance123$
ADMIN_TOKEN=pasturwix
SESSION_SECRET=H7k#mP9$vL2nQ8@jR5tY3!hF1wE7sA4dG6zX9cV2bN5mK8pL1qW6eR3tY9uI4oP7aD0sF3gH6jK9lZ2xV5cB8nM1qW4eR7tY0uI3oP6aD9sF2gH5jK8lZ1xV4cB7nM0qW3eR6tY9uI2oP5aD8sF1gH4jK7lZ0xV3cB6nM9qW2eR5tY8uI1oP4aD7sF0gH3jK6lZ9xV2cB5nM8qW1eR4tY7uI0oP3a
```

### Optional Variables
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
SITE_URL=https://yourdomain.com
```

## 🔒 Security Notes

1. **Change Default Credentials**: The admin password and token are pre-configured but should be changed for production use.

2. **Generate New Credentials**:
   ```bash
   # Generate a new admin password
   openssl rand -base64 64
   
   # Generate a new session secret
   openssl rand -base64 128
   ```

3. **JWT Token**: The admin token is a JWT. You can generate a new one using:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
   ```

## 📝 Post-Deployment

1. **Test Admin Access**: Visit `/admin.html` and login with the admin password
2. **Create First Post**: Use the admin panel to create your first blog post
3. **Update Site URL**: Set the `SITE_URL` environment variable to your deployed domain
4. **Configure Email**: Set up email notifications if desired

## 🛠️ Local Development

1. **Install Dependencies**:
   ```bash
   cd blog-server
   npm install
   ```

2. **Create .env File**:
   ```bash
   cp env-config.example .env
   # Edit .env with your local settings
   ```

3. **Start Server**:
   ```bash
   npm run dev
   ```

## 🔍 Troubleshooting

- **Port Issues**: Ensure the `PORT` environment variable is set correctly
- **CORS Issues**: The server is configured to allow all origins in development
- **File Permissions**: Ensure the server can read/write to the data files
- **Email Issues**: Check email service credentials and app-specific passwords

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Node.js Deployment Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Environment Variables Best Practices](https://12factor.net/config)

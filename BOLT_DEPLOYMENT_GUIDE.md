# TrackAS Logistics Platform - Bolt AI Deployment Guide

## 🚀 Deployment Configuration

### 1. Environment Variables Setup
Create a `.env` file in your project root with the following variables:

```env
# Application Configuration
VITE_APP_NAME=TrackAS Logistics Platform
VITE_APP_VERSION=1.0.0

# Supabase Configuration (Replace with your actual credentials)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
VITE_API_BASE_URL=https://your-api-domain.com/api

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_REAL_TIME_TRACKING=true
VITE_ENABLE_PAYMENT_INTEGRATION=true

# Production Settings
NODE_ENV=production
VITE_APP_ENV=production
```

### 2. Bolt AI Configuration
The project includes a `bolt.json` file with optimized settings for Bolt AI deployment:

- **Framework**: React with Vite
- **Build Command**: `npm run build:bolt`
- **Output Directory**: `dist`
- **Port**: 3000
- **Node Version**: >=18.0.0

### 3. Build Optimization
The project is optimized for production with:
- ✅ Code splitting and chunk optimization
- ✅ Tree shaking and dead code elimination
- ✅ Minification with Terser
- ✅ Console log removal in production
- ✅ Source map disabled for security
- ✅ Optimized dependencies

### 4. Deployment Steps

1. **Prepare Environment**:
   ```bash
   # Install dependencies
   npm install
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your actual values
   ```

2. **Build for Production**:
   ```bash
   npm run build:bolt
   ```

3. **Deploy to Bolt AI**:
   - Connect your GitHub repository to Bolt AI
   - Bolt AI will automatically detect the `bolt.json` configuration
   - Set your environment variables in Bolt AI dashboard
   - Deploy!

### 5. Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test authentication flow
- [ ] Check real-time features
- [ ] Verify AI features are working
- [ ] Test payment integration
- [ ] Check mobile responsiveness
- [ ] Verify all user roles work correctly

### 6. Monitoring and Maintenance

- Monitor application performance
- Check error logs regularly
- Update dependencies as needed
- Monitor Supabase usage and limits

## 🔧 Troubleshooting

### Common Issues:
1. **Build Failures**: Check Node.js version (>=18.0.0)
2. **Environment Variables**: Ensure all required variables are set
3. **Supabase Connection**: Verify credentials and project status
4. **Chunk Size Warnings**: Normal for large applications, can be ignored

### Support:
- Check console logs for errors
- Verify network connectivity
- Test with different browsers
- Check Supabase dashboard for API issues

## 📱 Features Included

- ✅ Multi-role authentication (Admin, Shipper, Fleet, Individual)
- ✅ Real-time shipment tracking
- ✅ AI-powered route optimization
- ✅ Payment management system
- ✅ Document verification workflow
- ✅ Analytics and reporting
- ✅ Mobile-responsive design
- ✅ Real-time notifications
- ✅ Customer tracking portal
- ✅ Fleet management
- ✅ Individual vehicle owner dashboard

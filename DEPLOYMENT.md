# Deployment Guide for Rugezi Marshland System

## Deploying to Render

### Prerequisites
- GitHub repository with the code
- Render account (free tier available)
- PostgreSQL database on Render

### Step 1: Push Code to GitHub
Ensure all your code is pushed to GitHub:
```bash
git add .
git commit -m "Add Render deployment configuration"
git push
```

### Step 2: Create Render Services

#### Option A: Using render.yaml (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" > "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect and deploy based on `render.yaml`

#### Option B: Manual Setup
1. **Create PostgreSQL Database**
   - Go to Render Dashboard > New > PostgreSQL
   - Name: `marshland-db`
   - Database: `marshland_db`
   - User: `marshland_user`
   - Region: Choose closest to your users
   - Click "Create Database"

2. **Create Backend Service**
   - Go to Render Dashboard > New > Web Service
   - Connect your GitHub repository
   - Name: `marshland-backend`
   - Runtime: Java
   - Build Command: `./mvnw clean package -DskipTests`
   - Start Command: `java -jar Marshland_system/target/Marshland_system-0.0.1-SNAPSHOT.jar`
   - Add Environment Variables:
     - `SPRING_DATASOURCE_URL`: From database connection string
     - `SPRING_DATASOURCE_USERNAME`: From database
     - `SPRING_DATASOURCE_PASSWORD`: From database
     - `SPRING_JPA_HIBERNATE_DDL_AUTO`: `update`
     - `SERVER_PORT`: `8080`
     - `SPRING_PROFILES_ACTIVE`: `prod`

3. **Create Frontend Service**
   - Go to Render Dashboard > New > Web Service
   - Connect your GitHub repository
   - Name: `marshland-frontend`
   - Runtime: Node
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add Environment Variables:
     - `REACT_APP_API_URL`: `https://marshland-backend.onrender.com`
     - `PORT`: `3000`

### Step 3: Configure Environment Variables

#### Backend Environment Variables
- `SPRING_DATASOURCE_URL`: PostgreSQL connection string
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password
- `SPRING_JPA_HIBERNATE_DDL_AUTO`: `update` (for initial setup)
- `SERVER_PORT`: `8080`
- `SPRING_PROFILES_ACTIVE`: `prod`
- `app.upload.dir`: `/tmp/uploads`

#### Frontend Environment Variables
- `REACT_APP_API_URL`: Backend URL (e.g., `https://marshland-backend.onrender.com`)

### Step 4: Upload Directory Setup
The application uses `/tmp/uploads` for file storage on Render. This directory is ephemeral and will be reset on each deployment. For persistent storage, consider using Render's Disk feature or an external object storage service.

### Step 5: Test the Deployment
1. Wait for both services to finish deploying
2. Access the frontend at: `https://marshland-backend.onrender.com`
3. Test user registration and login
4. Test file uploads (may fail due to ephemeral storage)
5. Test booking system

### Troubleshooting

#### Database Connection Issues
- Ensure PostgreSQL database is running
- Check connection string format
- Verify database credentials

#### File Upload Issues
- `/tmp/uploads` is ephemeral - files will be lost on redeploy
- Consider using Render Disk for persistent storage
- Or use external object storage (AWS S3, etc.)

#### Build Failures
- Check build logs in Render dashboard
- Ensure Maven wrapper is committed to git
- Verify Node.js version compatibility

#### API Connection Issues
- Check that backend URL is correct in frontend environment variables
- Verify CORS configuration in backend
- Check firewall/security settings

### Post-Deployment Tasks

1. **Set up persistent storage** for uploaded files
2. **Configure SSL/TLS** (automatically provided by Render)
3. **Set up monitoring** and logging
4. **Configure backup strategy** for database
5. **Update DNS** if using custom domain

### Cost Considerations
- Render Free Tier:
  - Web Services: Free (with sleep after 15 min inactivity)
  - PostgreSQL: Free (90 day limit)
  - Disk: Not available on free tier

- For production, consider:
  - Paid web services ($7/month)
  - Paid PostgreSQL ($7/month)
  - Disk storage for file uploads

### Alternative Deployment Options
- Vercel (Frontend only)
- Netlify (Frontend only)
- AWS/Google Cloud/Azure (Full stack)
- DigitalOcean App Platform
- Heroku

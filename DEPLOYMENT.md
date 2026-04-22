# Deployment Guide for Rugezi Marshland System

## Deploying to Render

### Prerequisites
- GitHub repository with the code
- Render account (free tier available)
- MySQL database (external provider) OR switch to PostgreSQL

### Important Note About MySQL
**Render does not support MySQL databases natively.** They only support PostgreSQL. Since your application uses MySQL, you have three options:

1. **Use an external MySQL provider** (recommended for keeping MySQL)
2. **Switch to PostgreSQL** (recommended for Render compatibility)
3. **Use Render's PostgreSQL** (requires code changes)

### Option 1: External MySQL Provider
Use a cloud MySQL service like:
- **PlanetScale** (free tier available)
- **AWS RDS** (paid)
- **Google Cloud SQL** (paid)
- **Azure Database for MySQL** (paid)
- **Neon** (PostgreSQL-based but MySQL-compatible)

#### Using PlanetScale (Recommended for MySQL)
1. Create a free account at [PlanetScale](https://planetscale.com/)
2. Create a new database
3. Get the connection string (MySQL format)
4. Use the connection string in Render environment variables

### Step 1: Push Code to GitHub
Ensure all your code is pushed to GitHub:
```bash
git add .
git commit -m "Add Render deployment configuration"
git push
```

### Step 2: Create External MySQL Database (PlanetScale)
1. Go to [PlanetScale](https://planetscale.com/) and create a free account
2. Create a new database named `marshland_db`
3. Get the connection string (format: `mysql://user:password@host/database`)
4. Copy the connection details

### Step 3: Create Render Services (Manual Setup)

#### Backend Service
1. Go to Render Dashboard > New > Web Service
2. Connect your GitHub repository
3. Name: `marshland-backend`
4. Runtime: Java
5. Build Command: `./mvnw clean package -DskipTests`
6. Start Command: `java -jar Marshland_system/target/Marshland_system-0.0.1-SNAPSHOT.jar`
7. Add Environment Variables:
   - `SPRING_DATASOURCE_URL`: Your PlanetScale MySQL connection string
   - `SPRING_DATASOURCE_USERNAME`: Your PlanetScale username
   - `SPRING_DATASOURCE_PASSWORD`: Your PlanetScale password
   - `SPRING_JPA_HIBERNATE_DDL_AUTO`: `update`
   - `SERVER_PORT`: `8080`
   - `SPRING_PROFILES_ACTIVE`: `prod`
   - `app.upload.dir`: `/tmp/uploads`

#### Frontend Service
1. Go to Render Dashboard > New > Web Service
2. Connect your GitHub repository
3. Name: `marshland-frontend`
4. Runtime: Node
5. Root Directory: `frontend`
6. Build Command: `npm install && npm run build`
7. Start Command: `npm start`
8. Add Environment Variables:
   - `REACT_APP_API_URL`: `https://marshland-backend.onrender.com`
   - `PORT`: `3000`

### Step 4: Upload Directory Setup
The application uses `/tmp/uploads` for file storage on Render. This directory is ephemeral and will be reset on each deployment. For persistent storage, consider using Render's Disk feature or an external object storage service.

### Step 5: Test the Deployment
1. Wait for both services to finish deploying
2. Access the frontend at: `https://marshland-frontend.onrender.com`
3. Test user registration and login
4. Test file uploads (may fail due to ephemeral storage)
5. Test booking system

### Troubleshooting

#### Database Connection Issues
- Ensure PlanetScale MySQL database is running
- Check connection string format (should be MySQL format)
- Verify database credentials
- Ensure PlanetScale allows connections from Render's IP addresses

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
  - PlanetScale MySQL: Free tier available (5GB storage, 1 billion reads/month)
  - Disk: Not available on free tier

- For production, consider:
  - Paid web services ($7/month)
  - Paid PlanetScale MySQL ($29/month for larger databases)
  - Disk storage for file uploads

### Alternative Deployment Options
- Vercel (Frontend only)
- Netlify (Frontend only)
- AWS/Google Cloud/Azure (Full stack)
- DigitalOcean App Platform
- Heroku

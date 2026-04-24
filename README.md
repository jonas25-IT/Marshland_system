# Rugezi Marshland Management System

The Digital Eco-Tourism and Biodiversity Management System is a comprehensive web-based platform for Rugezi Marshland, Rwanda. It manages visitors, tracks biodiversity, supports conservation efforts, and provides advanced reporting and dashboard capabilities to improve operational efficiency, environmental awareness, and sustainable tourism practices.

## 🌟 System Overview

The Marshland Management System is a full-stack application designed to streamline eco-tourism operations while supporting biodiversity conservation. The system provides role-based access control for different user types, ensuring that each user has appropriate tools and permissions for their specific responsibilities.

### Key Features
- **Visitor Management**: Complete booking system with approval workflows
- **Biodiversity Tracking**: Species database with conservation status monitoring
- **Role-Based Access**: Four distinct user roles with tailored dashboards
- **Real-time Analytics**: Live data visualization and reporting
- **Multi-language Support**: Internationalization for global accessibility
- **Gallery Management**: Visual documentation of marshland ecosystem
- **Activity Logging**: Comprehensive system activity tracking
- **Responsive Design**: Mobile-friendly interface for field operations

## 👥 User Roles and Permissions

### 1. Tourist
**Primary Users**: Visitors to the marshland who book tours and explore the ecosystem.

**Key Features**:
- **Tour Browsing**: View available tour packages and visit dates
- **Booking Management**: Create and manage personal bookings
- **Gallery Access**: Browse visual documentation of the marshland
- **Profile Management**: Update personal information and preferences
- **Booking Status Tracking**: Monitor approval status of tour requests

**Dashboard**: Tourist Dashboard with personal booking history, available tours, and gallery access

### 2. Staff
**Primary Users**: On-site staff responsible for visitor management and daily operations.

**Key Features**:
- **Booking Management**: View, approve, and reject booking requests
- **Visitor Check-in**: Process visitor arrivals and check-ins
- **Real-time Monitoring**: Live capacity monitoring and visitor tracking
- **Activity Logging**: Record operational activities and incidents
- **Tour Assistance**: Support visitors during their marshland experience
- **Incident Reporting**: Document and report any operational incidents

**Dashboard**: Staff Dashboard with today's bookings, capacity monitoring, live action center, and activity logs

### 3. Ecologist
**Primary Users**: Conservation scientists and researchers studying the marshland ecosystem.

**Key Features**:
- **Species Management**: Complete CRUD operations for species database
- **Conservation Tracking**: Monitor species conservation status and trends
- **Data Analytics**: Advanced ecological analysis and statistics
- **Census Data**: Population tracking and demographic analysis
- **Mapping**: Geographic visualization of species distribution and habitats
- **Gallery Management**: Upload and manage visual documentation
- **Research Support**: Tools for biodiversity research and documentation

**Dashboard**: Ecologist Dashboard with species database, analytics, census data, mapping, and gallery management

### 4. Admin
**Primary Users**: System administrators with full control over platform operations.

**Key Features**:
- **User Management**: Create, update, and delete user accounts
- **Role Assignment**: Assign and modify user roles and permissions
- **Booking Oversight**: Complete view and control of all bookings
- **Species Database**: Full access to species management
- **System Monitoring**: Activity logs and system health monitoring
- **Configuration**: System settings and operational parameters
- **Reports Generation**: Generate comprehensive operational reports

**Dashboard**: Admin Dashboard with user management, booking oversight, species database, reports, and system monitoring

## 🏗️ System Architecture

### Technology Stack

| Layer    | Technology                        | Purpose                          |
|----------|-----------------------------------|----------------------------------|
| Backend  | Java 17, Spring Boot 3.2, JPA     | REST API, business logic         |
| Frontend | React 18, Vite 5, Tailwind CSS    | User interface, SPA              |
| Database | MySQL 8                           | Data persistence                 |
| Auth     | JWT (jjwt)                        | Authentication & authorization   |
| Deployment| Render, Docker                   | Cloud hosting & containerization |

### Project Structure

```
├── backend/                 ← Spring Boot API (Java 17)
│   ├── src/main/java/
│   │   └── com/rugezi/marshland/
│   │       ├── controller/   ← REST API endpoints
│   │       ├── service/      ← Business logic
│   │       ├── entity/       ← Database models
│   │       ├── repository/   ← Data access layer
│   │       ├── security/     ← JWT authentication
│   │       └── config/       ← Application configuration
│   └── src/main/resources/
│       └── application.properties
├── frontend/                ← React SPA (Vite)
│   ├── src/
│   │   ├── components/       ← Reusable UI components
│   │   ├── pages/           ← Page-level components
│   │   ├── contexts/       ← React contexts (Auth, etc.)
│   │   ├── utils/           ← Utility functions
│   │   └── App.jsx          ← Main application component
│   └── package.json
├── docs/                    ← Documentation
│   ├── DEPLOYMENT.md
│   └── USER_MANUAL.md
├── docker-compose.yml
├── render.yaml
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0
- Maven (or use the included `mvnw` wrapper)

### Backend Setup

1. **Configure Database**
   ```bash
   # Update backend/src/main/resources/application.properties
   spring.datasource.url=jdbc:mysql://localhost:3306/marshland_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

2. **Run Backend**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   The API will start on `http://localhost:8081`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   The UI will start on `http://localhost:3000`

## 🔐 Authentication & Authorization

The system uses JWT (JSON Web Tokens) for authentication and role-based access control for authorization.

### Authentication Flow
1. User logs in with email and password
2. Backend validates credentials and generates JWT token
3. Token includes user ID, email, and role information
4. Frontend stores token and includes it in API requests
5. Backend validates token on each protected endpoint

### Role-Based Access Control
- **@PreAuthorize** annotations on backend endpoints
- Role checks in frontend routing and component rendering
- Granular permissions for different operations
- Automatic redirection based on user role

## 📊 Key Features by Role

### Tourist Features
- Browse available tour packages and visit dates
- Create booking requests with special requirements
- Track booking status (Pending → Approved → Checked-in)
- View gallery of marshland ecosystem
- Manage personal profile and preferences

### Staff Features
- View today's bookings and visitor schedule
- Approve or reject pending booking requests
- Check-in visitors upon arrival
- Monitor real-time capacity (max 50 visitors/day)
- Record operational activities and incidents
- Provide tour assistance to visitors

### Ecologist Features
- Manage species database (CRUD operations)
- Track conservation status and population trends
- Analyze ecological data with advanced analytics
- View census data and demographic information
- Access geographic mapping of species distribution
- Upload and manage visual documentation in gallery

### Admin Features
- Complete user management (create, update, delete users)
- Assign and modify user roles and permissions
- Oversee all bookings and booking operations
- Full access to species database management
- Monitor system activity and generate reports
- Configure system settings and parameters

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Booking Management
- `GET /api/booking/all` - Get all bookings (filtered by status)
- `POST /api/booking/{id}/approve` - Approve booking (Admin/Staff)
- `POST /api/booking/{id}/reject` - Reject booking (Admin/Staff)
- `GET /api/booking/daily` - Get daily bookings

### Species Management
- `GET /api/species/all` - Get all species
- `POST /api/species` - Create new species (Ecologist/Admin)
- `PUT /api/species/{id}` - Update species (Ecologist/Admin)
- `DELETE /api/species/{id}` - Delete species (Ecologist/Admin)

### User Management
- `GET /api/admin/users` - Get all users (Admin)
- `POST /api/admin/users` - Create user (Admin)
- `PUT /api/admin/users/{id}` - Update user (Admin)
- `DELETE /api/admin/users/{id}` - Delete user (Admin)

### Dashboard Data
- `GET /api/admin/dashboard` - Admin dashboard statistics
- `GET /api/staff/dashboard` - Staff dashboard statistics
- `GET /api/ecologist/dashboard` - Ecologist dashboard statistics
- `GET /api/tourist/dashboard` - Tourist dashboard statistics

## 🎨 Frontend Components

### Core Components
- **DashboardLayout**: Main layout with navigation and sidebar
- **AuthContext**: Authentication state management
- **Settings**: User settings and preferences
- **Profile**: User profile management
- **NotificationsList**: System notifications

### Dashboard Pages
- **AdminDashboard**: Admin-specific dashboard
- **StaffDashboard**: Staff-specific dashboard
- **EcologistDashboardEnhanced**: Ecologist-specific dashboard
- **TouristDashboard**: Tourist-specific dashboard

### Feature Components
- **GalleryManagement**: Photo upload and management
- **SpeciesTable**: Species data display and management
- **BookingTable**: Booking display and management
- **Analytics**: Data visualization and charts
- **Mapping**: Geographic visualization

## 📱 Responsive Design

The system is fully responsive and optimized for:
- **Desktop**: Full-featured experience with all functionalities
- **Tablet**: Optimized layout with touch-friendly controls
- **Mobile**: Streamlined interface for field operations

## 🌍 Multi-language Support

The system supports internationalization with:
- English (primary)
- French
- Kinyarwanda
- Extensible architecture for additional languages

## 🔧 System Configuration

### Environment Variables
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: JWT signing secret
- `FRONTEND_URL`: Frontend application URL

### Capacity Limits
- **Daily Visitor Limit**: 50 visitors per day
- **Booking Approval**: Required before check-in
- **Role-based Limits**: Different limits per user role

## 📈 Monitoring & Logging

### System Activity Logging
- User login/logout events
- Booking creation, approval, rejection
- Species database modifications
- System configuration changes
- Error tracking and reporting

### Performance Monitoring
- API response times
- Database query performance
- Frontend load times
- User engagement metrics

## 🚢 Deployment

### Production Deployment
The system is deployed on Render with:
- **Backend**: Spring Boot application
- **Frontend**: React application
- **Database**: MySQL managed database
- **Storage**: Persistent disk for file uploads

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

## 🤝 Contributing

This is a private project for Rugezi Marshland management. For contributions or support, please contact the system administrators.

## 📄 License

This project is proprietary software for Rugezi Marshland management. All rights reserved.

## 📞 Support

For technical support or questions about the system, please contact:
- **System Administrator**: admin@rugezimarshland.rw
- **Technical Support**: support@rugezimarshland.rw

## 🔄 Version History

### Current Version: 1.0.0
- Initial release with core functionality
- Four user roles with role-based dashboards
- Complete booking management system
- Species database and conservation tracking
- Gallery management and visual documentation
- Multi-language support
- Responsive design for mobile operations
- Real-time analytics and reporting

---

**Rugezi Marshland Management System** - Promoting sustainable eco-tourism and biodiversity conservation in Rwanda's precious marshland ecosystem.

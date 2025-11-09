# Installation Guide

## Prerequisites

### Required Software
- **Node.js 18+**: JavaScript runtime (or use container)
- **Podman**: Container runtime (for containerized deployment)
- **Git**: Version control (optional, for cloning)

### System Requirements
- **Operating System**: Linux, macOS, or Windows
- **Memory**: Minimum 512MB RAM
- **Disk Space**: ~500MB for node_modules and build
- **Network**: Internet access for npm packages

## Installation Methods

### Method 1: Containerized Deployment (Recommended)

#### Step 1: Build Docker Image
```bash
cd openflow-frontend
podman build -t openflow-frontend:latest .
```

#### Step 2: Run Container
```bash
podman run -d \
  --name openflow-frontend \
  -p 3000:3000 \
  -e VITE_API_BASE_URL=/api \
  openflow-frontend:latest
```

#### Step 3: Verify Installation
```bash
curl http://localhost:3000
```

### Method 2: Local Development (Not Recommended)

Note: Per golden rules, prefer containerized approach. This is for reference only.

#### Step 1: Clone Repository
```bash
git clone https://github.com/DiegoBarrosA/openflow-frontend.git
cd openflow-frontend
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Start Development Server
```bash
npm run dev
```

#### Step 4: Access Application
- Open `http://localhost:3000` in browser

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API base URL | `/api` | No |
| `VITE_APP_TITLE` | Application title | `OpenFlow` | No |

### Development Configuration

Create `.env.local` (not committed):
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Production Configuration

Set via environment variables in container:
```bash
-e VITE_API_BASE_URL=/api
```

## Build Process

### Development Build
```bash
npm run dev
```
- Starts Vite dev server
- Hot Module Replacement (HMR)
- Fast refresh enabled

### Production Build
```bash
npm run build
```
- Creates optimized bundle in `dist/`
- Minifies JavaScript and CSS
- Tree-shaking enabled
- Source maps generated

### Preview Production Build
```bash
npm run preview
```
- Serves production build locally
- Tests production configuration

## Container Configuration

### Dockerfile Stages
1. **Build Stage**: Install dependencies and build application
2. **Production Stage**: Copy build to Nginx and configure

### Nginx Configuration

The `nginx.conf` file:
- Serves static files from `/usr/share/nginx/html`
- Proxies `/api` requests to backend
- Handles client-side routing
- Configures CORS headers

## Integration with Backend

### API Configuration
1. Ensure backend is running
2. Configure `VITE_API_BASE_URL` to match backend
3. Verify CORS settings in backend
4. Test API connectivity

### Development Setup
```bash
# Terminal 1: Backend
cd ../openflow-backend
mvn spring-boot:run

# Terminal 2: Frontend
cd openflow-frontend
npm run dev
```

## Verification

### Health Check
1. Open `http://localhost:3000`
2. Should see login page
3. Check browser console for errors
4. Verify API connectivity

### Build Verification
```bash
# Build application
npm run build

# Check build output
ls -la dist/

# Preview build
npm run preview
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Change port in vite.config.js
server: {
  port: 3001
}
```

### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Container Issues
```bash
# Check container logs
podman logs openflow-frontend

# Check container status
podman ps -a

# Rebuild container
podman build --no-cache -t openflow-frontend:latest .
```

### API Connection Issues
- Verify backend is running
- Check CORS configuration
- Verify API_BASE_URL setting
- Check browser network tab

## Next Steps

After installation:
1. Review [Component Documentation](api.md)
2. Check [Testing Guide](testing.md)
3. Read [Workflows](workflows.md)
4. Configure production environment
5. Set up CI/CD pipeline





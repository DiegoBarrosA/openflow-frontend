# Dependencies

## Production Dependencies

### React
- **Version**: ^18.2.0
- **Purpose**: UI library for building user interfaces
- **Features Used**: Hooks, Context, Component composition

### React DOM
- **Version**: ^18.2.0
- **Purpose**: React renderer for web browsers
- **Required**: Yes, for React web applications

### React Router DOM
- **Version**: ^6.20.0
- **Purpose**: Client-side routing
- **Features Used**: BrowserRouter, Routes, Route, Navigate, useNavigate, useParams

### Axios
- **Version**: ^1.6.2
- **Purpose**: HTTP client for API requests
- **Features Used**: Interceptors, request/response handling

## Development Dependencies

### Vite
- **Version**: ^5.0.8
- **Purpose**: Build tool and development server
- **Features**: Fast HMR, optimized builds, ES modules

### @vitejs/plugin-react
- **Version**: ^4.2.1
- **Purpose**: Vite plugin for React support
- **Required**: Yes, for React with Vite

### Tailwind CSS
- **Version**: ^3.4.0
- **Purpose**: Utility-first CSS framework
- **Configuration**: Custom color palette, responsive utilities

### PostCSS
- **Version**: ^8.4.32
- **Purpose**: CSS processing tool
- **Used By**: Tailwind CSS

### Autoprefixer
- **Version**: ^10.4.16
- **Purpose**: Automatically adds vendor prefixes
- **Used By**: PostCSS

### Type Definitions
- **@types/react**: ^18.2.43
- **@types/react-dom**: ^18.2.17
- **Purpose**: TypeScript definitions for React (for IDE support)

## Dependency Tree

```mermaid
graph TD
    A[React 18.2.0] --> B[React DOM]
    A --> C[React Router DOM]
    
    D[Vite 5.0.8] --> E[@vitejs/plugin-react]
    D --> F[PostCSS]
    F --> G[Autoprefixer]
    F --> H[Tailwind CSS]
    
    I[Axios 1.6.2] --> J[HTTP Client]
```

## Version Management

### Update Strategy
- Patch updates: Automatic (^)
- Minor updates: Review and test
- Major updates: Careful migration planning

### Security Updates
- Regular dependency audits
- Use `npm audit` or `yarn audit`
- Update vulnerable dependencies promptly

## Build Dependencies

### Node.js
- **Version**: 18+ (Alpine in container)
- **Purpose**: JavaScript runtime
- **Required**: For build process

### npm
- **Version**: Bundled with Node.js
- **Purpose**: Package manager
- **Note**: Not used directly in containers

## Runtime Dependencies

### Nginx (Production)
- **Version**: Alpine (latest)
- **Purpose**: Web server and reverse proxy
- **Configuration**: Custom nginx.conf

## Browser Support

### Modern Browsers
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

### Features Used
- ES6+ JavaScript
- CSS Grid and Flexbox
- Fetch API (via Axios)
- LocalStorage API

## Dependency Size

### Production Bundle
- Estimated size: ~200KB gzipped
- Includes: React, React Router, Axios, application code

### Development Bundle
- Includes: Vite, HMR, dev tools
- Not included in production build

## Dependency Management

### Installing Dependencies
```bash
# In container (recommended)
podman run -v $(pwd):/app -w /app node:18-alpine npm install

# Local (not recommended per golden rules)
npm install
```

### Updating Dependencies
```bash
# Check for updates
npm outdated

# Update patch versions
npm update

# Update specific package
npm install package@latest
```

## Security Considerations

- All dependencies from npm registry
- Regular security audits
- Keep dependencies up-to-date
- Review transitive dependencies
- Use lock files (package-lock.json)

## Known Dependencies

### React Ecosystem
- React: Core library
- React DOM: Browser renderer
- React Router: Routing solution

### Build Tools
- Vite: Modern build tool
- PostCSS: CSS processing
- Tailwind: CSS framework

### HTTP Client
- Axios: Promise-based HTTP client

## Optional Dependencies

Consider adding for future enhancements:
- React Query: Server state management
- Zustand: Lightweight state management
- React Hook Form: Form management
- Vitest: Testing framework





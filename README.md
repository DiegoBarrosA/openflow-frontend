# OpenFlow Frontend

Modern React-based user interface for OpenFlow, a Trello-like project management application.

## Quick Start

### Containerized Deployment

```bash
podman build -t openflow-frontend:latest .
podman run -d -p 3000:3000 openflow-frontend:latest
```

### Local Development

```bash
npm install
npm run dev
```


## Documentation

Comprehensive documentation is available in the `/docs` directory:

- [Overview](docs/overview.md) - Project summary, goals, and features
- [Architecture](docs/architecture.md) - File structure and component design
- [Coding Standards](docs/coding-standards.md) - Naming conventions and best practices
- [Dependencies](docs/dependencies.md) - Dependency list with versions
- [Installation](docs/installation.md) - Setup and installation instructions
- [Testing](docs/testing.md) - Testing framework and guidelines
- [Component API](docs/api.md) - Component documentation and usage
- [Workflows](docs/workflows.md) - Common tasks and development workflows
- [Glossary](docs/glossary.md) - Terms and acronyms

## Features

- Responsive design (mobile, tablet, desktop)
- Drag and drop task management
- JWT-based authentication
- Accessible UI (WCAG 2.1 Level AA)
- Low-contrast, calm color palette
- Touch-friendly interface

## Technology Stack

- React 18.2.0
- React Router 6.20.0
- Vite 5.0.8
- Tailwind CSS 3.4.0
- Axios 1.6.2

## Development

- **Dev Server**: `http://localhost:3000`
- **API Base URL**: Configured via `VITE_API_BASE_URL`
- **Hot Reload**: Enabled in development mode

## Build

```bash
npm run build
```

Production build outputs to `dist/` directory.

## License

[Add license information]
# Rebuild trigger

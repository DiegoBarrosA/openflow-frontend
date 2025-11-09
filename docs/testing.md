# Testing Framework and Guidelines

## Testing Strategy

Tests run in Podman containers to ensure consistency. All tests execute in a containerized environment without requiring native Node.js installations.

## Testing Framework

### Recommended Framework: Vitest
- Fast test runner
- Vite-compatible
- Jest-compatible API
- ES modules support

### Alternative: Jest
- Mature testing framework
- Extensive ecosystem
- Good React support

## Test Structure

```
src/
├── components/
│   ├── Board.test.jsx
│   ├── BoardList.test.jsx
│   ├── Login.test.jsx
│   └── Task.test.jsx
├── services/
│   └── api.test.js
└── __tests__/          # Integration tests
```

## Running Tests

### Containerized Testing
```bash
# Build test image
podman build -t openflow-frontend-test:latest -f Dockerfile.test .

# Run tests in container
podman run --rm openflow-frontend-test:latest npm test
```

### Local Development (Not Recommended)
```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

## Test Examples

### Component Test
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Login from '../components/Login';

describe('Login Component', () => {
  it('should render login form', () => {
    render(<Login />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    const mockNavigate = vi.fn();
    render(<Login />);
    
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Assertions
  });
});
```

### Service Test
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../services/api';

describe('API Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should add token to requests', async () => {
    localStorage.setItem('token', 'test-token');
    // Mock axios and test interceptor
  });

  it('should handle 401 errors', async () => {
    // Test error handling
  });
});
```

## Testing Best Practices

### Component Testing
- Test user interactions
- Test accessibility
- Test error states
- Test loading states
- Mock API calls

### Integration Testing
- Test component interactions
- Test routing
- Test form submissions
- Test drag and drop

### Accessibility Testing
- Test keyboard navigation
- Test ARIA attributes
- Test screen reader compatibility
- Use testing-library accessibility queries

## Test Configuration

### Vitest Configuration
Create `vitest.config.js`:
```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
});
```

### Test Setup File
Create `src/test/setup.js`:
```javascript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

## Coverage Goals

- **Component Tests**: 80%+ coverage
- **Service Tests**: 90%+ coverage
- **Integration Tests**: Critical paths covered

## Continuous Integration

Tests run automatically in CI/CD:
- On every commit
- Before deployment
- In containerized environment
- With coverage reporting

## Accessibility Testing

### Tools
- Jest DOM matchers
- Testing Library queries
- axe-core for accessibility violations

### Test Examples
```javascript
it('should be accessible', () => {
  const { container } = render(<Component />);
  expect(container).toBeAccessible();
});

it('should support keyboard navigation', () => {
  render(<Component />);
  const button = screen.getByRole('button');
  button.focus();
  expect(button).toHaveFocus();
});
```


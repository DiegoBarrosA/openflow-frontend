# Coding Standards

## Naming Conventions

### Components
- **Component Files**: PascalCase (e.g., `Board.jsx`, `Task.jsx`)
- **Component Names**: Match file name (e.g., `function Board()`)
- **Default Exports**: Use for main component

### Functions
- **Event Handlers**: Prefix with `handle` (e.g., `handleSubmit`, `handleClick`)
- **API Calls**: Prefix with `fetch` or use action verb (e.g., `fetchBoards`, `createBoard`)
- **Utility Functions**: Descriptive verbs (e.g., `getTasksByStatus`)

### Variables
- **State Variables**: Descriptive names (e.g., `showCreateForm`, `newBoardName`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Props**: camelCase (e.g., `task`, `onDelete`, `onUpdate`)

### CSS Classes
- **Tailwind Utilities**: Use Tailwind classes directly
- **Custom Classes**: kebab-case if needed (e.g., `task-card`, `status-column`)

## Code Style

### JavaScript/JSX
- Use functional components with hooks
- Prefer arrow functions for callbacks
- Use template literals for strings
- Destructure props and state
- Use meaningful variable names

### Component Structure
```javascript
// 1. Imports
import React, { useState } from 'react';
import './Component.css';

// 2. Component definition
function Component({ prop1, prop2 }) {
  // 3. Hooks
  const [state, setState] = useState(initial);
  
  // 4. Effects
  useEffect(() => {
    // effect logic
  }, [dependencies]);
  
  // 5. Event handlers
  const handleAction = () => {
    // handler logic
  };
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// 7. Export
export default Component;
```

### Hooks Usage
- Use hooks at top level only
- Follow Rules of Hooks
- Use dependency arrays correctly
- Clean up effects when needed

### Props
- Use prop destructuring
- Provide default values when appropriate
- Document prop types (consider PropTypes or TypeScript)

## Best Practices

### State Management
- Keep state as local as possible
- Lift state up when needed
- Use functional updates for state
- Avoid unnecessary re-renders

### Event Handling
- Use arrow functions or `useCallback` for handlers
- Prevent default behavior when needed
- Handle errors appropriately
- Provide user feedback

### API Calls
- Use async/await
- Handle loading states
- Handle errors gracefully
- Provide user feedback

### Accessibility
- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation
- Maintain focus management
- Test with screen readers

### Performance
- Use React.memo for expensive components
- Lazy load routes if needed
- Optimize re-renders
- Use proper keys in lists

## File Organization

### Component Files
- One component per file
- Co-locate related files (component + CSS)
- Group related components in directories

### Import Order
1. React and React-related imports
2. Third-party libraries
3. Internal services/utilities
4. Components
5. Styles

### CSS Organization
- Use Tailwind utilities primarily
- Custom CSS only when necessary
- Group related styles
- Use CSS variables for theming

## Documentation

### Component Documentation
- Document component purpose
- Document props and their types
- Document complex logic
- Add comments for non-obvious code

### Code Comments
- Explain "why", not "what"
- Keep comments up-to-date
- Remove commented-out code
- Use meaningful variable names instead

## Testing Standards

### Component Tests
- Test user interactions
- Test edge cases
- Test accessibility
- Mock API calls

### Test Naming
- Use descriptive test names
- Follow pattern: `test('should [expected behavior] when [condition]')`

## Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 641px - 1024px
- Desktop: > 1025px

### Mobile-First
- Design for mobile first
- Enhance for larger screens
- Use Tailwind responsive prefixes

## Accessibility Standards

### WCAG 2.1 Compliance
- Level AA minimum
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast ratios

### Semantic HTML
- Use appropriate HTML elements
- Maintain heading hierarchy
- Use form labels
- Provide alt text for images


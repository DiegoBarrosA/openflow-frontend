# Commit Message Template

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: UI/styling changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ui`: User interface changes
- `accessibility`: Accessibility improvements

## Scope (optional)

- `component`: Component changes
- `api`: API integration
- `routing`: Routing changes
- `styling`: CSS/styling
- `auth`: Authentication UI

## Subject

- Use imperative mood ("add" not "added")
- First letter lowercase
- No period at end
- Maximum 50 characters

## Body (optional)

- Explain what and why
- Reference issues if applicable

## Footer (optional)

- Reference issues: `Closes #123`
- Breaking changes: `BREAKING CHANGE: description`

## AI Assistance Tag

Add at the end of commit message:
```
[AI-Assisted: Composer]
```

## Examples

```
feat(component): add drag and drop for tasks

Implements HTML5 drag and drop API for moving tasks between
status columns. Includes visual feedback during drag operations.

[AI-Assisted: Composer]
```

```
fix(accessibility): improve keyboard navigation

Adds proper tabIndex and keyboard event handlers for interactive
elements. Ensures all functionality accessible via keyboard.

[AI-Assisted: Composer]
```


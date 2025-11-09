# OpenFlow Frontend Overview

## Project Summary

OpenFlow Frontend is a modern React-based single-page application that provides the user interface for a Trello-like project management system. Built with React 18, Vite, and Tailwind CSS, it offers a responsive, accessible, and visually appealing interface for managing boards, statuses, and tasks.

## Goals

- Provide an intuitive, responsive user interface
- Ensure cross-device compatibility (desktop, tablet, smartphone)
- Maintain accessibility standards (WCAG 2.1)
- Implement smooth drag-and-drop functionality
- Create a calm, low-contrast visual design
- Enable seamless integration with the backend API

## Key Features

### User Interface
- Responsive design adapting to all screen sizes
- Modern UI with Tailwind CSS
- Low-contrast color palette for visual comfort
- Smooth animations and transitions
- Touch-friendly interface elements

### Authentication
- User registration and login
- JWT token management
- Secure token storage
- Automatic token refresh handling
- Protected routes

### Board Management
- View all user boards
- Create new boards with descriptions
- Edit and delete boards
- Navigate between boards

### Status Management
- Create configurable status columns
- Customize status colors
- Reorder status columns
- Delete statuses with cascade handling

### Task Management
- Create tasks with titles and descriptions
- Edit tasks inline
- Delete tasks
- Drag and drop tasks between status columns
- Visual feedback during drag operations

### Accessibility
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus management

## Technology Stack

- **React 18.2.0**: UI library
- **React Router 6.20.0**: Client-side routing
- **Vite 5.0.8**: Build tool and dev server
- **Tailwind CSS 3.4.0**: Utility-first CSS framework
- **Axios 1.6.2**: HTTP client
- **PostCSS & Autoprefixer**: CSS processing

## Design Principles

- Mobile-first responsive design
- Accessibility-first development
- Low-contrast, calm color palette
- Touch-friendly interface (44x44px minimum targets)
- Progressive enhancement


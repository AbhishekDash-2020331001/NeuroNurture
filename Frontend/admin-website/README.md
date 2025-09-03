# NeuroNurture Admin Website

A comprehensive administration panel for the NeuroNurture platform, providing tools to manage users, subscriptions, and support tickets.

## Features

### 🔐 Authentication
- Secure admin login system
- Role-based access control
- Session management

### 👥 User Management
- View all doctors, schools, and parents
- Monitor children under each parent
- Suspend/activate user accounts
- Track user progress and activities

### ⏳ Pending Requests
- Review and approve/reject school registrations
- Review and approve/reject doctor registrations
- View submitted documents and details
- Manage approval workflow

### 💳 Subscription Management
- Monitor subscription statuses
- View usage statistics
- Extend subscription periods manually
- Track payment and billing information

### 🎫 Ticket Management
- View all user support tickets
- Read and reply to messages
- Update ticket status
- Close resolved tickets

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router DOM
- **State Management**: React Context + React Query
- **Build Tool**: Vite
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the admin website directory:
```bash
cd Frontend/admin-website
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The admin website will be available at `http://localhost:3001`

### Build for Production

```bash
npm run build
```

## Usage

### Demo Credentials
- **Email**: admin@neuronurture.com
- **Password**: admin123

### Navigation
- **Dashboard**: Overview of system statistics
- **User Management**: Manage all platform users
- **Pending Requests**: Review registration requests
- **Subscriptions**: Monitor subscription statuses
- **Tickets**: Handle support tickets

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── UserManagement.tsx
│   ├── PendingRequests.tsx
│   ├── SubscriptionManagement.tsx
│   └── TicketManagement.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── pages/              # Page components
│   ├── LoginPage.tsx
│   └── Dashboard.tsx
├── lib/                # Utility functions
│   └── utils.ts
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Configuration

The admin website runs on port 3001 by default to avoid conflicts with the main application. You can modify this in `vite.config.ts`.

## Development

### Adding New Features
1. Create new components in the `components/` directory
2. Add new routes in `Dashboard.tsx`
3. Update navigation in the sidebar
4. Add any new UI components to `components/ui/`

### Styling
- Use Tailwind CSS classes for styling
- Follow the existing design system
- Use shadcn/ui components for consistency

### State Management
- Use React Context for global state (auth, user preferences)
- Use local state for component-specific data
- Use React Query for server state management (when API is integrated)

## API Integration

The current version uses mock data. To integrate with a real backend:

1. Replace mock data with API calls
2. Update authentication to use real endpoints
3. Implement proper error handling
4. Add loading states and error boundaries

## Security Considerations

- Implement proper authentication and authorization
- Use HTTPS in production
- Validate all user inputs
- Implement rate limiting
- Regular security audits

## Contributing

1. Follow the existing code style
2. Add proper TypeScript types
3. Include error handling
4. Test thoroughly before submitting

## License

This project is part of the NeuroNurture platform.

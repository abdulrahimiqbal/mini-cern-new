# AI Agent Swarm Dashboard

## Overview

This is a full-stack web application for managing and monitoring AI agent swarms. It features a React frontend with a Node.js/Express backend, designed to handle multiple AI agents working together on various tasks. The system provides real-time monitoring, chat functionality, and comprehensive agent management capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Real-time Communication**: WebSocket client for live updates

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Real-time Communication**: WebSocket server for broadcasting updates
- **Session Management**: PostgreSQL-backed sessions

### Database Schema
The application uses a PostgreSQL database with the following main tables:
- `agents`: Stores agent information (name, type, status, capabilities)
- `research_data`: Stores research outputs from agents
- `activity_log`: Tracks all system activities and agent actions
- `chat_messages`: Stores chat conversation history
- `system_metrics`: Monitors system performance metrics

## Key Components

### Query Processing Workflow
- **Intelligent Analysis**: Automatically analyzes query complexity, type, and required domains
- **Agent Assignment**: Dynamically assigns specialist and generalist agents based on query requirements
- **Task Orchestration**: Coordinates multi-agent execution with progress tracking
- **Result Synthesis**: Aggregates agent findings into comprehensive research responses
- **Real-time Updates**: Live progress monitoring throughout the entire workflow

### Agent Management
- **Agent Types**: Supports both specialist and generalist agents
- **Status Tracking**: Real-time monitoring of agent status (active, standby, offline)
- **Progress Monitoring**: Track individual agent task progress and CPU usage
- **Dynamic Creation**: Create new agents with custom specializations

### Real-time Features
- **WebSocket Integration**: Live updates for agent status changes
- **Activity Feed**: Real-time logging of all system activities
- **Chat Interface**: Interactive communication system with query processing
- **System Monitoring**: Live system metrics tracking

### UI Components
- **Dashboard**: Main interface showing agent grid, system metrics, and activity feed
- **Agent Cards**: Individual agent status displays with visual indicators
- **Modals**: Agent creation and management interfaces
- **Responsive Design**: Mobile-friendly layout with dark theme

## Data Flow

1. **Client Requests**: Frontend makes API requests to Express backend
2. **Database Operations**: Backend uses Drizzle ORM to interact with PostgreSQL
3. **Real-time Updates**: WebSocket server broadcasts changes to all connected clients
4. **State Management**: TanStack Query manages client-side cache and synchronization

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns for date manipulation

### Development Tools
- **Build Tool**: Vite for development and building
- **Type Checking**: TypeScript with strict configuration
- **Database Migrations**: Drizzle Kit for schema management
- **Replit Integration**: Cartographer and error overlay plugins

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite dev server for frontend with HMR
- **API Server**: Express server with TypeScript execution via tsx
- **Database**: Neon PostgreSQL with connection pooling
- **Environment**: Replit-optimized with runtime error handling

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` command
- **Deployment**: Single Node.js process serving both API and static files

### Configuration
- **Environment Variables**: `DATABASE_URL` for PostgreSQL connection
- **Path Aliases**: TypeScript paths for clean imports
- **Asset Handling**: Vite handles static assets and bundling

## Changelog

```
Changelog:
- July 06, 2025. Initial setup
- July 06, 2025. Query Orchestration System - Implemented multi-agent query processing workflow
- July 06, 2025. Navigation Enhancement - Added functional multi-page navigation system
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
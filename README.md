# Physics Research Laboratory - Multi-Agent Swarm System

A sophisticated full-stack web application for managing and monitoring AI agent swarms conducting physics research. Features real-time coordination, multi-agent query processing, and comprehensive research data management.

## 🚀 Features

- **Multi-Agent Coordination**: Specialized and generalist AI agents working together
- **Real-time Monitoring**: Live agent status, progress tracking, and system metrics
- **Intelligent Query Processing**: Automatic analysis and agent assignment based on query complexity
- **Research Data Management**: Comprehensive storage and analysis of research outputs
- **Interactive Dashboard**: Modern UI with real-time updates and WebSocket integration
- **Chat Interface**: Natural language interaction with the agent swarm

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Radix UI
- **Backend**: Node.js + Express + TypeScript + WebSocket
- **Database**: PostgreSQL + Drizzle ORM
- **Build**: Vite + esbuild
- **Deployment**: Vercel + GitHub Actions

### Agent Types
- **Physicist Master**: Theoretical physics analysis and quantum mechanics
- **Tesla Principles**: Electromagnetic theory and energy systems
- **Curious Questioner**: Hypothesis generation and experimental design
- **Web Crawler**: Scientific literature mining and data collection
- **Generalist Agents**: Supporting calculations and data processing

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (optional for initial setup)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd physics-research-laboratory

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Run TypeScript checks
npm run check

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

## 📦 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run check        # TypeScript type checking
npm run lint         # TypeScript linting
npm run preview      # Build and preview locally
npm run clean        # Clean build artifacts
```

## 🗄️ Database Setup

The application is designed to work with PostgreSQL but can run without a database for initial testing.

### Option 1: No Database (Mock Data)
The application includes mock data and will work without a database connection for demonstration purposes.

### Option 2: PostgreSQL Setup
1. Choose a database provider:
   - [Neon](https://neon.tech) - Serverless PostgreSQL (Recommended)
   - [Supabase](https://supabase.com) - Full-featured PostgreSQL
   - [PlanetScale](https://planetscale.com) - MySQL-compatible
   - Local PostgreSQL instance

2. Get your connection string and add to `.env`:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

3. Run database migrations:
   ```bash
   npm run db:push
   ```

## 🚀 Deployment

This project is configured for automatic deployment to Vercel via GitHub Actions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/physics-research-laboratory)

### Manual Setup

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:
- GitHub Actions setup
- Vercel configuration
- Environment variables
- Database setup
- Troubleshooting

## 🎯 Usage

### Starting a Research Query
1. Open the chat interface on the dashboard
2. Enter your physics research question
3. The system automatically analyzes complexity and assigns appropriate agents
4. Monitor real-time progress and agent coordination
5. Review comprehensive research results

### Managing Agents
- View all agents in the Agent Management page
- Monitor individual agent status, CPU usage, and progress
- Add new specialized agents as needed
- Track agent capabilities and current tasks

### Research Data
- Browse all research outputs in the Research Data page
- Search and filter by type, content, or metadata
- Export research data for external analysis
- Track research trends and patterns

## 🔧 Development

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Application pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and API client
├── server/           # Express backend
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database operations
│   ├── queryOrchestrator.ts  # Multi-agent coordination
│   └── index.ts         # Server entry point
├── shared/           # Shared types and schemas
└── dist/             # Build output
```

### Key Components
- **Query Orchestrator**: Coordinates multi-agent execution
- **WebSocket Server**: Real-time updates and communication
- **Agent Management**: CRUD operations for agent lifecycle
- **Research Data Storage**: Comprehensive research output tracking

## 🧪 Testing

```bash
# Type checking
npm run check

# Build test
npm run build

# Preview production build
npm run preview
```

## 🐛 Troubleshooting

### Common Issues

**TypeScript Errors**
```bash
npm run check
```

**Build Failures**
```bash
npm run clean
npm install
npm run build
```

**Database Connection Issues**
- Verify `DATABASE_URL` in `.env`
- Check database provider status
- Ensure database is accessible

**WebSocket Connection Issues**
- Check browser console for errors
- Verify server is running on correct port
- Check firewall settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔮 Future Enhancements

- Physical laboratory equipment integration
- Advanced AI model integration
- Enhanced visualization and analytics
- Mobile application
- Collaborative research features
- Advanced security and authentication

## 📞 Support

For questions and support:
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- Review the troubleshooting section above
- Open an issue on GitHub

---

**Built with ❤️ for advancing physics research through intelligent agent coordination** 
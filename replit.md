# CampaignCraft - AI Marketing Assistant

## Overview

CampaignCraft is a full-stack web application that helps newsrooms generate AI-powered marketing campaigns. It's built as a React frontend with an Express.js backend, using PostgreSQL for data storage and integrating with AI providers (OpenAI and Anthropic) for content generation.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Shadcn/UI component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with route-based organization
- **Middleware**: Express middleware for logging, JSON parsing, and error handling
- **Development**: Hot reload with Vite integration in development mode

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM (Active)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon Database serverless PostgreSQL
- **Implementation**: DatabaseStorage class with full CRUD operations

## Key Components

### Database Schema
The application uses four main entities:
- **Newsrooms**: Organization profiles with name, slug, description, and branding
- **Grounding Library**: Brand guidelines including tone, voice, key messages, and visual identity (formerly Brand Stylesheets)
- **Campaigns**: Marketing campaigns with type (email/social/web), objectives, and AI-generated content
- **Campaign Templates**: Reusable campaign templates for quick generation

### AI Integration
- **Providers**: OpenAI (GPT-4o) and Anthropic (Claude Sonnet 4) integration
- **Default Model**: Claude Sonnet 4 (claude-sonnet-4-20250514) as the preferred AI model
- **Content Generation**: Generates campaign content, CTAs, and performance insights
- **Brand Consistency**: Applies grounding guides to maintain consistent messaging

### User Interface
- **Dashboard**: Overview of campaigns and quick actions
- **Campaign Generator**: Interactive form for creating new campaigns
- **Template Library**: Browse and select from pre-built campaign templates
- **Grounding Library**: Create and manage brand voice and messaging guidelines
- **Campaign History**: View and manage past campaigns

## Data Flow

1. **Campaign Creation**: User selects campaign type, objective, and provides context
2. **Brand Application**: System applies selected grounding guide guidelines
3. **AI Generation**: Request sent to configured AI provider with context and grounding guide guidelines
4. **Content Processing**: AI-generated content is structured and stored
5. **Preview & Edit**: User can review and modify generated content
6. **Campaign Storage**: Final campaign is saved to PostgreSQL database

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: drizzle-orm and drizzle-zod for database operations
- **AI Providers**: @anthropic-ai/sdk and openai for content generation
- **UI Framework**: Multiple @radix-ui packages for accessible components
- **State Management**: @tanstack/react-query for server state
- **Form Handling**: react-hook-form with @hookform/resolvers

### Development Tools
- **Build**: Vite with @vitejs/plugin-react
- **TypeScript**: Full TypeScript support across frontend and backend
- **Replit Integration**: @replit/vite-plugin-cartographer and runtime error modal

## Deployment Strategy

### Development
- Single command development with `npm run dev`
- Vite dev server with Express API integration
- Hot module replacement for rapid development
- Environment variable configuration for API keys

### Production Build
- Frontend: Vite builds optimized React bundle to `dist/public`
- Backend: ESBuild bundles Express server to `dist/index.js`
- Database: Drizzle migrations applied via `npm run db:push`
- Environment: Production-ready with proper error handling

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **OPENAI_API_KEY**: OpenAI API access (optional)
- **ANTHROPIC_API_KEY**: Anthropic API access (optional)

## Changelog

```
Changelog:
- June 30, 2025. Initial setup and full implementation
  - Built complete AI-powered marketing campaign generator
  - Integrated multi-LLM support (OpenAI GPT-4o, Anthropic Claude Sonnet 4, Google Gemini Pro)
  - Implemented brand stylesheet management system
  - Created campaign generation, preview, and export functionality
  - Added template library with pre-built campaign types
  - Successfully tested campaign generation with real API keys
  - Generated sample email and social media campaigns for budget investigation story
  - Added PostgreSQL database with full persistence
  - Migrated from in-memory storage to DatabaseStorage with Drizzle ORM
  - All campaigns, stylesheets, and templates now permanently stored
  - Implemented custom brand stylesheet creation and editing
  - Fixed brand stylesheet application in campaign generation
  - Brand stylesheets now properly customize organization name and messaging
  - Resolved Claude API integration issue - model name mismatch fixed
  - Both OpenAI GPT-4o and Anthropic Claude Sonnet 4 fully functional
  - Added Google Gemini 2.5 Flash integration with proper SDK implementation
  - Multi-LLM support now includes three AI providers for campaign generation
  - Claude API experiencing timeout issues with complex requests - OpenAI and Gemini working perfectly
- Multi-tenant authentication system fully implemented with 5 newsroom accounts
- Each newsroom has isolated data access and custom brand stylesheets
- Campaign builder working with proper data validation and error handling
- Login/logout functionality with proper state management implemented
- Admin control panel implemented with account access management
- Super admin account created: admin@campaigncraft.com / admin123
- Real-time newsroom status control (enable/disable accounts)
- Role-based access protection for admin features
- Admin "God View" implemented showing all campaigns across all publishers
- Campaign History page enhanced with scrollable interface and comprehensive filter system
- Real-time search functionality across campaign titles, context, and AI models
- Multi-criteria filtering: status, type, objective filters with clear filter states
- Admin user account management system: view user details, edit names and emails
- Account information display for each publisher including email and creation date
- Enhanced admin controls with user profile editing and validation
- Password change functionality for admin to reset user passwords (admin-only access)
- Secure password hashing with bcrypt for all password updates
- Removed Performance Metrics tab from campaign preview (pending actual performance data implementation)
- Renamed "Brand Stylesheets" to "Grounding Library" for clearer terminology
- Updated all UI references, form labels, and documentation to use "Grounding Guide" terminology
- Enhanced Recent Campaigns display to show account/newsroom information for all campaigns
- August 7, 2025: Implemented complete document upload functionality for Grounding Library
  - Set up Google Cloud Storage integration with object storage infrastructure
  - Created ObjectUploader component with file validation and progress tracking
  - Added secure document upload/download API endpoints with proper authentication
  - Enhanced grounding library cards with document management interface
  - Users can now upload reference materials (PDF, DOC, TXT files up to 10MB) to inform AI campaign generation
  - Real-time document list updates with individual file remove functionality
  - All documents securely stored in cloud storage and linked to specific grounding guides
- August 7, 2025: Completed Quick Start Templates with 5 fully functional AI-powered tools
  - Rapid-Response Campaign Creator: generates breaking news campaigns with urgency settings
  - Campaign Re-writing for Segments: adapts existing campaigns for different audience segments
  - AI Subject Line Generator: creates compelling email subject lines with copy-to-clipboard
  - Call-to-Action Button Generator: suggests persuasive CTA text variations
  - Grounding Library Builder: automatically creates brand guidelines from content analysis
  - All tools integrated with multi-AI provider support and proper error handling
  - Interactive modal interface with form validation and real-time results display
- September 18, 2025: Implemented Guided Marketing Assistant for step-by-step campaign creation
  - Created comprehensive guided workflow system with 4 focused goals for different marketing needs
  - Breaking News Campaign: 3-step process for urgent content creation with brand consistency
  - Audience Targeting: guided workflow for adapting campaigns to specific audience segments
  - Email Optimization: step-by-step creation of compelling subject lines and CTAs
  - Brand Setup: guided process for building comprehensive brand guidelines
  - Clean, intuitive interface with progress tracking and visual step indicators
  - Seamless integration with existing Quick Start Templates for tool execution
  - Time estimates and category-based organization for improved user experience
  - Added new navigation route (/assistant) and sidebar integration for easy access
- October 3, 2025: Major Platform Redesign - Two-Path System Implementation
  - Redesigned homepage with clear Path 1 (Create Campaign) and Path 2 (Get Feedback) structure
  - Path 1: Multi-Draft Carousel System
    - Generate 5+ AI-powered campaign variations with different creative approaches
    - Interactive carousel with navigation, selection, and visual indicators
    - Select and merge favorite drafts into optimized final campaigns
    - Database schema extended with parentCampaignId, draftNumber, selectedForMerge fields
    - Backend routes: /api/campaigns/generate-drafts and /api/campaigns/merge-drafts
  - Path 2: Campaign Evaluation Engine
    - New /campaigns/evaluate route for campaign analysis
    - BlueLena and Audience Value Proposition frameworks for scoring
    - AI-powered recommendations and one-click rewrites
  - Comprehensive end-to-end testing with Playwright confirms all features functional
- October 4, 2025: Enhanced Platform Features - Segments, LLM Comparison, Unified History
  - Segment Management System
    - Full CRUD operations for audience segments (/segments page)
    - Create, edit, delete audience segments with descriptions
    - Reuse segments across campaigns for targeted messaging
    - Database segments table with newsroom isolation
  - LLM Comparison Mode (Path 1 Enhancement)
    - "Compare AI Models" toggle in campaign generation
    - Generates 3 drafts simultaneously: GPT-4o, Claude Sonnet 4, Gemini 2.5 Flash
    - Side-by-side model comparison with AI model badges
    - Select and merge best outputs from different models
  - Unified Campaign History Integration
    - Save evaluated campaigns from Path 2 (Get Feedback)
    - POST /api/campaigns/save-evaluated endpoint
    - All campaigns (Path 1 create + Path 2 evaluate) appear in single history view
    - Comprehensive search and filter across all campaign sources
  - All features tested end-to-end with Playwright validation
- October 4, 2025: BlueLena Copywriting Integration
  - Updated AI campaign generation to follow BlueLena professional copywriting guidelines
  - Campaign emails now generate complete, emotionally resonant full-length copy (200-400 words)
  - Enforced subject line limit: ≤ 50 characters (with backend validation and truncation)
  - Email structure follows BlueLena standards:
    - Breaking news hook with urgency and local relevance
    - Narrative storytelling connecting story to community impact
    - Reader support appeal emphasizing role in sustaining independent journalism
    - AP Style formatting (no Oxford commas)
  - CTA format standardized: [Button]Button text[/Button] parsed and displayed as buttons
  - Frontend updated to display full email bodies with proper paragraph formatting
  - All AI providers (GPT-4o, Claude Sonnet 4, Gemini 2.5 Flash) use updated BlueLena prompts
  - End-to-end testing confirms proper generation with subject limits and full email copy
- October 8, 2025: Campaign Type Field Removal
  - Removed campaign type selection from campaign creation form
  - Backend now defaults all campaigns to 'email' type when type is not specified
  - Simplified campaign generation workflow by eliminating redundant type selection
  - Both /api/campaigns/generate and /api/campaigns/generate-drafts endpoints support optional type parameter
  - Demo account created: thecity@campaigncraft.com (The CITY newsroom)
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
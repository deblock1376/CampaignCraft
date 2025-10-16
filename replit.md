# CampaignCraft - AI Marketing Assistant

## Overview
CampaignCraft is a full-stack web application designed to empower newsrooms in generating AI-powered marketing campaigns. It aims to streamline content creation, ensure brand consistency, and offer advanced features like multi-draft generation, campaign evaluation, and audience segmentation. The project's ambition is to provide a comprehensive, intuitive platform for news organizations to create effective and targeted marketing communications. It supports a business vision of leveraging AI for enhanced market potential in news media.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Framework**: React 18 with TypeScript.
- **Components**: Shadcn/UI with Radix UI primitives.
- **Styling**: Tailwind CSS for utility-first styling and theme management.
- **Branding**: BlueLena logo displayed in sidebar navigation across all authenticated pages.
- **Design Philosophy**: Clean, intuitive interface featuring interactive forms, a multi-draft carousel, and clear visual indicators.
- **Key UI Features**: Dashboard, Campaign Generator (with Campaign Builder for goals/audience setup), Template Library, Grounding Library, Campaign History, Guided Marketing Assistant, Segment Management, and a unified history view.
- **Campaign Builder**: Right-side panel in Campaign Assistant with subtitle "Set your goals and audience" - allows users to configure objectives, segments, grounding guides, notes, and reference materials.
- **Navigation Structure**: Streamlined sidebar menu in priority order:
  1. Dashboard (top)
  2. Campaign Builder (conversational AI campaign creation)
  3. Campaign History
  4. Grounding Library
  5. Audience Segments
  6. Story Summaries
  7. Settings
  8. Admin Control (admin only)
  9. Marketing Assistant (gradient box at bottom for quick-start templates)
- **Featured Campaign Builder**: Prominently displayed with gradient background, "Recommended" badge, and enhanced visual styling in Marketing Assistant page.

### Technical Implementations
- **Frontend**: React with Wouter for routing, TanStack React Query for server state management, and Vite for building.
- **Backend**: Node.js with Express.js, TypeScript, RESTful API, and Express middleware.
- **Data Storage**: PostgreSQL database using Drizzle ORM, with Neon Database for serverless PostgreSQL.
- **AI Integration**: Integrates with OpenAI (GPT-4o, default) and Anthropic (Claude Sonnet 4) for content generation and evaluation.
- **Content Generation**: Generates campaign content, CTAs, and performance insights, applying grounding guides for brand consistency.
- **Campaign Workflow**: Supports "Create Campaign" with multi-draft generation and "Get Feedback" for evaluation using frameworks like BlueLena. Features seamless campaign-to-evaluation flow with auto-population:
  - "Evaluate this campaign" button encodes generated campaign data (subject, body, CTA) in URL parameter
  - Campaign evaluation page automatically reads and pre-fills content from URL on page load
  - Users can immediately evaluate without manual copy-paste
  - Toast notification confirms campaign data has been loaded
- **Multi-tenancy**: Supports multiple newsrooms with isolated data and role-based admin capabilities.
- **User Management System**: Role-based access control with comprehensive user administration:
  - Super Admin role (role = "admin", newsroomId = null) with full system access
  - Regular Admin role (role = "admin", newsroomId = specific ID) with newsroom-scoped access
  - User role (role = "user") with standard newsroom access
  - Admin-only User Management page for creating, editing, and deleting users
  - Newsroom assignment and role modification for flexible access control
  - Multiple users per newsroom supported for team collaboration
  - Password management and account administration
- **Document Upload & Extraction**: Integrates with Replit App Storage (Google Cloud Storage) for uploading reference materials to inform AI generation within the Grounding Library. Features automated text extraction from uploaded files:
  - PDF text extraction using pdf-parse library
  - DOCX text extraction using mammoth library
  - Plain text file support
  - FileExtractorService fetches files from object storage and extracts content
  - Extracted file content is automatically combined with manual text and included in AI prompts
  - Ensures AI references both typed materials and uploaded documents for comprehensive brand consistency
- **Quick Start Templates**: Pre-built AI tools for specific marketing needs (e.g., Rapid-Response Campaign Creator, AI Subject Line Generator).
- **BlueLena Copywriting Integration**: AI generation adheres to BlueLena professional copywriting guidelines for email structure, subject lines, and CTAs.
- **AI-Powered Merge**: Utilizes AI to intelligently combine best elements from multiple drafts into a cohesive, unified campaign.
- **Conversational Campaign Assistant**: An AI-guided chat interface for structured campaign creation, material gathering, and automated generation.
- **AI Prompt Management System**: Admin-facing system for cataloging, updating, and managing all AI prompts without code changes. Features include:
  - Database-backed prompt storage with versioning support
  - 14 prompts organized across 8 categories (Campaign Generation, Draft Merging, Evaluation, Rewriting, Story Summarization, Chat Assistant, Email Optimization, Grounding Library)
  - Variable interpolation for dynamic prompt customization
  - 5-minute caching layer for performance optimization
  - Robust fallback to hardcoded prompts for reliability
  - Admin-only UI for searching, filtering, and editing prompts
  - Full CRUD operations with authentication and authorization
- **Production Logging & Quality Assurance**: Comprehensive logging and user tracking system for debugging and quality assurance:
  - Client-side logger capturing errors, user actions, API calls, and performance metrics
  - Database storage with 90-day retention policy and automated cleanup
  - User flagging system to mark users as "testing", "bug reporter", "issue", or "watch" with notes
  - Admin logs page with filtering, search, and user flag management
  - Logger auto-initializes with user context on login for complete activity tracking
  - Scheduled daily log cleanup to maintain database performance
- **Prompt Auditing System**: Temporary admin-only visual indicators for prompt monitoring:
  - Colored badge indicators showing which AI prompt powers each generation
  - Only visible to super administrators for quality assurance and auditing
  - Displays prompt names (e.g., "Campaign Generate", "Draft Merge", "BlueLena Evaluation") on:
    - Campaign Form (generated campaigns)
    - Chat Assistant (conversational campaign generation)
    - Campaign Evaluation (evaluation results)
  - Backend returns promptKey in all AI service responses for tracking
  - Helps validate prompt management system and monitor AI usage patterns

### System Design Choices
- **Development**: Vite development server with Express API integration and hot module replacement.
- **Production**: Optimized React bundle and bundled Express server.
- **Environment Configuration**: Utilizes environment variables for sensitive information.
- **Grounding Library Workflow**: Streamlined materials-first approach for library creation, collecting 11 material types across 4 categories (Brand Foundation, Campaign Examples, Audience Intelligence, Performance Data).

## External Dependencies

- **Database**:
    - `@neondatabase/serverless`
    - `drizzle-orm`, `drizzle-zod`, `drizzle-kit`
- **AI Providers**:
    - `@anthropic-ai/sdk`
    - `openai`
- **UI Libraries**:
    - `@radix-ui/*`
    - `shadcn/ui`
- **State Management**:
    - `@tanstack/react-query`
- **Form Handling**:
    - `react-hook-form` with `@hookform/resolvers`
- **Cloud Storage & File Processing**:
    - Replit App Storage (Google Cloud Storage)
    - `pdf-parse` - PDF text extraction
    - `mammoth` - DOCX text extraction
# CampaignCraft - AI Marketing Assistant

## Overview
CampaignCraft is a full-stack web application designed to empower newsrooms in generating AI-powered marketing campaigns. It aims to streamline the creation of marketing content, ensuring brand consistency and offering advanced features like multi-draft generation, campaign evaluation, and audience segmentation. The project's ambition is to provide a comprehensive, intuitive platform for news organizations to create effective and targeted marketing communications.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Framework**: React 18 with TypeScript.
- **Components**: Shadcn/UI with Radix UI primitives for accessible and customizable UI.
- **Styling**: Tailwind CSS for utility-first styling and theme management.
- **Design Philosophy**: Clean, intuitive interface with features like interactive forms, a multi-draft carousel, and clear visual indicators.
- **Key UI Features**: Dashboard, Campaign Generator, Template Library, Grounding Library, Campaign History, Guided Marketing Assistant, Segment Management, and a unified history view.

### Technical Implementations
- **Frontend**: React with Wouter for routing, TanStack React Query for server state management, and Vite for building.
- **Backend**: Node.js with Express.js, TypeScript, RESTful API, and Express middleware for core functionalities.
- **Data Storage**: PostgreSQL database using Drizzle ORM for schema management and operations, with Neon Database for serverless PostgreSQL.
- **AI Integration**: Integrates with OpenAI (GPT-4o) and Anthropic (Claude Sonnet 4) for content generation, with GPT-4o set as the default model.
- **Content Generation**: Generates campaign content, CTAs, and performance insights, applying grounding guides for brand consistency.
- **Campaign Workflow**: Supports a "Create Campaign" path with multi-draft generation and a "Get Feedback" path for campaign evaluation using frameworks like BlueLena.
- **Multi-tenancy**: Supports multiple newsrooms with isolated data access and admin capabilities for user and account management.
- **Document Upload**: Integrates with Google Cloud Storage for uploading reference materials to inform AI generation within the Grounding Library.
- **Quick Start Templates**: Pre-built AI-powered tools for specific marketing needs (e.g., Rapid-Response Campaign Creator, AI Subject Line Generator).
- **BlueLena Copywriting Integration**: AI generation adheres to BlueLena professional copywriting guidelines for email structure, subject lines, and CTAs.

### System Design Choices
- **Development**: Vite development server with Express API integration and hot module replacement.
- **Production**: Optimized React bundle and bundled Express server for deployment.
- **Environment Configuration**: Utilizes environment variables for sensitive information like database URLs and API keys.

## Recent Changes

### October 10, 2025: Streamlined Grounding Library Creation
- **Single Creation Path**: Marketing Assistant is now the only way to create new grounding libraries
- **Removed Duplicate Form**: Eliminated the simple create dialog from Grounding Library page to avoid confusion
- **Improved Navigation**: "Build New Library" button on Grounding Library page navigates to Marketing Assistant
- **Updated Empty State**: Clear messaging guides new users to Marketing Assistant for their first library
- **Management Focus**: Grounding Library page now focused on viewing, editing, and deleting existing libraries
- **User Experience**: Single, guided workflow ensures users always collect comprehensive materials through categorized form

### October 10, 2025: Delete Grounding Libraries Feature
- **Delete Functionality**: Added ability to delete grounding libraries from the Grounding Library page
- **Confirmation Dialog**: Implemented AlertDialog component for delete confirmation to prevent accidental deletions
- **User Feedback**: Success and error toast notifications for delete operations
- **UI Updates**: Delete button added alongside Edit button on each grounding library card
- **Backend Integration**: Utilizes existing DELETE /api/stylesheets/:id endpoint
- **State Management**: Proper cleanup and cache invalidation after successful deletion

### October 10, 2025: Simplified Grounding Library Workflow - Materials-First Approach
- **Streamlined Workflow**: Build Grounding Library now starts directly with reference materials collection (removed separate brand voice step)
- **Brand Voice as Material**: Brand Voice & Mission moved into materials as first item in Brand Foundation category
- **11 Material Types**: Comprehensive grounding library form organized into 4 categories:
  - Brand Foundation (4 types): Brand Voice & Mission, Strategy Playbook, Brand Style Guide, About Us Content
  - Campaign Examples (3 types): Past Campaigns, Impact News Stories, Reader Testimonials
  - Audience Intelligence (3 types): Audience Segments, Survey Responses, Key Local Dates
  - Performance Data (2 types): Survey & Research Data, Performance Metrics & Analytics
- **Two-Step Process**: Simplified workflow from 3 steps to 2 steps:
  - Step 1: Add Reference Materials (includes brand voice, mission, and all other materials)
  - Step 2: Generate Grounding Library
- **Flexible Input Methods**: Each material type supports both text paste and file upload via URL
- **Visual Progress Indicators**: Category progress badges show material count and completeness
- **Accordion UI**: Collapsible sections for easy navigation across material categories
- **Backend Update**: Updated `/api/quickstart/grounding-library` endpoint to:
  - Accept only `materials` parameter (removed separate `newsroomInfo` parameter)
  - Extract brand voice from `materials.brandFoundation.brandVoice`
  - Parse all 11 material types across 4 categories for AI context
  - Store materials in brand stylesheet's materials JSONB field
  - Use GPT-4o (default) for grounding library generation
- **Database Integration**: Materials persisted to `brandStylesheets.materials` column for future reuse

### October 9, 2025: Enhanced Campaign Evaluation Framework
- **Audience Value Proposition Framework**: Updated with comprehensive scoring criteria (0-12 scale):
  - Audience benefit clarity (0-2): Specific outcomes vs. abstract slogans
  - Pain points addressed (0-2): Problem identification and solutions
  - Voice and pronouns (0-2): Direct audience language ("you/your") vs. organization-centric
  - Mission vs. value (0-2): Balance of civic duty and personal benefits
  - Evidence and credibility (0-2): Proof of impact and testimonials
  - Call to action (0-2): Personal benefit tied to action
- **Rating System**: Organization-centric (0-3), Mixed (4-7), Strongly Audience-centric (8-12)
- **Enhanced UI Display**: Shows rating badges, analysis panels, and rewrite offers for both frameworks
- **Default AI Model**: Changed evaluation and rewrite defaults from Claude to GPT-4o

### October 8, 2025: Enhanced BlueLena Prompt Structure with Prompt Builder Integration
- **New Prompt Framework**: Updated campaign generation to use comprehensive BlueLena copywriting framework
- **Preview Text**: Added 90-character preview text field to all generated campaigns (appears after subject in email clients)
- **Prompt Builder Context Integration**: Campaign generation now incorporates Prompt Builder inputs:
  - Target segments (e.g., "Donors", "Non-donors", "Highly engaged")
  - Campaign notes for additional context
  - Reference campaigns for tone/style consistency
- **Conversational Follow-Up Suggestions**: AI provides engaging, question-based next steps:
  - "Would you like me to create a version targeted at lapsed donors?"
  - "Should I try another version with a stronger urgency angle?"
  - Uses audience development expertise to guide users
- **Tone Enhancements**: Updated messaging to emphasize:
  - Varying length and tone across campaigns
  - Narrative storytelling mixed with action-oriented appeals
  - Local relevance and community impact
  - CTA placement above fold for longer emails

### October 8, 2025: AI-Powered Merge Feature
- Enhanced merge functionality to use AI generation instead of simple concatenation
- When merging selected drafts, the system now:
  - Analyzes strengths of each draft
  - Creates an intelligent prompt asking AI to combine best elements
  - Generates a cohesive, unified campaign using GPT-4o
  - Produces optimized subject line, body, and CTA from combined drafts
- Merge prompt instructs AI to remove redundancies and ensure smooth narrative flow
- Follows BlueLena copywriting best practices in merged output

### October 8, 2025: Conversational Campaign Assistant (Enhanced)
- **Chat Interface**: Created test page at `/campaigns/assistant-test` with centered, conversational layout
- **AI-Guided Workflow**: AI assistant guides users through structured campaign creation:
  1. Grounding guide selection
  2. Campaign objective (engagement, acquisition, retention, revenue)
  3. Context and details gathering
  4. Automated campaign generation trigger
- **Rich Campaign Display**: CampaignMessageCard component shows generated campaigns inline with:
  - Subject line, body, and CTA display
  - Save, Export (txt), and Regenerate action buttons
  - Visual gradient styling to highlight generated content
- **Smart Generation**: Backend detects when AI determines user is ready to generate
  - AI responds with structured GENERATE_CAMPAIGN format
  - Frontend automatically triggers campaign generation API
  - Generated campaign appears in chat as rich card
- **Integrated Actions**: Save campaigns to database, export as text files, or regenerate directly from chat
- Uses GPT-4o for conversational guidance and campaign generation

## External Dependencies

- **Database**:
    - `@neondatabase/serverless`: For PostgreSQL connection.
    - `drizzle-orm`, `drizzle-zod`, `drizzle-kit`: For ORM and schema management.
- **AI Providers**:
    - `@anthropic-ai/sdk`: For Anthropic AI integration.
    - `openai`: For OpenAI API integration.
- **UI Libraries**:
    - `@radix-ui/*`: Multiple packages for accessible UI components.
    - `shadcn/ui`: Component library.
- **State Management**:
    - `@tanstack/react-query`: For server state management.
- **Form Handling**:
    - `react-hook-form`: With `@hookform/resolvers` for form validation.
- **Cloud Storage**:
    - Google Cloud Storage: For document uploads in the Grounding Library.
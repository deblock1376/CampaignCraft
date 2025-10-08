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
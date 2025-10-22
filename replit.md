# CampaignCraft - AI Marketing Assistant

## Overview
CampaignCraft is a full-stack web application designed to empower newsrooms in generating AI-powered marketing campaigns. It aims to streamline content creation, ensure brand consistency, and offer advanced features like multi-draft generation, campaign evaluation, and audience segmentation. The project's ambition is to provide a comprehensive, intuitive platform for news organizations to create effective and targeted marketing communications, leveraging AI for enhanced market potential in news media.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Framework & Styling**: React 18 with TypeScript, Shadcn/UI (Radix UI primitives), and Tailwind CSS for a clean, intuitive interface.
- **Branding**: BlueLena logo prominently displayed.
- **Key UI Features**: Dashboard, Campaign Generator (with Campaign Builder), Template Library, Grounding Library, Campaign History, Guided Marketing Assistant, Segment Management, and unified history view.
- **Navigation**: Streamlined sidebar with priority order: Dashboard, Campaign Builder, Campaign History, Campaign Planner, Grounding Library, Audience Segments, Story Summaries, Settings, Help & Guides, Admin Control, and Marketing Assistant.
- **Featured Campaign Builder**: Prominently displayed with gradient background and "Recommended" badge.

### Technical Implementations
- **Frontend**: React, Wouter for routing, TanStack React Query for server state, and Vite for building.
- **Backend**: Node.js with Express.js, TypeScript, RESTful API.
- **Data Storage**: PostgreSQL database using Drizzle ORM and Neon Database.
- **AI Integration**: OpenAI (GPT-5) and Anthropic (Claude Sonnet 4) for content generation and evaluation.
- **Content Generation**: AI-powered generation of campaign content, CTAs, and performance insights, utilizing grounding guides for brand consistency.
- **Campaign Workflow**: Supports multi-draft generation and seamless "Get Feedback" for evaluation, auto-populating content for evaluation from generated campaigns. All generated campaigns are automatically saved to Campaign History.
- **Multi-tenancy & User Management**: Supports multiple newsrooms with isolated data, role-based access control (Super Admin, Regular Admin, User), and comprehensive user administration.
- **Document Upload & Extraction**: Integration with Replit App Storage (Google Cloud Storage) for uploading reference materials (PDF, DOCX, TXT) with automated text extraction to inform AI generation.
- **Quick Start Templates**: Pre-built AI tools for specific marketing needs.
- **BlueLena Copywriting Integration**: AI generation adheres to BlueLena professional copywriting guidelines.
- **AI-Powered Merge**: Intelligently combines elements from multiple drafts into a unified campaign.
- **Conversational Campaign Assistant**: AI-guided chat interface for structured campaign creation with persistent conversations saved to the database.
- **Saved Campaigns**: Dedicated page displaying all saved campaign building conversations with auto-generated titles, dates, objectives, linked plans, and easy resume functionality via bookmarkable URLs.
- **AI Prompt Management System**: Admin-facing system for cataloging, updating, and managing AI prompts without code changes, featuring database storage, versioning, variable interpolation, caching, and a robust fallback mechanism.
- **Production Logging & Quality Assurance**: Comprehensive client-side logging, user tracking, and an admin logs page for debugging and QA.
- **Prompt Auditing System**: Admin-only visual indicators to monitor which AI prompt powers each generation.
- **Help Center & Documentation**: In-app documentation (Help & Guides page) covering all major features with step-by-step instructions.
- **Contextual Help System**: In-context tooltips provide instant guidance throughout the application, especially in the Campaign Builder.
- **Campaign Planner**: AI-powered tool for comprehensive fundraising campaign planning, generating strategic plans, calendars, messaging, and email drafts.
- **Plan-Guided Campaign Generation**: AI campaign generation is strategically directed by selected Campaign Plans, making the plan the primary directive for AI content creation.

### System Design Choices
- **Development & Production**: Vite development server with Express API integration and optimized React bundle for production.
- **Environment Configuration**: Utilizes environment variables for sensitive information.
- **Grounding Library Workflow**: Streamlined materials-first approach for library creation, collecting 11 material types across 4 categories (Brand Foundation, Campaign Examples, Audience Intelligence, Performance Data) with a tabbed edit interface.

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
    - `pdf-parse` (PDF text extraction)
    - `mammoth` (DOCX text extraction)
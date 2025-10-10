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
- **Design Philosophy**: Clean, intuitive interface featuring interactive forms, a multi-draft carousel, and clear visual indicators.
- **Key UI Features**: Dashboard, Campaign Generator, Template Library, Grounding Library, Campaign History, Guided Marketing Assistant, Segment Management, and a unified history view.

### Technical Implementations
- **Frontend**: React with Wouter for routing, TanStack React Query for server state management, and Vite for building.
- **Backend**: Node.js with Express.js, TypeScript, RESTful API, and Express middleware.
- **Data Storage**: PostgreSQL database using Drizzle ORM, with Neon Database for serverless PostgreSQL.
- **AI Integration**: Integrates with OpenAI (GPT-4o, default) and Anthropic (Claude Sonnet 4) for content generation and evaluation.
- **Content Generation**: Generates campaign content, CTAs, and performance insights, applying grounding guides for brand consistency.
- **Campaign Workflow**: Supports "Create Campaign" with multi-draft generation and "Get Feedback" for evaluation using frameworks like BlueLena.
- **Multi-tenancy**: Supports multiple newsrooms with isolated data and admin capabilities.
- **Document Upload**: Integrates with Google Cloud Storage for uploading reference materials to inform AI generation within the Grounding Library.
- **Quick Start Templates**: Pre-built AI tools for specific marketing needs (e.g., Rapid-Response Campaign Creator, AI Subject Line Generator).
- **BlueLena Copywriting Integration**: AI generation adheres to BlueLena professional copywriting guidelines for email structure, subject lines, and CTAs.
- **AI-Powered Merge**: Utilizes AI to intelligently combine best elements from multiple drafts into a cohesive, unified campaign.
- **Conversational Campaign Assistant**: An AI-guided chat interface for structured campaign creation, material gathering, and automated generation.

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
- **Cloud Storage**:
    - Google Cloud Storage
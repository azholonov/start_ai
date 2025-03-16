# StartAI Chat Application

This is a modern chat application built with Next.js that allows users to have conversations with an AI assistant powered by Anthropic's Claude model. The application features a clean, intuitive interface with real-time messaging capabilities.

## Features

- **User Authentication**: Secure login and registration system using Supabase Auth
- **Chat History**: Save and manage multiple conversations
- **Real-time Messaging**: Instant responses from the AI assistant
- **Markdown Support**: AI responses support rich text formatting with Markdown
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Eye-friendly dark interface

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Supabase
- **AI**: Anthropic Claude API
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL

## Project Structure

The application is organized into several key components:

- `Chat`: Main component that orchestrates the chat experience
- `ChatSidebar`: Manages chat history and navigation
- `ChatHeader`: Contains the application header and navigation controls
- `ChatMessages`: Displays the conversation messages
- `ChatInput`: Handles user input and message submission
- `Auth`: Manages user authentication

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

To run this project, you need to set up the following environment variables:

```
SONNET_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

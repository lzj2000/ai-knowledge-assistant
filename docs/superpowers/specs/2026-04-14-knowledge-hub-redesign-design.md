# AI Knowledge Assistant Redesign

## Overview

This document defines the approved redesign for the current AI knowledge assistant.
The product remains primarily an internal knowledge assistant for enterprise teams, but the interface should also feel polished enough for light external presentation.

The core product decision is:

- Users should be able to ask a question immediately after opening the app.
- Document upload, document management, and category management exist to support better answers.
- The visual tone should feel like an "AI editorial desk" or "knowledge hub", not a generic SaaS dashboard and not a generic chatbot skin.

## Product Decisions

### Primary audience

- Mixed audience, but biased toward internal enterprise users.
- The UI should communicate trust, structure, and knowledge depth.

### Primary first action

- The most important first action is asking a question.
- The homepage must optimize for immediate question entry.

### Overall visual direction

- Chosen direction: editorial knowledge hub.
- The interface should feel curated, calm, and intelligent.
- The system should avoid common "AI product" visual cliches such as purple gradients, empty hero sections, and generic chat bubbles.

### Page role decisions

- The homepage is a question-first entry point with knowledge context.
- Chat is the main work area.
- Documents and categories are knowledge curation surfaces.
- Upload is a guided import experience with a clear next step back into chat.

## Experience Principles

- Question-first: asking should always feel like the fastest path.
- Knowledge-visible: the UI should show that answers are grounded in managed knowledge assets.
- Editorial clarity: answers, sources, metadata, and content structure should feel readable and composed.
- Unified system: pages should feel like one designed product, not isolated CRUD screens.
- Enterprise trust: empty states, statuses, and errors should feel explicit and controlled.

## Information Architecture

### Global structure

- Keep a global top navigation with lightweight section switching.
- Do not let the header dominate the screen.
- Use one shared design language across all routes.

### Routes

- `/`: question-first knowledge hub.
- `/chat`: main chat workspace for new conversations.
- `/chat/[id]`: same workspace for existing conversations.
- `/documents`: knowledge asset browsing and curation.
- `/documents/upload`: guided import flow.
- `/categories`: knowledge map and category curation.

## Visual System

### Tone

- Editorial, structured, confident.
- More like a digital newsroom or research desk than a software admin panel.

### Color direction

- Light background with slight paper warmth rather than stark white.
- Primary text in deep ink tones.
- Accent colors should be restrained and memorable, centered on ink blue and copper orange.
- Use color to guide hierarchy and state, not as decoration.

### Typography

- Use a distinctive serif face for large titles and key editorial moments.
- Use a clear sans-serif face for body copy, controls, and dense UI.
- Allow metadata, timestamps, and counts to use a tighter utility style when helpful.

### Components

- Inputs should feel generous and deliberate.
- Cards should use thin borders, soft depth, and consistent spacing.
- Status pills, chips, source references, and conversation items should share one visual grammar.
- Page headers should use a consistent pattern:
  label, title, short description, primary action.

## Page Specifications

### Homepage `/`

Purpose:
Provide an immediate place to ask while proving that the system is backed by an organized knowledge base.

Layout:

- Central hero area with a large question input.
- Suggested question chips below the main input.
- A quick entry to the most recent conversation when available.
- Supporting summary blocks for knowledge base size, recent uploads, and category access.

Behavior:

- The ask box is the dominant element on first load.
- Supporting content should confirm system readiness without competing with the ask box.
- Empty state should still feel useful and intentional.

### Chat workspace `/chat` and `/chat/[id]`

Purpose:
Serve as the primary daily working surface for asking, reading, and continuing conversations.

Layout:

- Left column for conversation history and new chat action.
- Right column for the active conversation.
- Top area of the conversation pane should show the current conversation title and lightweight context signals.
- Bottom area should contain a large input composer.

Message presentation:

- User messages remain compact and action-oriented.
- Assistant responses render as answer cards, not generic bubble stacks.
- Answer cards must support rich markdown structure, citations, code blocks, tables, and lists.
- Sources render as a stable citation section below the answer content.

Behavior:

- `/chat` and `/chat/[id]` should use the same visual shell.
- Starting a new conversation should transition to the canonical conversation URL after the conversation id is created.
- Conversation history should not be hidden behind secondary navigation.

### Documents page `/documents`

Purpose:
Help users browse and understand the current knowledge assets, not just perform CRUD.

Layout:

- Strong page header with description and upload action.
- Filters and browsing controls near the top.
- Main content area as a structured list or hybrid card/list layout.

Content priorities:

- Document title.
- Processing status.
- Category.
- Chunk count.
- File metadata.
- Direct action to ask against that document.

Behavior:

- Empty state should invite the user to create their first knowledge asset set.
- "Ask" actions should carry the selected document context into the chat flow.

### Upload page `/documents/upload`

Purpose:
Offer a guided, low-friction import experience with strong trust cues.

Layout:

- Centered upload panel with drag-and-drop target.
- Inline title and category fields after file selection.
- Lightweight guidance for supported formats, limits, and processing expectations.

Behavior:

- The upload surface should feel ceremonial and focused, not like a plain form.
- Success state should guide users directly into asking questions.
- Progress and processing states should explain what happens next.

### Categories page `/categories`

Purpose:
Present the knowledge taxonomy as a map, not only as a maintenance tree.

Layout:

- Page header that explains why categories matter.
- Main area emphasizes hierarchy, description, and organizational meaning.
- Add and edit operations remain available without visually turning the page into a raw admin console.

Behavior:

- Category hierarchy should be readable at a glance.
- The page should feel like knowledge organization, not only configuration.

## AI Integration Strategy

### Approved direction

- Replace the current manual chat fetch and custom SSE handling with Vercel AI SDK.
- Keep the existing RAG retrieval, context assembly, and persistence responsibilities in the application code.
- Let the chat route emit AI SDK-compatible streaming responses.
- Let the client use the AI SDK chat hooks for message state and streaming UI.

### Model integration

- Use the GLM OpenAI-compatible interface as the primary integration path.
- Connect it through an AI SDK OpenAI-compatible provider.
- Keep the provider boundary isolated so the application can swap model details without rewriting page logic.

### Markdown rendering

- Use `streamdown` for assistant answer rendering.
- This is required so partially streamed markdown remains stable while tokens are still arriving.
- Assistant messages should not depend on a non-streaming markdown renderer.

### Source rendering

- Sources should remain structured data on the assistant message.
- Do not rely on the model to produce pseudo-citations inside plain text.
- Render sources in a dedicated citation section below the answer body.

## Chat Data Flow

### Server flow

1. Validate the incoming question.
2. Create or resolve the conversation.
3. Persist the user message.
4. Run retrieval and build the RAG context.
5. Start model streaming through AI SDK.
6. Accumulate the final assistant text while streaming.
7. Persist the completed assistant message with sources after stream completion.

### Client flow

1. Insert the local user message immediately.
2. Stream the assistant answer into the active answer card.
3. Keep the composer state explicit while generation is active.
4. Preserve partial output if the stream fails mid-generation.
5. Reflect final conversation id in the URL for new chats.

## Error Handling

- No-match retrieval should still render a normal assistant answer card explaining that no relevant knowledge was found.
- Chat errors must distinguish between network failure, model failure, and server failure where practical.
- Upload and delete actions may continue using toast notifications.
- The main chat experience must not rely on toast alone for critical status communication.

## Scope Boundaries

### In scope

- Full visual redesign of the current routes.
- Unification of `/chat` and `/chat/[id]` into one workspace pattern.
- Migration of chat streaming to Vercel AI SDK.
- Streaming markdown rendering with `streamdown`.
- Reuse of current backend data model and current knowledge-management capabilities.

### Out of scope

- Authentication or permission system redesign.
- New enterprise governance features.
- Major database schema redesign unrelated to chat persistence or display metadata.
- Expanding categories into a complex admin subsystem.

## Verification Requirements

- Validate the chat route streaming behavior and persistence behavior.
- Validate the chat UI for both new and existing conversations.
- Validate streamed markdown rendering and source section stability.
- Run lint and a production build to confirm compatibility with Next.js 16.2.3 and React 19.2.4.

## Implementation Notes

- Route handlers must continue to follow App Router conventions under `app/api/**/route.ts`.
- Page and layout updates must follow the current Next.js 16 App Router rules already verified from the local docs bundle.
- The redesign should preserve existing information architecture where it still supports the approved experience, but should not preserve current low-fidelity visual patterns.

## Success Criteria

- A first-time user can ask a question from the homepage without hesitation.
- The interface makes the knowledge base visible and credible.
- The chat workspace feels like the center of the product.
- Documents and categories feel curated rather than merely managed.
- Assistant answers stream smoothly and render stable markdown while generating.

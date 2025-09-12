# veri-TA-serum - gpt-oss-120b

Comparative benchmarking showed that gpt-oss-120b is much faster,  but gemini-2.5-flash produces more grounded reasoning. This trade off highlights the importance of tailoring the backbone model to the user’s priorities (latency vs. interpretability).

# Features
### 1. Claim Input
- Accepts user input via **text** or **voice**.  
- Designed for claims related to **personal finance** or **fitness**.  

### 2. Self-Deception Radar
- Uses **linear probes** on model activations to detect potential self-deception.  
- Provides a **deception risk score** for transparency.  

### 3. Counter-Narrative Generation
- Generates concise **counter-narratives** to challenge possible self-deception.  
- Offers **different perspectives** such as:  
  - Finance  
  - Fitness
  - Career
  - Relationships  
  - History
  - Famous Personas
  - Medicine

### 4. Symbolic Program Execution
- Converts user claims into an **abstract schema**.  
- Executes **symbolic test programs** with finance and fitness templates.  
- Includes checks for:  
  - Evidence validation  
  - Unit normalization  
  - Sanity thresholds  

### 5. Debate Mode
- Runs a **debate simulation** between:  
  - **Advocate Agent** (supports the claim)  
  - **Skeptic Agent** (challenges with evidence-backed pushback)  

### 6. Mirror Log
- Maintains a **history of abstractions, probe scores, and executed checks**.  
- Gives users full control with options to:  
  - Save  
  - Delete  
  - Export logs  

### 7. Vertical Selection
- Allows users to choose between **Finance** or **Fitness**.  
- Tailors self-deception detection and counter-narratives to the selected domain.  
- Provides tools for **domain-specific abstraction and case selection**.  

## Probe Math
We trained a lightweight logistic probe to estimate deception risk:

```math
\text{risk} = \sigma(\mathbf{w}^\top \mathbf{h} + b), 
\quad 
\sigma(x) = \frac{1}{1+e^{-x}}

## Tech Stack Overview

The application is built on a **modern, serverless-first stack** leveraging AI for its core functionality.

- **Framework**: [Next.js](https://nextjs.org/) (v15) using the **App Router**.  
- **Language**: [TypeScript](https://www.typescriptlang.org/).  
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.  
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) – pre-built, accessible, and customizable React components.  
- **AI Integration**: [Genkit.ai](https://firebase.google.com/docs/genkit) – defines and runs AI flows, integrated with **Google AI (Gemini models)**.  
- **Forms**: [React Hook Form](https://react-hook-form.com/) – performance-optimized form handling.  
- **Schema & Validation**: [Zod](https://zod.dev/) – schema declaration and validation for AI flow inputs/outputs and forms.  
- **Icons**: [Lucide React](https://lucide.dev/) – consistent and comprehensive icon set.  
- **Animation**: [Framer Motion](https://www.framer.com/motion/) – smooth and declarative animations.  

## Library Usage Rules

### UI and Styling

- **Component Library**: Exclusively use components from `shadcn/ui` (`@/components/ui`). These are the building blocks of our user interface.
- **Custom Components**: When a `shadcn/ui` component doesn't fit the need, create a new custom component in `@/components/`. Do not modify the base `shadcn/ui` files directly.
- **Styling**: All styling must be done with Tailwind CSS utility classes. Use the `cn` utility function (`@/lib/utils.ts`) to conditionally apply classes. Avoid writing custom CSS files.
- **Icons**: All icons must be imported from the `lucide-react` library.


### AI and Server Logic

- **AI Flows**: All AI-powered logic (e.g., deception detection, debate generation) must be encapsulated in Genkit flows within the `src/ai/flows/` directory.
- **Server Actions**: Use Next.js Server Actions (`'use server';`) in `src/app/actions.ts` to expose AI flows to the client-side components. This is the primary method for client-server communication.
- **Schema Definition**: Use Zod to define the input and output schemas for all Genkit flows. This ensures type safety and clear data contracts.


### State Management and Forms

- **Component State**: For local state, use React's built-in hooks like `useState` and `useEffect`.
- **Shared State**: For state that needs to be shared across multiple components, create custom hooks (e.g., `useMirrorLog` in `src/hooks/`). Avoid adding complex state management libraries like Redux or Zustand.
- **Forms**: All forms should be built using `react-hook-form`. Use the `@hookform/resolvers` package with Zod for robust validation.


### File Structure
To get started, take a look at src/app/page.tsx.

- **Pages**: The main application page is `src/app/page.tsx`.
- **Components**: Reusable, non-UI specific components are located in `src/components/`.
- **Hooks**: Custom React hooks are placed in `src/hooks/`.
- **Types \& Utilities**: Shared TypeScript types are in `src/lib/types.ts`, and utility functions are in `src/lib/utils.ts`.
- **AI Code**: All Genkit-related code, including flows and instances, resides in the `src/ai/` directory.



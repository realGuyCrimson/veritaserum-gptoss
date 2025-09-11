# **App Name**: veri-TA-serum

## Core Features:

- Claim Input: Accept user input either via text or voice for claims related to personal finance or fitness.
- Self-Deception Radar: Detect potential self-deception in the user's claim using linear probes on model activations, providing a deception risk score.
- Counter-Narrative Generation: Generate a concise counter-narrative to address the identified self-deception, offering reframes from different perspectives (e.g., health-first, budget-first, time-first).
- Symbolic Program Execution: Convert user claim into an abstract schema and execute a symbolic test program using finance and fitness templates. The test will help verify evidence checks, unit normalization and sanity thresholds.
- Debate Mode: Enable a debate mode featuring an Advocate and a Skeptic agent to provide evidence-backed pushback and challenge the user's claim.
- Mirror Log: Provide a history of abstractions, probe scores, and executed checks for the user to review. Ensure that users have complete control with controls to save, delete or export logs.
- Vertical Selection: Allows the user to select either Finance or Fitness, ensuring that their self-deception patterns and edge cases are dealt with accordingly. The available choices act as tools for the generated AI during abstraction and case selection.

## Style Guidelines:

- Primary color: Soft sky blue (#808080), evoking a sense of clarity and honesty, resisting any deceptive feelings.
- Background color: Very light desaturated blue (#F0F8FF), maintaining a calm and neutral environment.
- Accent color: Warm coral (#74ee15) for alerts and key interactive elements, like 'Self-Deception Radar'.
- Body and headline font: 'Inter' sans-serif font providing a neutral, objective and contemporary look.
- Code font: 'Source Code Pro' for clear display of program traces and logic, like SAL program templates.
- The Self-Deception Radar is a full width component along the top edge of the screen, allowing at-a-glance honesty checks and preventing deception patterns early.
- Use a smooth transition for reframing animations, ensuring a calm and considered tone when conveying counter-narratives.
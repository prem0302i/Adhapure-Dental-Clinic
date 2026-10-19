# Build Rules for the AI Coding Assistant

Follow these throughout development.

## Content honesty
1. Never fabricate clinic names, addresses, phone numbers, doctor credentials, prices, reviews, ratings, hours, equipment, awards or patient results.
2. Use visible placeholders (`[CLINIC NAME]`, `[CLINIC ADDRESS]`, `[WHATSAPP NUMBER]`) until real details arrive. Never publish placeholders as if genuine.
3. Never show patient photos or testimonials without confirmed permission. Never use stock or AI images as real patient results.
4. Do not promise medical outcomes or Google rankings. Do not claim legal compliance without verification.

## Code quality
5. Inspect existing files before changing anything. If the project is empty, create a clean conventional structure.
6. Use TypeScript types for important data. Keep components small and reusable. No duplicated code.
7. Keep clinic information in `src/lib/clinic-config.ts`.
8. Do not install unnecessary packages. Do not add backend complexity the scope does not need.
9. Keep the code maintainable and commented where the intent is not obvious.

## Working method
10. Work in small, testable stages. Do not build everything in one step.
11. At the end of each stage report: what was implemented, files changed, missing client information, and what was actually tested.
12. Test each major feature as it is built. Do not claim something works unless it was implemented and tested.
13. Every visible link and button must work. No nonfunctional buttons. No fake success messages.
14. Add loading, empty, success and error states where relevant.
15. Explain trade-offs and limitations clearly.

## Security and privacy
16. No secrets in client-side code. Use environment variables.
17. Validate all submitted data on the server. Render user content safely.
18. Collect only what is needed to answer an enquiry. No medical history, diagnoses or ID documents.
19. Do not log sensitive form data unnecessarily.
20. Provide a privacy policy placeholder for the clinic to review.

## Scope control
21. Do not build an admin dashboard, patient management or medical records system.
22. If a requested feature is outside the approved scope, explain the extra work, cost and timeline first and wait for approval.
23. Do not deploy, buy domains or incur paid costs without explicit approval from the project owner.
24. Do not promise unlimited revisions.

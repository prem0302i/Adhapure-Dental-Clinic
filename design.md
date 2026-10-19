# Design System

**Feel:** premium, calm, trustworthy, professional. Not a generic template.

## Colour tokens (store in `tailwind.config.ts`)
| Token | Hex | Use |
|---|---|---|
| navy | `#12263F` | Headings, primary buttons, footer |
| navy-soft | `#2B3F57` | Button hover |
| teal | `#1A8C8C` | Accent, hover |
| teal-deep | `#0F6B6E` | Links, WhatsApp button, focus ring (passes contrast on white) |
| teal-tint | `#E3F2F1` | Soft highlights, avatars |
| enamel | `#F5F9F8` | Section backgrounds |
| line | `#DCE5E6` | Borders and dividers |
| muted | `#55677A` | Secondary text |
| white | `#FFFFFF` | Page background |

Use one consistent colour for buttons, links and interactive states. Check contrast before adding new colour pairs.

## Typography
- **Headings:** Fraunces (serif), semibold, tight line height (about 1.1)
- **Body:** Figtree (sans-serif), comfortable size and line spacing (about 1.6)
- Sentence case everywhere. Avoid all-caps labels and decorative eyebrow text above headings.
- Keep text lines under about 75 characters.
- Use one type scale across the site (e.g. h1 36 to 60px, h2 30 to 36px, h3 20px, body 16 to 18px).

## Layout
- Max content width about 1152px, side padding 20px on mobile.
- Generous whitespace, about 96px between major sections on desktop.
- Sections vary in structure. Do not turn everything into identical rounded cards. Prefer lists with thin dividers for services, and use cards only where a card helps (doctors, gallery).
- Buttons are pill-shaped with a minimum height of 48px.
- Breakpoints: Tailwind defaults. Mobile first.

## Signature element
A single smile-shaped curve line in the hero that draws itself once on page load. This is the only autonomous animation. Respect `prefers-reduced-motion`.

## Interaction
- Smooth, restrained transitions (colour changes only on hover).
- Clear hover, focus, loading, success and error states.
- Visible focus outline on every interactive element.
- Functional mobile menu with correct `aria-expanded`.
- WhatsApp and "Request an appointment" visible from every page.

## Copy style
Plain, calm, sentence case, active voice. Buttons say exactly what happens ("Request an appointment", not "Submit"). Error messages say what went wrong and how to fix it. No hype and no medical promises.

## Imagery
Use only supplied photos. Until then, show clearly labelled image placeholders. Meaningful images need descriptive alt text. Decorative images get empty alt text.

## Accessibility floor
Semantic HTML, labelled form fields, keyboard operable, tap targets at least 44px, no horizontal scrolling, reduced-motion support.

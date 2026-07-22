## Context

The authenticated root page currently renders a standalone welcome card and performs its session check inside the page. There is no shared dashboard layout, navigation model, or responsive application frame. The project already uses Next.js App Router, Better Auth, Tailwind design tokens, Phosphor icons, and shadcn/ui.

## Goals / Non-Goals

**Goals:**

- Introduce one shared shell for authenticated dashboard pages.
- Preserve the existing server-side authentication boundary and sign-out action.
- Provide accessible desktop and mobile navigation using shadcn/ui primitives.
- Keep page content server-renderable and independent of navigation interaction state.

**Non-Goals:**

- Building functional dashboard features or data visualizations.
- Adding new API endpoints, persistence, roles, or navigation customization.
- Introducing a new component library or runtime dependency.

## Decisions

### Use an authenticated dashboard route group

Place the root dashboard page under a route group with a shared layout. The layout performs the existing Better Auth session check and renders the shell around `children`, keeping the public URL unchanged while ensuring future dashboard pages inherit the same boundary.

Alternative considered: keep authentication in each page. This duplicates security-sensitive checks and allows future pages to omit them accidentally.

### Compose the shell from shadcn/ui primitives

Use the project's shadcn sidebar composition for the desktop sidebar, mobile drawer behavior, trigger, header, and content inset. Use existing button and sign-out components where they already satisfy the interaction.

Alternative considered: build custom sidebar and drawer state. This would duplicate installed library behavior and require more accessibility and responsive code.

### Keep navigation declarative and local

Define the small initial navigation list alongside the sidebar component and render links from it, including pathname-based active state in the narrow client-side navigation boundary. The surrounding layout and page content remain server components.

Alternative considered: make the entire shell a client component. That broadens the hydration boundary without providing additional behavior.

### Preserve page ownership of content

The layout owns only navigation, header, spacing, and the main content landmark. Each route supplies its own page heading and content, so the shell does not need route-specific conditionals.

Alternative considered: derive all page metadata in the shell from pathname mappings. That creates a second routing configuration before multiple real pages exist.

## Risks / Trade-offs

- [The initial navigation contains destinations that are not implemented] → Include only links to routes delivered by this change, with the root dashboard as the initial destination.
- [Mobile and desktop navigation can diverge] → Render both modes from the same navigation data through the shadcn sidebar composition.
- [Client-side active state adds hydration] → Limit pathname usage to the navigation component rather than the full layout.
- [Moving the existing page into a route group can alter routing accidentally] → Keep the same `page.tsx` URL segment and verify the root URL and auth redirect in build checks.

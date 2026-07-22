## 1. Dashboard Foundation

- [x] 1.1 Add the shadcn/ui sidebar primitives required by the application shell.
- [x] 1.2 Create an authenticated dashboard route group and move the root page into it without changing the `/` URL.
- [x] 1.3 Move the existing Better Auth session check into the dashboard layout so all dashboard routes share the redirect boundary.

## 2. Application Shell

- [x] 2.1 Build the sidebar from a single navigation list with a root dashboard link, Phosphor icon, and pathname-based current-state semantics.
- [x] 2.2 Compose the dashboard layout with the shadcn sidebar provider, responsive mobile trigger, header context, sign-out action, and main content landmark.
- [x] 2.3 Update the root dashboard page content to render inside the shared shell with responsive spacing.

## 3. Verification

- [x] 3.1 Verify authenticated shell rendering, unauthenticated sign-in redirect, active navigation state, sign-out access, and desktop/mobile navigation behavior.
- [x] 3.2 Run `npm run typecheck`, `npm run lint`, and `npm run build`, and resolve any failures introduced by the change.

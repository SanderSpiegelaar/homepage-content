## Why

The application needs a consistent dashboard shell so product pages can share navigation, workspace context, and responsive behavior instead of defining their own layouts.

## What Changes

- Add a dashboard application shell with a persistent desktop sidebar and compact mobile navigation.
- Add a header with page context and common user controls.
- Provide primary navigation with clear active-state feedback.
- Provide a responsive content area that renders dashboard pages without duplicating shell markup.
- Compose the interface from the project's shadcn/ui components and existing design tokens.

## Capabilities

### New Capabilities

- `dashboard-shell`: Defines the shared, responsive dashboard layout, navigation, header, and page content region.

### Modified Capabilities

None.

## Impact

- Adds a dashboard route layout and reusable shell components.
- Adds or reuses shadcn/ui components needed for navigation and responsive presentation.
- Updates dashboard-facing page content to render within the shared shell.
- No external APIs, data models, or new runtime dependencies are required.

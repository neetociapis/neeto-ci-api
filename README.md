# NeetoCal API Docs

This repository contains the documentation for the [NeetoCal APIs](https://apidocs.neetocal.com/getting-started/introduction), built using [Mintlify](https://mintlify.com/).

## Project Overview

The documentation includes:

- **Getting Started Guide**: Introduction, authentication, subdomain identification, pagination,
  HTTP response codes and quickstart tutorials
- **Scheduling Links API**: Endpoints for creating and managing scheduling links and meetings
- **Bookings API**: Endpoints for creating, listing, rescheduling, and canceling bookings
- **Availabilities API**: Endpoints for managing meeting host availabilities
- **Slots API**: Endpoints for managing slot availability
- **Team Members API**: Endpoints for managing team members in the workspace
- **Packages API**: Endpoints for managing workspace packages
- **Discount Codes API**: Endpoints for managing discount codes for bookings

## Project Structure

```
neeto-cal-api/
├── api-reference/         # API endpoint documentation
│   ├── scheduling-links/  # Scheduling Links API documentation
│   ├── bookings/          # Bookings API documentation
│   ├── availabilities/    # Availabilities API documentation
│   ├── slots/             # Slots API documentation
│   ├── team-members/      # Team Members API documentation
│   ├── packages/          # Packages API documentation
│   └── discount-codes/    # Discount Codes API documentation
├── assets/                # Static assets (favicon, images)
├── bundled/               # Generated OpenAPI bundles (auto-generated)
│   ├── availabilities.yaml
│   ├── bookings.yaml
│   ├── discount-codes.yaml
│   ├── meetings.yaml
│   ├── packages.yaml
│   ├── slots.yaml
│   └── team-members.yaml
├── schemas/               # Contains reusable schema definitions
│   ├── common.yaml        # Shared schemas used across multiple endpoints
│   ├── booking.yaml       # Schemas related to bookings
│   ├── meeting.yaml       # Schemas related to meetings/scheduling links
│   ├── availability.yaml  # Schemas related to availabilities
│   ├── team-member.yaml   # Schemas related to team members
│   ├── package.yaml       # Schemas related to packages
│   └── discount-code.yaml # Schemas related to discount codes
├── docs/                  # OpenAPI specification files
│   ├── availabilities.yaml
│   ├── bookings.yaml
│   ├── discount-codes.yaml
│   ├── meetings.yaml
│   ├── packages.yaml
│   ├── slots.yaml
│   └── team-members.yaml
├── getting-started/       # Getting started guides
├── snippets/              # Reusable content snippets
├── scripts/               # Build and automation scripts
│   └── bundle.sh          # Script to bundle OpenAPI specs using Redocly
├── docs.json              # Mintlify configuration
├── theme.css              # Custom theme styling
└── package.json           # Project dependencies and scripts
```

## Installation

1. **Install Mintlify CLI globally:**

   ```bash
   npm i -g mint
   ```

2. **Install project dependencies:**
   ```bash
   yarn install
   ```

## Development Setup

To preview the documentation locally:

```bash
yarn docs:preview
```

A local preview will be available at `http://localhost:3000`. You can customize the port using the `--port` flag:

```bash
yarn docs:preview --port 3333
```

### Auto-rebuilding OpenAPI Specifications

The project uses nodemon to automatically rebuild OpenAPI specifications when changes are made to the source files. Start the development build process:

```bash
yarn build:dev
```

This will:

- Watch for changes in `.yaml` files
- Automatically bundle OpenAPI specifications using `@redocly/cli`
- Generate bundled files in the `bundled/` directory
- Ignore changes in the `bundled/` directory to prevent infinite loops

## Development Workflow

1. **Start the auto-rebuild process:**

   ```bash
   yarn build:dev
   ```

2. **Start the documentation preview:**

   ```bash
   yarn docs:preview
   ```

3. **Make changes to your documentation files** - both the preview and bundled files will update automatically

## API Documentation Structure

The documentation is organized into the following main sections:

- **Getting Started**: Introduction, authentication, and basic setup guides
- **Scheduling Links API**: Manage scheduling links and meetings
- **Bookings API**: Handle booking operations (create, list, reschedule, cancel)
- **Availabilities API**: Manage host availability settings
- **Slots API**: Query available time slots
- **Team Members API**: Manage team member operations
- **Packages API**: Handle workspace package management
- **Discount Codes API**: Manage discount codes for bookings

### Other references

- https://github.com/mintlify/docs
- https://mintlify.com/docs
- https://mintlify.com/docs/reusable-snippets

# Database Schema Documentation

## Overview

This document explains the database schema for our multi-tenant customer support platform. The schema is designed to support multiple organizations (tenants) while maintaining data isolation and security.

## Core Concepts

### Multi-tenancy
- Every table includes an `organization_id` column
- Row Level Security (RLS) policies ensure data isolation between tenants
- Unique constraints are scoped to organizations (e.g., unique email per organization)

### Authentication & Authorization
- Using Clerk for user authentication
- RLS policies use Clerk's JWT claims:
  - `org_id`: For organization-level access
  - `sub`: For user-specific access
  - Role-based permissions (admin vs agent)

## Tables

### 1. Organizations
Core table for multi-tenancy.
```sql
organizations (
    id UUID PRIMARY KEY,
    clerk_id TEXT UNIQUE,      -- Links to Clerk organization
    name TEXT,
    support_email TEXT,
    settings JSONB,            -- Flexible configuration storage
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
```

### 2. Agent Profiles
Support staff accounts linked to Clerk users.
```sql
agent_profiles (
    id UUID PRIMARY KEY,
    clerk_user_id TEXT,        -- Links to Clerk user
    organization_id UUID,
    name TEXT,
    email TEXT,
    role TEXT,                 -- 'admin' or 'agent'
    status TEXT,               -- 'online', 'offline', 'away'
    settings JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    UNIQUE(clerk_user_id, organization_id),
    UNIQUE(email, organization_id)
)
```

### 3. Customers
End-users who submit support tickets.
```sql
customers (
    id UUID PRIMARY KEY,
    organization_id UUID,
    name TEXT,
    email TEXT,
    metadata JSONB,            -- Flexible customer data storage
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    UNIQUE(email, organization_id)
)
```

### 4. Custom Fields System
Two tables for handling custom customer fields:

```sql
customer_fields (
    id UUID PRIMARY KEY,
    organization_id UUID,
    field_name TEXT,
    field_type field_type,     -- ENUM: text, number, boolean, date, select, multiselect
    is_required BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    UNIQUE(organization_id, field_name)
)

customer_field_values (
    id UUID PRIMARY KEY,
    organization_id UUID,
    customer_id UUID,
    field_id UUID,
    value TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    UNIQUE(customer_id, field_id)
)
```

### 5. Tickets
Core support ticket functionality.
```sql
tickets (
    id UUID PRIMARY KEY,
    organization_id UUID,
    customer_id UUID,
    assigned_to UUID,          -- References agent_profiles
    subject TEXT,
    status ticket_status,      -- ENUM: open, pending, solved, closed
    priority ticket_priority,  -- ENUM: low, normal, high, urgent
    metadata JSONB,
    last_activity_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
```

### 6. Ticket Messages
Conversation history for tickets.
```sql
ticket_messages (
    id UUID PRIMARY KEY,
    organization_id UUID,
    ticket_id UUID,
    sender_type sender_type,   -- ENUM: agent, customer, system
    sender_id UUID,            -- References either agent_profiles or customers
    body TEXT,
    is_internal BOOLEAN,       -- Private notes vs customer-visible messages
    email_message_id TEXT,     -- For email threading
    metadata JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
```

### 7. Macros
Predefined responses for common situations.
```sql
macros (
    id UUID PRIMARY KEY,
    organization_id UUID,
    title TEXT,
    body TEXT,
    created_by UUID,           -- References agent_profiles
    metadata JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    UNIQUE(organization_id, title)
)
```

### 8. Email Integration
Email account settings for ticket creation/responses.
```sql
email_accounts (
    id UUID PRIMARY KEY,
    organization_id UUID,
    email_address TEXT,
    imap_settings JSONB,
    smtp_settings JSONB,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    UNIQUE(organization_id, email_address)
)
```

## Security Model

### Row Level Security (RLS)
Every table has RLS enabled with policies that:
1. Restrict access to organization's own data
2. Enforce role-based permissions
3. Allow users to only see/modify appropriate data

Example policy:
```sql
CREATE POLICY "Users can view tickets in same organization" ON tickets
    FOR SELECT
    USING (
        organization_id IN (
            SELECT id FROM organizations 
            WHERE clerk_id = auth.jwt()->>'org_id'
        )
    );
```

### Role-Based Access
- **Admins**: Can manage all organization settings and data
- **Agents**: Can handle tickets and customer data
- Enforced through RLS policies and application logic

## Performance Optimizations

### Indexes
Each table has appropriate indexes for:
- Foreign keys
- Commonly filtered columns
- Unique constraints
- Composite conditions

Example indexes:
```sql
CREATE INDEX idx_tickets_org_id ON tickets(organization_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_org_status ON tickets(organization_id, status);
```

### Automatic Updates
Triggers maintain:
- `updated_at` timestamps
- `last_activity_at` for tickets
- Cascading updates where needed

## Common Patterns

### Metadata/Settings Fields
- JSONB columns for flexible data storage
- Used for future extensibility without schema changes
- Present in most tables as either `metadata` or `settings`

### Timestamps
All tables include:
- `created_at`: Creation timestamp
- `updated_at`: Last modification timestamp
- Automatically maintained by triggers

### Organization Scoping
All tables follow the pattern:
- `organization_id` foreign key
- Organization-scoped unique constraints
- RLS policies for tenant isolation

## Future Considerations

Potential improvements for future versions:
1. Audit trails for important changes
2. Status change history tracking
3. Enhanced email threading support
4. Soft deletes for data retention
5. Stricter validation for custom field values

## Type Generation

The schema is typed using TypeScript through Supabase's type generation. Types are stored in `src/types/supabase.ts` and include:
- Table definitions
- Insert/Update types
- Enums
- JSON structures

## Usage Examples

See the `src/utils/supabase/server.ts` file for the Supabase client setup and usage examples. 
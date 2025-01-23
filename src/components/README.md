# Component Organization

This directory is organized into the following structure:

```
components/
├── ui/                    # Reusable UI components (buttons, inputs, etc.)
├── features/             # Feature-specific components
│   ├── tickets/         # Ticket-related components
│   ├── agents/          # Agent-related components
│   ├── admin/           # Admin-related components
│   ├── reports/         # Reporting components
│   └── macros/          # Macro-related components
├── layouts/              # Layout components
│   ├── dashboard/       # Dashboard layout components
├── modals/               # Modal components
└── shared/              # Shared components used across features
└── modals/              # modals
└── customer/              # Customer related components
```

## Organization Rules

1. **UI Components (`/ui`)**: Base components that are highly reusable and not tied to business logic
2. **Feature Components (`/features`)**: Components specific to a feature area
3. **Layout Components (`/layouts`)**: Components that define page or section layouts
4. **Modal Components (`/modals`)**: All modal/dialog components
5. **Shared Components (`/shared`)**: Components used across multiple features but containing some business logic 
# Phase 4: Advanced Features — Requirements

**Weeks 13-16**

## Due Management Requirements

### Functional Requirements
- **RQ-4.1**: System shall send payment reminder emails to customers with outstanding due amounts
  - Reminders triggered based on configurable aging buckets (30/60/90+ days overdue)
  - Each reminder includes: customer name, outstanding amount, due date, link to payment portal
- **RQ-4.2**: Admin shall view collection report with aging breakdown
  - Report displays: total overdue amount, count by aging bucket, collection rate percentage
  - Filterable by date range, customer tier, status
- **RQ-4.3**: System shall support automatic follow-up notification scheduling
  - Configurable follow-up intervals (e.g., 7 days after initial reminder)
  - Track reminder delivery status and patient/customer acknowledgment

### Technical Requirements
- **RQ-4.4**: All due amount calculations use Decimal precision (10, 2)
- **RQ-4.5**: Reminder service integrates with existing SMTP notification infrastructure
- **RQ-4.6**: API endpoints follow modular MVC pattern under `backend/src/modules/`
- **RQ-4.7**: Zod validation schemas for all input/dto types
- **RQ-4.8**: Endpoints properly authenticated via BetterAuth session

### Acceptance Criteria
- **AC-4.1**: Payment reminders send successfully via email for all overdue customers
- **AC-4.2**: Collection report shows correct aging bucket breakdown
- **AC-4.3**: Follow-up scheduling respects configurable intervals
- **AC-4.4**: All API endpoints return 200/400/401/403 as appropriate
- **AC-4.5**: Zod validation catches invalid input before Prisma queries
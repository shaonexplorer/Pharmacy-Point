# Phase 1: Database Schema & Migrations - Requirements

## Functional Requirements

### FR-1: User Management
- As an admin, I need to manage user accounts so that staff can access the system.

### FR-2: Product Catalog
- As a pharmacist, I need to store product information so that inventory can be tracked.

### FR-3: Customer Records
- As a staff member, I need to store customer information so that sales can be attributed to customers.

### FR-4: Transaction History
- As a manager, I need to record all sales transactions so that reports can be generated.

## Non-Functional Requirements

### NFR-1: Data Integrity
- All database relationships must enforce referential integrity with foreign key constraints.

### NFR-2: Performance
- Queries for common operations must return in under 100ms for datasets up to 10,000 records.

### NFR-3: Backup & Recovery
- Database must support point-in-time recovery with WAL archiving.

## Technical Requirements

### TR-1: PostgreSQL
- Version 15+ with JSONB support for flexible data storage
- UUID primary keys for security

### TR-2: Prisma ORM
- Version 5.x
- Type-safe database client
- Migration management

### TR-3: Schema Design
- Normalized to 3NF
- Indexes on frequently queried columns
- Soft delete pattern for audit trail

### TR-4: Environment Configuration
- Separate databases for development, staging, and production
- Connection pooling with pgBouncer

## Entity Requirements

### User Entity
- id (UUID, PK)
- email (string, unique)
- name (string)
- role (enum: 'admin', 'staff')
- passwordHash (string)
- createdAt, updatedAt (timestamps)

### Product Entity
- id (UUID, PK)
- name (string)
- sku (string, unique)
- price (decimal)
- stockQuantity (integer)
- createdAt, updatedAt (timestamps)

### Customer Entity
- id (UUID, PK)
- name (string)
- email (string, optional)
- phone (string, optional)
- address (string, optional)
- createdAt, updatedAt (timestamps)

### Order Entity
- id (UUID, PK)
- customerId (FK, optional)
- userId (FK)
- total (decimal)
- status (enum)
- createdAt, updatedAt (timestamps)
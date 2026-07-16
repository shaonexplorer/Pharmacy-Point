# Phase 1: Customer Management - Requirements

## Functional Requirements

### FR-1: Customer CRUD
- As a staff member, I need to create and manage customer records so that I can track their purchases.

### FR-2: Customer Search
- As a user, I need to search for customers by name, email, or phone so that I can find them quickly.

### FR-3: Customer Details
- As a user, I need to view customer information and purchase history so that I can provide better service.

### FR-4: Customer Selection
- As a POS operator, I need to select customers during checkout so that sales are attributed correctly.

## Non-Functional Requirements

### NFR-1: Performance
- Customer search should return results in under 500ms

### NFR-2: Data Privacy
- Customer data must be protected with proper access controls

## Technical Requirements

### TR-1: Customer Fields
- name (string, required)
- email (string, optional, unique if provided)
- phone (string, optional)
- address (text, optional)
- createdAt (datetime, auto)
- updatedAt (datetime, auto)

### TR-2: API Endpoints
- GET /api/customers - List with search and pagination
- GET /api/customers/:id - Get customer with order history
- POST /api/customers - Create new customer
- PUT /api/customers/:id - Update customer
- DELETE /api/customers/:id - Delete customer

### TR-3: Frontend Components
- CustomerList - Table/list view with search
- CustomerCard - Individual customer display
- CustomerForm - Create/edit form
- CustomerSearch - Search input with dropdown

### TR-4: Validation
- Name is required
- Email must be valid format if provided
- Phone must be valid format if provided
- Duplicate email/phone checks
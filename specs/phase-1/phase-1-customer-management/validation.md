# Phase 1: Customer Management - Validation

## Acceptance Criteria

### AC-1: Customer CRUD
- [ ] Customers can be created with name and contact info
- [ ] Customers can be listed with search
- [ ] Customers can be edited
- [ ] Customers can be deleted

### AC-2: Search Functionality
- [ ] Search by name returns matching customers
- [ ] Search by email returns exact match
- [ ] Search by phone returns exact match
- [ ] Combined search works correctly

### AC-3: Customer Details
- [ ] Customer detail page shows all fields
- [ ] Order history is displayed
- [ ] Total spent is calculated
- [ ] Last purchase date is shown

### AC-4: POS Integration
- [ ] Customer can be selected from dropdown in POS
- [ ] Customer can be created during checkout
- [ ] Sale is linked to customer

## Test Cases

### TC-1: Create Customer
**Given** Staff member is on customer creation page
**When** Staff enters valid customer info and submits
**Then** Customer is created and appears in list

### TC-2: Search Customer
**Given** Customers with various names exist
**When** User searches for "John"
**Then** Customers with "John" in name are displayed

### TC-3: Duplicate Email Prevention
**Given** Customer with email "john@example.com" exists
**When** User tries to create customer with same email
**Then** Error message is shown

### TC-4: Customer Selection in POS
**Given** Customer "John Doe" exists
**When** POS operator selects "John Doe" during checkout
**Then** Sale is attributed to John Doe

## Validation Checklist
- [ ] Customer model in Prisma schema
- [ ] Customer CRUD API endpoints
- [ ] Customer search functionality
- [ ] Customer form with validation
- [ ] Customer detail page
- [ ] Order history display
- [ ] POS customer selection
- [ ] Email uniqueness validation
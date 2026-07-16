# Phase 1: Basic POS Interface - Validation

## Acceptance Criteria

### AC-1: Product Selection
- [ ] Products can be searched by name
- [ ] Product details (name, price, image) display correctly
- [ ] Products can be added to cart
- [ ] Stock availability is shown

### AC-2: Cart Management
- [ ] Items can be added to cart
- [ ] Item quantities can be updated
- [ ] Items can be removed from cart
- [ ] Cart total calculates correctly

### AC-3: Checkout Process
- [ ] Checkout button processes the sale
- [ ] Order is created in database
- [ ] Inventory is updated
- [ ] Customer can be associated (optional)

### AC-4: Receipt Generation
- [ ] Receipt displays after successful sale
- [ ] Receipt shows all items, prices, totals
- [ ] Receipt can be printed
- [ ] Sale is linked to staff member

## Test Cases

### TC-1: Add Product to Cart
**Given** Product "Aspirin" costs $10 with 100 in stock
**When** Staff searches for "Aspirin" and clicks "Add to Cart"
**Then** Aspirin appears in cart with quantity 1 and line total $10

### TC-2: Update Cart Quantity
**Given** Cart has 1 unit of "Aspirin" at $10
**When** Staff changes quantity to 3
**Then** Cart shows 3 units and line total $30, cart total updates

### TC-3: Complete Sale
**Given** Cart has items totaling $50 with $5 tax
**When** Staff clicks "Process Sale"
**Then** Order is created, inventory is reduced, receipt is shown

### TC-4: Stock Validation
**Given** Product has 2 units in stock
**When** Staff tries to add 3 units to cart
**Then** Maximum quantity allowed is 2

## Validation Checklist
- [ ] Product search component
- [ ] Product grid/list view
- [ ] Cart component with item management
- [ ] Quantity validation (not negative, not exceeding stock)
- [ ] Price calculation (subtotal, tax, total)
- [ ] Checkout process
- [ ] Order creation API
- [ ] Inventory update on sale
- [ ] Receipt generation
- [ ] Staff attribution on orders
- [ ] Customer association (optional)
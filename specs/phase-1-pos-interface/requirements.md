# Phase 1: Basic POS Interface - Requirements

## Functional Requirements

### FR-1: Product Selection
- As a staff member, I need to search and select products so that I can add them to the sale.

### FR-2: Cart Management
- As a staff member, I need to manage items in the cart so that I can adjust the sale before checkout.

### FR-3: Checkout Process
- As a staff member, I need to complete the sale so that the transaction is recorded.

### FR-4: Receipt Generation
- As a user, I need to generate a receipt so that the customer has proof of purchase.

## Non-Functional Requirements

### NFR-1: Performance
- Cart operations should be instant
- Checkout should complete in under 2 seconds

### NFR-2: Usability
- Interface should be keyboard-friendly
- Common actions should require minimal clicks

## Technical Requirements

### TR-1: POS Components
- ProductSearch - Search input with results
- ProductList - Grid of searchable products
- Cart - Display of items in cart
- CartItem - Individual item with quantity controls
- Checkout - Order summary and payment
- Receipt - Generated receipt display

### TR-2: Cart Operations
- Add item to cart (product -> cart)
- Remove item from cart
- Update item quantity
- Clear cart

### TR-3: Checkout Flow
- Customer selection (optional)
- Apply any discounts
- Calculate totals (subtotal, tax, total)
- Process payment (cash, card - Stripe integration in Phase 2)
- Generate receipt

### TR-4: Order Data Model
- Order with items
- OrderItem with productId, quantity, price
- Link to customer (optional)
- Link to user (staff member)
- Status: pending, completed, cancelled

### TR-5: API Endpoints
- POST /api/orders - Create new order
- GET /api/products - Search products for POS
- GET /api/orders/:id - Get order details

### TR-6: State Management
- Cart state in React context or Zustand
- Persisted during session
- Reset after successful checkout

## UI Requirements

### Product Selection
- Search bar at top
- Product grid with image, name, price
- Quick add buttons (1, 2, 3 quantity)
- Barcode scanning support (future phase)

### Cart
- List of items with quantity, price, total
- Quantity increment/decrement buttons
- Item removal
- Cart subtotal
- Tax display
- Order total

### Checkout
- Customer selection dropdown
- Payment method buttons
- Total amount
- Process sale button
- Print/email receipt options
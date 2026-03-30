# Complete API Documentation

**All API endpoints include automatic authentication and authorization**

---

## Authentication

All endpoints require an authenticated user. Authentication is handled via Supabase Auth cookies automatically.

### Error Responses

```json
// 401 Unauthorized
{ "success": false, "error": "Unauthorized" }

// 403 Forbidden  
{ "success": false, "error": "Forbidden" }

// 402 Payment Required (limit exceeded)
{ "success": false, "error": "Customer limit reached (5/5). Please upgrade your plan." }

// 404 Not Found
{ "success": false, "error": "Not found" }

// 400 Bad Request
{ "success": false, "error": "Customer name is required" }

// 500 Internal Server Error
{ "success": false, "error": "Internal server error" }
```

---

## Customers API

### GET /api/customers
List all customers for the user's company

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "company_id": "uuid",
      "name": "Acme Corp",
      "email": "contact@acme.com",
      "phone": "555-0123",
      "address": "123 Business St",
      "tax_number": "12-3456789",
      "notes": "Premium customer",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### POST /api/customers
Create a new customer

**Request:**
```json
{
  "name": "New Business Inc",
  "email": "hello@newbusiness.com",
  "phone": "+1-555-9999",
  "address": "999 Enterprise Ave",
  "tax_number": "98-7654321",
  "notes": "B2B customer"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": { /* customer object */ },
  "message": "Customer created successfully"
}
```

**Errors:**
- `402 Payment Required` - Free plan limit reached (max 5 customers)
- `400 Bad Request` - Missing required fields (name)

---

### GET /api/customers/[id]
Get a specific customer

**Response:**
```json
{
  "success": true,
  "data": { /* customer object */ }
}
```

**Errors:**
- `404 Not Found` - Customer doesn't exist
- `403 Forbidden` - Not your company's customer

---

### PUT /api/customers/[id]
Update a customer (admin only)

**Request:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "phone": "+1-555-1111",
  "address": "New Address"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated customer */ },
  "message": "Customer updated successfully"
}
```

**Errors:**
- `404 Not Found` - Customer doesn't exist
- `403 Forbidden` - Not admin

---

### DELETE /api/customers/[id]
Delete a customer (admin only)

**Response:**
```json
{
  "success": true,
  "data": { "id": "uuid" },
  "message": "Customer deleted successfully"
}
```

**Errors:**
- `404 Not Found` - Customer doesn't exist
- `403 Forbidden` - Not admin

---

## Products API

### GET /api/products
List all products (active only)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "company_id": "uuid",
      "category_id": "uuid|null",
      "name": "Premium Widget",
      "sku": "PW-001",
      "description": "High quality widget",
      "unit_price": 99.99,
      "cost_price": 50.00,
      "quantity": 150,
      "min_stock_level": 20,
      "image_url": "https://...",
      "is_active": true,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-20T15:30:00Z"
    }
  ]
}
```

---

### POST /api/products
Create a new product

**Request:**
```json
{
  "name": "Standard Widget",
  "sku": "SW-001",
  "description": "Standard quality widget",
  "category_id": "uuid|null",
  "unit_price": 49.99,
  "cost_price": 25.00,
  "quantity": 200,
  "min_stock_level": 10,
  "image_url": "https://images.example.com/widget.jpg"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": { /* product object */ },
  "message": "Product created successfully"
}
```

**Errors:**
- `402 Payment Required` - Free plan limit reached (max 20 products)
- `400 Bad Request` - Missing name or price

---

### GET /api/products/[id]
Get a specific product

**Response:**
```json
{
  "success": true,
  "data": { /* product object */ }
}
```

---

### PUT /api/products/[id]
Update a product

**Request:**
```json
{
  "quantity": 180,
  "unit_price": 89.99,
  "min_stock_level": 15
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated product */ },
  "message": "Product updated successfully"
}
```

---

### DELETE /api/products/[id]
Delete a product

**Response:**
```json
{
  "success": true,
  "data": { "id": "uuid" },
  "message": "Product deleted successfully"
}
```

---

## Invoices API

### GET /api/invoices
List all invoices with customer and creator info

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "company_id": "uuid",
      "customer_id": "uuid",
      "invoice_number": "INV-XXXXXXXX-1234567890",
      "status": "draft|sent|paid|overdue|cancelled",
      "issue_date": "2024-03-01",
      "due_date": "2024-03-31",
      "subtotal": 1000.00,
      "tax_amount": 100.00,
      "discount_amount": 0.00,
      "total": 1100.00,
      "notes": "Payment terms: Net 30",
      "created_by": "uuid",
      "created_at": "2024-03-01T10:00:00Z",
      "updated_at": "2024-03-01T10:00:00Z",
      "customers": { /* customer info */ },
      "profiles": { /* creator info */ }
    }
  ]
}
```

---

### POST /api/invoices
Create a new invoice

**Request:**
```json
{
  "customer_id": "uuid",
  "due_date": "2024-04-30",
  "subtotal": 1000.00,
  "tax_amount": 100.00,
  "discount_amount": 0.00,
  "total": 1100.00,
  "notes": "Thank you for your business!",
  "status": "draft"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": { /* invoice object with auto-generated invoice_number */ },
  "message": "Invoice created successfully"
}
```

**Errors:**
- `402 Payment Required` - Free plan limit reached (max 10 invoices)
- `400 Bad Request` - Missing required fields

---

### GET /api/invoices/[id]
Get invoice with all items and relationships

**Response:**
```json
{
  "success": true,
  "data": {
    /* invoice object */,
    "invoice_items": [
      {
        "id": "uuid",
        "invoice_id": "uuid",
        "product_id": "uuid|null",
        "description": "Premium Widget x1",
        "quantity": 1,
        "unit_price": 99.99,
        "discount_percent": 0,
        "total": 99.99,
        "created_at": "2024-03-01T10:00:00Z",
        "products": { /* product info if linked */ }
      }
    ]
  }
}
```

---

### PUT /api/invoices/[id]
Update invoice status or details

**Request:**
```json
{
  "status": "sent",
  "due_date": "2024-05-15",
  "tax_amount": 120.00,
  "total": 1220.00
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated invoice */ },
  "message": "Invoice updated successfully"
}
```

---

### DELETE /api/invoices/[id]
Delete an invoice (only draft status recommended)

**Response:**
```json
{
  "success": true,
  "data": { "id": "uuid" },
  "message": "Invoice deleted successfully"
}
```

---

## Subscriptions API

### GET /api/subscriptions
Get current user's subscription

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "company_id": "uuid",
    "status": "active|trial|canceled|past_due",
    "subscription_type": "monthly|yearly",
    "current_period_start": "2024-01-01",
    "current_period_end": "2024-01-31",
    "is_trial_active": true,
    "trial_end_date": "2024-01-14",
    "plan": {
      "id": "uuid",
      "name": "Free|Pro|Enterprise",
      "description": "...",
      "monthly_price": 0,
      "yearly_price": 0,
      "max_invoices": 10,
      "max_customers": 5,
      "max_products": 20,
      "max_users": 1,
      "features": {
        "invoices": true,
        "basic_reports": true,
        "api_access": false
      }
    }
  }
}
```

---

### PUT /api/subscriptions/[id]
Upgrade subscription to a different plan

**Request:**
```json
{
  "plan_id": "pro-plan-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated subscription with new plan */ },
  "message": "Subscription upgraded successfully"
}
```

**Errors:**
- `404 Not Found` - Subscription doesn't exist
- `403 Forbidden` - Not your subscription

---

### DELETE /api/subscriptions/[id]
Cancel a subscription

**Response:**
```json
{
  "success": true,
  "data": { 
    "id": "uuid",
    "status": "canceled"
  },
  "message": "Subscription canceled successfully"
}
```

---

## Rate Limiting & Quotas

All endpoints respect subscription limits:

| Plan      | Invoices | Customers | Products | Users |
|-----------|----------|-----------|----------|-------|
| Free      | 10       | 5         | 20       | 1     |
| Pro       | 500      | 500       | 1000     | 5     |
| Enterprise| Unlimited| Unlimited | Unlimited| 100   |

When limit is reached, API returns `402 Payment Required`:

```json
{
  "success": false,
  "error": "Product limit reached (20/20). Please upgrade your plan."
}
```

---

## Best Practices

### 1. Always handle errors
```typescript
const response = await fetch('/api/customers', { method: 'POST', ... })
const json = await response.json()

if (!response.ok) {
  console.error(json.error)
  return null
}

return json.data
```

### 2. Show limit warnings
```typescript
const { allowed, current, limit } = useCanCreateResource('customers')

if (!allowed) {
  showWarning(`Reached limit: ${current}/${limit}`)
}
```

### 3. Implement optimistic updates
```typescript
const newCustomer = { id: 'temp-id', ...data }
setCustomers([...customers, newCustomer])

const response = await fetch('/api/customers', {
  method: 'POST',
  body: JSON.stringify(data)
})

if (!response.ok) {
  setCustomers(customers) // revert
  toast.error('Failed to create customer')
}
```

### 4. Use TypeScript for safety
```typescript
interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
}

const response = await fetch('/api/customers')
const { data }: { data: Customer[] } = await response.json()
```

---

## Webhook Events (Future)

Coming soon:
- `subscription.upgraded`
- `subscription.downgraded`
- `subscription.canceled`
- `invoice.created`
- `invoice.paid`
- `limit.approaching`

---

## Rate Limiting (Future)

Coming soon:
- 100 requests per minute per user
- 1000 requests per minute per company
- Burst limit: 10 requests per second

---

## Version History

### v1.0 (Current)
- ✅ Customers CRUD
- ✅ Products CRUD
- ✅ Invoices CRUD
- ✅ Subscriptions management
- ✅ Role-based access control

### v2.0 (Planned)
- [ ] Webhooks
- [ ] Rate limiting
- [ ] Batch operations
- [ ] Advanced filtering
- [ ] Export to CSV/PDF

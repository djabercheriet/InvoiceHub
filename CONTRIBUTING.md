# Contributing to InvoiceHub

First off, thank you for considering contributing to InvoiceHub! It's people like you that make InvoiceHub such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs 🐛

Before creating bug reports, please check the [issue list](https://github.com/yourusername/invoicehub/issues) as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

**Before Submitting A Bug Report:**
- Check if you can reproduce the problem in the latest version
- Check the [discussions](https://github.com/yourusername/invoicehub/discussions) for common issues
- Check if the issue has already been reported

**How Do I Submit A (Good) Bug Report?**

Bugs are tracked as [GitHub issues](https://github.com/yourusername/invoicehub/issues). Create an issue and provide the following information:

- **Use a clear, descriptive title** for the issue
- **Describe the exact steps which reproduce the problem** in as much detail as possible
- **Provide specific examples to demonstrate the steps** - include code snippets, which you paste directly
- **Describe the behavior you observed after following the steps** and explain what's wrong
- **Explain which behavior you expected to see instead** and why
- **Include screenshots and animated GIFs** if possible
- **Include your environment details** - OS, Node version, npm version, browser
- **Include your database** - what subscription plan were you using

### Suggesting Enhancements ✨

Enhancement suggestions are tracked as [GitHub discussions](https://github.com/yourusername/invoicehub/discussions) and [issues](https://github.com/yourusername/invoicehub/issues).

**Before Submitting An Enhancement Suggestion:**
- Check if there's already a package that provides that enhancement
- Determine which repository the enhancement should be suggested in
- Perform a [cursory search](https://github.com/yourusername/invoicehub/issues) to see if the enhancement has already been suggested

**How Do I Submit A (Good) Enhancement Suggestion?**

Enhancement suggestions are tracked as [GitHub issues](https://github.com/yourusername/invoicehub/issues). Create an issue and provide the following information:

- **Use a clear, descriptive title** for the issue
- **Provide a step-by-step description of the suggested enhancement** in as much detail as possible
- **Provide specific examples to demonstrate the steps** - include design mockups if relevant
- **Describe the current behavior** and **explain the expected behavior** and why you think this would be useful
- **Include screenshots** if applicable
- **List some other applications where this enhancement exists**, if applicable

### Pull Requests 🚀

- Fill in [the required template](./PULL_REQUEST_TEMPLATE.md) (if available)
- Follow the [styleguides](#styleguides)
- End all files with a newline
- Avoid platform-dependent code

## Styleguides

### Git Commit Messages

- Use the present tense ("add feature" not "added feature")
- Use the imperative mood ("move cursor to..." not "moves cursor to...")
- Limit the first line to 72 characters or fewer
- Reference issues and pull requests liberally after the first line
- When only changing documentation, include `[ci skip]` in the commit description
- Consider starting the commit message with an applicable emoji:
  - 🎨 `:art:` when improving the format/structure of the code
  - 🚀 `:rocket:` when improving performance
  - 📚 `:books:` when writing docs
  - 🐛 `:bug:` when fixing a bug
  - ✨ `:sparkles:` when adding a new feature
  - 🧪 `:test_tube:` when adding tests
  - 🔒 `:lock:` when dealing with security
  - ⬆️ `:arrow_up:` when upgrading dependencies
  - ⬇️ `:arrow_down:` when downgrading dependencies
  - 💚 `:green_heart:` when fixing CI/CD
  - 🔧 `:wrench:` when updating configuration files

**Example:**
```
✨ Add customer segmentation feature

- Implement customer segments based on purchase history
- Add segment-based reporting dashboard
- Include segment filters in customer list

Closes #123
```

### TypeScript Styleguide

All code should follow these TypeScript conventions:

- Use `const` for variables, `let` only when necessary, never use `var`
- Use meaningful variable names - `userData` not `data`
- Always specify types explicitly - avoid `any` when possible
- Use interfaces for object types, types for unions
- Use proper error handling with try-catch blocks
- Add JSDoc comments for complex functions

**Example:**
```typescript
/**
 * Fetches customer data from the database
 * @param customerId - The ID of the customer to fetch
 * @returns The customer data or null if not found
 * @throws DatabaseError if the query fails
 */
async function getCustomer(customerId: string): Promise<Customer | null> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      
    if (error) throw error
    return data?.[0] ?? null
  } catch (error) {
    throw new DatabaseError(`Failed to fetch customer: ${error.message}`)
  }
}
```

### React Component Styleguide

- Use functional components with hooks
- Keep components small and focused (< 300 lines)
- Use TypeScript interfaces for props
- Extract reusable logic into custom hooks
- Use meaningful component names

**Example:**
```typescript
interface CustomerCardProps {
  customer: Customer
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function CustomerCard({ customer, onEdit, onDelete }: CustomerCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      // Delete logic
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{customer.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component content */}
      </CardContent>
      <CardFooter>
        <Button onClick={() => onEdit(customer.id)}>Edit</Button>
        <Button onClick={handleDelete} disabled={isLoading}>Delete</Button>
      </CardFooter>
    </Card>
  )
}
```

### Documentation Styleguide

- Use Markdown for documentation
- Use clear, concise language
- Include code examples for features
- Keep a table of contents for longer docs
- Update documentation when features change

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 8+ (or npm)
- Git
- Supabase account

### Setup Steps

```bash
# 1. Fork the repository
# (click Fork button on GitHub)

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/invoicehub.git
cd invoicehub

# 3. Add upstream remote
git remote add upstream https://github.com/yourusername/invoicehub.git

# 4. Install dependencies
pnpm install

# 5. Create environment file
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 6. Start development server
pnpm dev
```

### Before Submitting a Pull Request

1. **Run type checking**
   ```bash
   pnpm type-check
   ```

2. **Run linting**
   ```bash
   pnpm lint
   ```

3. **Run tests** (if applicable)
   ```bash
   pnpm test
   ```

4. **Build the project**
   ```bash
   pnpm build
   ```

5. **Test your changes manually**
   - Test in development mode
   - Test the build output
   - Test on different browsers/devices if UI changes

### Pull Request Process

1. Update [CHANGELOG.md](./CHANGELOG.md) with notes on your changes
2. Create a clear, descriptive commit message
3. Push to your fork
4. Submit a Pull Request with a clear title and description
5. Request review from maintainers
6. Address review feedback promptly
7. Ensure all CI checks pass

### Commit Message Convention

We follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type:**
- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation only changes
- `style` - Changes that don't affect code meaning
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `perf` - Code change that improves performance
- `test` - Adding or updating tests
- `chore` - Changes to the build process or dependencies
- `ci` - Changes to CI configuration files

**Scope:**
- `api` - API routes
- `auth` - Authentication
- `db` - Database
- `ui` - User interface
- `hooks` - React hooks
- `dashboard` - Dashboard pages
- `docs` - Documentation

**Example:**
```
feat(api): add customer segmentation endpoint

- Implement GET /api/customers/segments
- Add segment filtering logic
- Include segment analytics

Closes #456
```

## Additional Notes

### Issue and Pull Request Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `duplicate` - This issue or PR already exists
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested
- `wontfix` - This will not be worked on

### Recognition

Contributors will be:
- Added to the [CONTRIBUTORS.md](./CONTRIBUTORS.md) file
- Mentioned in release notes for their contributions
- Given credit in commit messages

## Questions?

Don't hesitate to ask! You can:
- Open a [GitHub Discussion](https://github.com/yourusername/invoicehub/discussions)
- Email us at support@invoicehub.dev
- Join our community channels

## Thank You!

Thank you for contributing to InvoiceHub! Your efforts help make this project better for everyone. 🎉

---

P.S. - Don't be shy about your contributions! Share what you've built and help others learn from your experience.

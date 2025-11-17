# Buy My Stuff - Copilot Instructions

## Repository Overview

Buy My Stuff is a full-stack e-commerce web application built with the PERN stack (PostgreSQL, Express, React, Node.js). It demonstrates full-stack engineering fundamentals including user authentication, product management, shopping cart functionality, and Stripe payment integration.

**Repository Stats:**
- **Type:** Full-stack web application
- **Backend:** Node.js (v16.18.0+) with Express.js
- **Frontend:** React 18 (created with Create React App)
- **Database:** PostgreSQL
- **Primary Languages:** JavaScript (.js, .jsx)
- **Size:** Small to medium (~14 directories, ~50 key files excluding node_modules)

## Project Structure

```
/
├── app.js                    # Main Express server entry point
├── package.json              # Backend dependencies
├── db/
│   ├── index.js             # PostgreSQL connection pool
│   └── bms_database.sql     # Database schema
├── routes/                   # Express route handlers
│   ├── account.js
│   ├── cart.js
│   ├── checkout.js
│   ├── login.js
│   ├── orders.js
│   ├── products.js
│   └── registration.js
├── utils/                    # Utility functions
│   ├── auth.js              # JWT authentication middleware
│   ├── decodeJWT.js         # JWT decoder
│   └── generateToken.js     # JWT token generator
└── view/                     # React frontend (separate project)
    ├── package.json          # Frontend dependencies
    ├── public/               # Static assets
    └── src/
        ├── App.js            # Main React app
        ├── components/       # React components
        └── utility/          # Frontend utilities
```

## Build and Development Instructions

### Initial Setup (First Time Only)

**ALWAYS run these steps in order when setting up the project:**

1. **Install Backend Dependencies:**
   ```bash
   cd /home/runner/work/buymystuff/buymystuff
   npm install
   ```
   - Takes ~4-5 seconds
   - May show deprecation warnings for `csurf` - this is expected
   - May show 18 vulnerabilities - this is expected in the current state

2. **Install Frontend Dependencies:**
   ```bash
   cd /home/runner/work/buymystuff/buymystuff/view
   npm install
   ```
   - Takes ~20-25 seconds
   - May show deprecation warnings - this is expected
   - May show 57 vulnerabilities - this is expected in the current state

3. **Set Up Database (Optional for development without DB):**
   - PostgreSQL server must be running
   - Create a database and import `db/bms_database.sql`
   - Create `.env` file in project root with:
     ```
     DB_USER=<your_db_user>
     DB_PASSWORD=<your_db_password>
     DB_HOST=localhost
     DB_PORT=5432
     DB_DATABASE=<your_db_name>
     PORT=4000
     TOKEN_SECRET=<any_secret_string>
     STRIPE_KEY=<stripe_publishable_test_key>
     ```
   - **Note:** Backend server starts without `.env` but database operations will fail

### Running the Application

**Backend Server:**
```bash
cd /home/runner/work/buymystuff/buymystuff
npm start
```
- Uses `nodemon` which auto-restarts on file changes
- Runs on port 4000 (or PORT from .env)
- Server starts successfully even without .env or database connection
- Database operations require PostgreSQL to be running and .env configured

**Frontend Development Server:**
```bash
cd /home/runner/work/buymystuff/buymystuff/view
npm start
```
- Runs on port 3000
- Proxies API requests to backend at localhost:4000
- Opens browser automatically
- Hot-reloads on file changes

### Building for Production

**Frontend Build:**
```bash
cd /home/runner/work/buymystuff/buymystuff/view
CI=false npm run build
```
- **CRITICAL:** Must use `CI=false` to disable treating warnings as errors
- Without `CI=false`, build fails due to ESLint warnings in existing code
- Takes ~30-40 seconds
- Creates optimized production bundle in `view/build/`
- Known ESLint issues in existing code:
  - Unnecessary escape characters in regex (CheckoutContainer.jsx, Registration.jsx, Details.jsx)
  - Missing React Hook dependencies (Home.jsx, Category.jsx, Product.jsx, Details.jsx)
  - Unused variables (Account.jsx)
  - Missing return value in array callback (SearchBar.jsx)

**Backend Build:**
- No build step required - Node.js runs JavaScript directly

### Testing

**Backend Tests:**
```bash
cd /home/runner/work/buymystuff/buymystuff
npm test
```
- Returns: "Error: no test specified" and exits with code 1
- No backend tests are currently implemented

**Frontend Tests:**
```bash
cd /home/runner/work/buymystuff/buymystuff/view
npm test
```
- Launches Jest test runner in watch mode
- Uses React Testing Library
- Tests are located alongside components

### Linting

**Frontend:**
- ESLint is configured in `view/package.json` under `eslintConfig`
- Uses `react-app` and `react-app/jest` configurations
- Automatically runs during development and build
- In CI mode (default in CI environments), warnings are treated as errors

**Backend:**
- No linter configuration file present
- No linting script in package.json

## Key Configuration Files

- **`.gitignore`:** Excludes `*/node_modules`, `.env`, and `node_modules/`
- **`view/package.json`:** Frontend dependencies, uses proxy to `http://localhost:4000`
- **`package.json`:** Backend dependencies, uses `nodemon` for development
- **`db/index.js`:** PostgreSQL connection pool configuration using environment variables
- **`bms.yaml`:** OpenAPI 3.0.3 specification for the REST API

## Environment Variables

**Required for full functionality (.env in project root):**
- `DB_USER`: PostgreSQL username
- `DB_PASSWORD`: PostgreSQL password
- `DB_HOST`: Database host (usually localhost)
- `DB_PORT`: Database port (usually 5432)
- `DB_DATABASE`: Database name
- `PORT`: Backend server port (default 4000)
- `TOKEN_SECRET`: JWT secret for authentication
- `STRIPE_KEY`: Stripe publishable test key for payments

**Note:** Create `.env` file manually - it's gitignored and not in the repository.

## Database Schema

**Tables:**
- `users`: User accounts with authentication
- `products`: Product catalog with inventory
- `carts`: Shopping cart items
- `orders`: Order records
- `products-orders`: Order line items

**Location:** `db/bms_database.sql` contains the complete schema.

## API Architecture

**Authentication:**
- JWT-based authentication using `jsonwebtoken` package
- Tokens generated in login/registration routes
- Auth middleware in `utils/auth.js`
- Uses bcrypt for password hashing

**API Routes:**
- `/register` - User registration
- `/login` - User authentication
- `/products` - Product catalog CRUD
- `/account` - User account management
- `/cart` - Shopping cart operations
- `/checkout` - Order processing with Stripe
- `/orders` - Order history

## Common Issues and Workarounds

1. **Frontend build fails in CI:**
   - **Problem:** ESLint warnings treated as errors when `CI=true`
   - **Solution:** Use `CI=false npm run build`

2. **node_modules accidentally committed:**
   - **Problem:** `.gitignore` has `*/node_modules` which may not catch root level
   - **Solution:** Already has `node_modules/` entry to prevent this

3. **Backend starts but database operations fail:**
   - **Problem:** PostgreSQL not running or .env not configured
   - **Behavior:** Server starts successfully but API calls that use database will fail
   - **Solution:** Ensure PostgreSQL is running and .env is properly configured

4. **Port conflicts:**
   - **Problem:** Port 4000 (backend) or 3000 (frontend) already in use
   - **Solution:** Change PORT in .env for backend, or use different port for frontend

## Working in This Repository

**Order of Operations for Code Changes:**

1. **Always install dependencies first:**
   ```bash
   npm install                  # In root for backend
   cd view && npm install       # In view/ for frontend
   ```

2. **For backend changes:**
   - Edit files in root, routes/, utils/, or db/
   - Start backend: `npm start` (uses nodemon, auto-restarts)
   - Test endpoints manually or wait for future test implementation

3. **For frontend changes:**
   - Edit files in view/src/
   - Start dev server: `cd view && npm start`
   - Changes hot-reload automatically
   - Build for production: `cd view && CI=false npm run build`

4. **For full-stack changes:**
   - Start backend first: `npm start` (in root)
   - Start frontend: `cd view && npm start` (in separate terminal)
   - Frontend proxies API calls to backend

**Never:**
- Commit `node_modules/` directories
- Commit `.env` files (contains secrets)
- Run `npm run eject` on the React app (one-way operation)

**Best Practices:**
- Use existing code patterns for new routes/components
- Follow the authentication pattern in existing routes
- Database queries use parameterized queries ($1, $2, etc.) to prevent SQL injection
- React components are in `view/src/components/`
- API route handlers are in `routes/`

## Trust These Instructions

These instructions have been validated through testing and exploration of the repository. Only search for additional information if:
- Instructions are incomplete for your specific task
- Instructions appear to be outdated or incorrect
- You need details about a specific component not covered here

When in doubt, refer to `README.md` for the official setup guide.

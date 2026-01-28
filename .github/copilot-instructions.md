# Car Rental Application - AI Coding Instructions

## Architecture Overview

This is a **MERN stack car rental application** with a clear frontend/backend separation:
- **Backend** (`backend/`): Express.js API with Mongoose ODM for MongoDB
- **Frontend** (`frontend/`): React 19 + Vite with React Router for SPA routing

The project is in **early development** - most routes are placeholders, controllers directory is empty, and auth is not yet implemented.

## Project Structure Patterns

### Backend Organization
- **ES Modules**: Both frontend and backend use `"type": "module"` - always use `import/export` syntax
- **Models**: Centralized exports via [backend/src/models/index.js](backend/src/models/index.js) - import like `import { User, Car, Reservation } from "./models/index.js"`
- **Routes**: RESTful API mounted at `/api/*` prefix ([server.js](backend/server.js#L18-L21))
- **Error Handling**: Global [errorHandler middleware](backend/src/middlewares/errorHandler.js) expects errors with `status` and `message` properties

### Frontend Organization
- **Context Pattern**: [AppContext.jsx](frontend/src/context/AppContext.jsx) provides global state for currency/language with conversion utilities
- **Routing**: React Router v7 configured in [main.jsx](frontend/src/main.jsx#L11-L17) with routes: `/`, `/cars/:id`, `/login`, `/signup`
- **Static Data**: Cars are currently loaded from [frontend/src/data/cars.js](frontend/src/data/cars.js) - this will eventually fetch from backend API
- **Styling**: Component-specific CSS files (e.g., `CarCard.css`, `Navbar.css`) - no global CSS framework

## Data Models & Relationships

### Key Mongoose Schemas
- **Car**: Has `fleeteeId` field for future integration with external Fleetee system
- **Reservation**: Tracks rental periods with `startDate/endDate`, links to User & Car via ObjectId refs
- **User**: Stores driver's license info (`licenseNumber`, `licenseExpiry`) - critical for car rental business logic
- All models use bidirectional references (e.g., User has `reservations[]`, Reservation has `user`)

### Enums to Respect
- Car `category`: `["CITADINE", "BREAK", "BERLINE", "SUV", "LUXE"]`
- Car `status`: `["DISPONIBLE", "RESERVATION", "MAINTENANCE", "INDISPONIBLE"]`
- Reservation `status`: `["PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"]`

## Development Workflows

### Starting the Application
```bash
# Backend (from root)
cd backend
npm run dev  # Uses nodemon for auto-reload

# Frontend (from root)
cd frontend
npm run dev  # Vite dev server with HMR
```

### Database Connection
- MongoDB URI from `process.env.MONGODB_URI` or defaults to `mongodb://localhost:27017/car-rental`
- Connection happens at server startup with top-level `await` in [server.js](backend/server.js#L28)
- No manual connection management needed in routes/controllers

### Environment Variables
Backend requires `.env` file with:
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (defaults to 5000)

## Critical Integration Points

### Fleetee External System
Models reference `fleeteeId` and `fleeteeReservationId` fields - this is a **planned integration** with an external fleet management system. When implementing API logic:
- These fields are optional initially
- Will be populated after external API integration
- Don't remove these fields even if unused currently

### Frontend ↔ Backend Communication
- Backend exposes CORS-enabled REST API at `http://localhost:5000/api/*`
- Frontend currently uses hardcoded data - **migrate to API calls** when implementing features
- Price display uses [AppContext's formatPrice()](frontend/src/context/AppContext.jsx#L29-L33) - always use this for currency formatting

## Code Conventions

### API Response Format
```javascript
// Success
res.json({ data: result });

// Error (caught by errorHandler)
const error = new Error("Invalid request");
error.status = 400;
throw error;
```

### React Component Patterns
- Functional components with hooks (React 19)
- Context accessed via `useAppContext()` hook - throws error if used outside provider
- Inline styles for layout, external CSS for component-specific styling

### Naming Conventions
- Backend files: lowercase with hyphens (`error-handler.js`)
- Frontend files: PascalCase for components (`CarCard.jsx`), camelCase for utilities
- API routes: plural nouns (`/api/cars`, `/api/reservations`)

## Next Implementation Steps

Based on placeholder routes, prioritize:
1. Implement auth controllers (register/login with password hashing)
2. Build CRUD operations for cars with availability checking
3. Create reservation flow with date conflict validation
4. Connect frontend forms to backend APIs
5. Add JWT-based authentication middleware

When adding controllers, create them in `backend/src/controllers/` and import into route files.

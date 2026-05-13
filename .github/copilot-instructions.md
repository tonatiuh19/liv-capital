# GitHub Copilot Custom Instructions

## ⚠️ CRITICAL RULES - MUST FOLLOW

- **NEVER fetch data directly in components with axios or fetch**
- **ALL data fetching MUST be done in Redux store (slices) using createAsyncThunk**
- **Components ONLY dispatch actions and select state from store**
- **NEVER Patch issues, always fix the root cause of type errors or bugs immediately**
- **Always think about mobile responsiveness first — every component must work perfectly on small screens before considering desktop**
- **if there is an opportunity to add reusable components or utilities, do it immediately to avoid technical debt**
- **Avoid any breaking changes**
- **NO EXCEPTIONS to these rules**

## ⚠️ MOBILE-FIRST — NON-NEGOTIABLE

This is a real estate site viewed heavily on mobile. Every UI change must:

- **Start with the mobile layout** — design for 375px width first, then scale up with `sm:`, `md:`, `lg:` breakpoints
- **Test touch targets** — buttons and links must be at minimum `44×44px` on mobile
- **Avoid horizontal overflow** — never use fixed widths wider than the viewport; prefer `w-full`, `max-w-*`, `px-4`
- **Typography scales** — use responsive text sizes (e.g. `text-3xl sm:text-5xl lg:text-7xl`), never fixed large sizes without mobile variants
- **No hover-only interactions** — any hover effect must also work on tap/touch
- **Images must be responsive** — always use `w-full`, `object-cover`, and appropriate `aspect-ratio` or `h-*` constraints
- **Stack on mobile, grid on desktop** — default to `flex-col` or single column, use `sm:grid-cols-2 lg:grid-cols-3` patterns

## Architecture

This project is a **static React SPA** deployed on **Banahosting (Apache + PHP shared hosting)**.

```
Browser
  └── React SPA (static files — HTML/CSS/JS)
        └── /api/* calls → PHP files on the same server
```

### ❌ NOT available on this hosting

- Node.js / Express server
- Serverless functions
- Server-Side Rendering (SSR)
- Database connections from the server (no MySQL/TiDB directly from Node)

### ✅ What IS available

- Static file serving (React SPA built with Vite)
- PHP scripts for API endpoints (`public/api/*.php`)
- Apache `.htaccess` for routing and redirects
- All client-side libraries (Redux, Formik, Axios, etc.) — they run in the browser

### Package Manager

- **Always use npm** (never pnpm or yarn)

## Project Structure

### Client (Frontend)

- `client/pages/` — Route components (`Index.tsx` = home page)
- `client/components/ui/` — Pre-built Radix UI component library
- `client/components/layout/` — `Header.tsx`, `Footer.tsx`
- `client/components/seo/MetaTags.tsx` — SEO meta tags component, use on every page
- `client/App.tsx` — App entry point with SPA routing
- `client/global.css` — TailwindCSS theme and global styles

### API (PHP)

- `public/api/*.php` — PHP API endpoints, one file per route
- Accessed via `/api/route-name` in production (`.htaccess` handles rewriting)
- Template for new PHP endpoints:

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

echo json_encode(['data' => 'value']);
```

### Shared

- `shared/` — TypeScript types and interfaces shared across client code
- `shared/api.ts` — API response interfaces

### Deploy

- `npm run build` — builds SPA to `dist/spa/`
- `npm run deploy` — builds + assembles `deploy/` folder (SPA + PHP + `.htaccess`) ready to upload
- See `DEPLOY.md` for full deployment guide
- See `LOCAL_DEV.md` for local development setup

## Path Aliases

- `@/*` — Maps to `client/` folder
- `@shared/*` — Maps to `shared/` folder

Always use these aliases instead of relative imports.

## Styling Guidelines

- Use **TailwindCSS 3** utility classes as the primary styling method
- Configure theme tokens in `client/global.css` and `tailwind.config.ts`
- **Always follow the color palette defined in `client/global.css`** — use existing theme colors (`cu-black`, `cu-orange`, `cu-stone`, `cu-concrete`, `cu-warm-white`)
- **Mobile-first breakpoints**: write base styles for mobile, then `sm:` → `md:` → `lg:`
- Use `framer-motion` for animations and transitions — keep them smooth and purposeful

## API Development

**Only create PHP endpoints when strictly necessary**, such as:

- Sending emails (contact forms via PHP `mail()` or SMTP)
- Processing form submissions that need server validation
- Handling private keys or third-party API proxying

For all other data, use static JSON, client-side state, or hardcoded content.

## State Management

### ⚠️ DATA FETCHING RULES (MANDATORY)

**ALL data fetching MUST happen in Redux store, NEVER directly in components.**

Redux, Axios, and all state management libraries are **client-side** — they work perfectly on static hosting.

✅ **CORRECT Pattern:**

```typescript
// In client/store/slices/mySlice.ts
export const fetchData = createAsyncThunk("slice/fetchData", async () => {
  const { data } = await axios.get("/api/endpoint");
  return data;
});

// In component
const dispatch = useAppDispatch();
const { data, loading } = useAppSelector((state) => state.mySlice);

useEffect(() => {
  dispatch(fetchData());
}, [dispatch]);
```

❌ **INCORRECT Pattern (NEVER DO THIS):**

```typescript
// WRONG: Direct axios call in component
const [data, setData] = useState([]);
useEffect(() => {
  axios.get("/api/endpoint").then((res) => setData(res.data)); // ❌ NEVER
}, []);
```

### General Redux Rules

- **Always use Redux store** (`client/store/`) for shared state management
- Use Redux hooks: `useAppDispatch` and `useAppSelector` from `client/store/hooks.ts`
- Create slices in `client/store/slices/` following existing patterns
- Use `createAsyncThunk` for all async operations
- Local `useState` is fine for UI-only state (open/close, hover, etc.)

## Form Validation

- **Always use Formik with Yup** for form validation — both are client-side, work on static hosting
- Create Yup schemas for all forms
- Define validation schemas separately for reusability

```typescript
import { useFormik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  email: Yup.string().email("Correo inválido").required("Requerido"),
  name: Yup.string().required("Requerido"),
});

const formik = useFormik({
  initialValues: { email: "", name: "" },
  validationSchema,
  onSubmit: (values) => dispatch(submitForm(values)),
});
```

## SEO

- **Always add `<MetaTags />` to every page** — import from `@/components/seo/MetaTags`
- Set `title`, `description`, and `keywords` props per page
- Use `noIndex` on 404 and utility pages
- The component handles Open Graph, Twitter Card, canonical URL, and JSON-LD automatically

## Component Guidelines

### UI Components

- Pre-built UI component library available in `client/components/ui/`
- Components use Radix UI primitives with TailwindCSS styling
- Always check existing UI components before creating new ones

### Icons

- Use **Lucide React** as primary icon library — import from `lucide-react`
- Use **react-icons** as fallback if Lucide lacks a needed icon

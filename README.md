# EventHub: Mini Event Management System

A full-stack MERN app (MongoDB, Express, React, Node.js). Admins create and manage events; users browse, search and register for them.

## Quick start

Requirements: [Node.js](https://nodejs.org) 20 or newer. MongoDB is optional for local development (see below).

**1. Start the API** (terminal 1)

```bash
cd server
npm install
cp .env.example .env      # Windows PowerShell: copy .env.example .env
npm run dev               # http://localhost:5000/api
```

**2. Start the frontend** (terminal 2)

```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

Open **http://localhost:5173**.

| Page | URL |
| --- | --- |
| Public events list | `/` |
| Admin dashboard (admin login lands here) | `/dashboard-admin/` |
| User dashboard (user login lands here) | `/dashboard-users/` |

An admin opening `/dashboard-users/` (or a user opening `/dashboard-admin/`) is sent to their own dashboard. Old links (`/admin`, `/my-registrations`) redirect to the new ones.

**Ready-made accounts** (created automatically on first start from `server/.env`):

| Role | Email | Password | Set in `.env` with |
| --- | --- | --- | --- |
| Admin | `admin@example.com` | `Admin@123` | `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` |
| User | `user@example.com` | `User@1234` | `USER_NAME`, `USER_EMAIL`, `USER_PASSWORD` |

More users can sign up from the app. Leave `USER_EMAIL` empty to skip the demo user.

### Database

| Option | `MONGO_URI` in `server/.env` |
| --- | --- |
| In-memory (default for development, nothing to install) | leave empty. Data is lost when the server stops. |
| Local MongoDB via Docker (`docker compose up -d`) | `mongodb://127.0.0.1:27017/event-management` |
| MongoDB Atlas | `mongodb+srv://<user>:<password>@<cluster>/event-management` |

The first in-memory start downloads a MongoDB binary, which takes a minute.

## Running on Windows (step by step)

**Step 1: Install Node.js (once)**

1. Go to [nodejs.org](https://nodejs.org) and download the **LTS** version.
2. Run the installer, keeping the default options.
3. Open **Command Prompt** (press the Windows key, type `cmd`, press Enter) and run `node -v`. You should see a version such as `v22.x.x`. If it says "not recognized", restart the computer and try again.

**Step 2: Unzip the project**

Right-click `mern.zip`, choose **Extract All…**, then **Extract**. Open the extracted folder until you see `server` and `client` inside `mern`.

**Step 3: Start the backend (first window)**

1. Open the `mern\server` folder in File Explorer.
2. Click the address bar, type `cmd` and press Enter. A Command Prompt opens in that folder.
3. Run these one at a time:
   ```
   npm install
   copy .env.example .env
   npm run dev
   ```
4. Wait for `API listening on http://localhost:5000/api`. The first start takes about a minute. **Keep this window open.**

**Step 4: Start the frontend (second window)**

1. Open the `mern\client` folder in File Explorer.
2. Click the address bar, type `cmd` and press Enter.
3. Run:
   ```
   npm install
   npm run dev
   ```
4. Wait for `Local: http://localhost:5173/`. **Keep this window open too.**

**Step 5: Open the app**

Go to **http://localhost:5173** in Chrome or Edge, then log in:

- **Admin:** `admin@example.com` / `Admin@123`
- **User:** `user@example.com` / `User@1234`, or click **Sign up** to create your own

**Stopping and restarting**

- To stop, press `Ctrl + C` in each window, or close both windows.
- To start again later, repeat steps 3 and 4 with only `npm run dev`. `npm install` and the `copy` command are needed only the first time.

**Troubleshooting**

| Problem | Fix |
| --- | --- |
| `'node' is not recognized` | Restart the computer after installing Node.js |
| Windows Firewall pop-up | Click **Allow** |
| `port already in use` / `EADDRINUSE` | Another program is using port 5000 or 5173. Close it, or restart the computer. |
| The page loads but login fails | The backend window isn't running. Check step 3. |
| All events and users disappeared | Expected with the default in-memory database, which clears when the backend stops. Set `MONGO_URI` to keep data. |

## Admin guide

Log in as `admin@example.com` / `Admin@123`. You land on the **Dashboard** at `/dashboard-admin/`.

| Spec step | How to do it |
| --- | --- |
| 3. Create a new event | Dashboard → **+ Create event** (top right) |
| 4. Enter the event details | Fill in **Event name**, **Description**, **Category**, **Location**, **Date & time** and **Maximum participants**. Invalid or empty fields show a red message; the date must be in the future. |
| 5. Save / Publish | **Publish event** makes it live at once. **Save as disabled** saves it hidden from users until you enable it. |
| 6. Event becomes available to users | Published events appear on the **Events** page straight away, where users can search, filter and register. |
| 7. View registrations | Dashboard → **Registrations** on the event's row. It shows each user's name, email, registration time and status, filterable by Registered / Cancelled / All. |
| 8. Edit, disable or delete | Available in three places: each row of the **Dashboard**, the event's **details page**, and its **Registrations** page. **Edit** opens the form pre-filled. **Disable / Enable** hides the event from users or shows it again, keeping existing registrations. **Delete** removes the event and its registrations. Disable and Delete ask for confirmation first. |

When editing, **Maximum participants** can't go below the number of people already registered. With 5 registrations, for example, the limit can't be set below 5.

## User guide

| Spec step | How to do it |
| --- | --- |
| 9. Register / Login | **Log in** with `user@example.com` / `User@1234`, or **Sign up** (name, email, password of 8+ characters), top right |
| 10. View available events | The **Events** page lists upcoming active events |
| 11. Search / filter | Search by name, description or location; filter by category and a date range. **Clear** resets the filters. |
| 12. Open event details | Click an event card to see full details and seats left |
| 13–15. Register | Click **Register**. If a rule blocks it (event full, already registered, event started or disabled), a clear message explains why. |
| 16. My Registrations | **My Dashboard** in the top menu (`/dashboard-users/`), where registrations are split into Upcoming, Past and Cancelled |
| 17. Cancel | **Cancel** on an upcoming registration, or **Cancel registration** on the event page. Allowed until the event starts; the seat is freed for someone else. You can register again later if seats are left. |

## Features

**Admin**
- Log in to a dashboard with totals for events, upcoming events, active registrations and users
- Create events (name, description, category, location, date and time, maximum participants), and either publish them or save them as disabled
- Edit, disable / enable, or delete events (deleting removes the event's registrations)
- See each event's registrations with name, email, date and status
- Search and filter events by status

**User**
- Sign up and log in
- Browse upcoming events; search by name, description or location; filter by category and date range (filters stay in the URL)
- Open an event to see details and live seat availability
- Register, view everything on **My Dashboard** (`/dashboard-users/`, split into Upcoming / Past / Cancelled), and cancel before the event starts

## Business rules (enforced by the API)

| Rule | How it's enforced |
| --- | --- |
| Only logged-in users can register | `requireAuth` middleware → 401 |
| The event must exist | 404 |
| Only ACTIVE events accept registrations | 400 |
| No registration after the event date / time | 400 |
| No duplicate registrations | explicit check (409) **and** a unique `(user, event)` index |
| No registration when the event is full | explicit check (409) **and** an atomic seat reservation |
| Only admins can create, edit, disable or delete events | `requireRole('ADMIN')` → 403 |
| Capacity can't be reduced below current registrations | conditional update → 400 |

The registration checks run in the order the spec lists them, so users get a clear message. The seat is then reserved in **one atomic MongoDB update** that only succeeds while the event is still active, upcoming and not full:

```js
Event.findOneAndUpdate(
  { _id, status: 'ACTIVE', dateTime: { $gt: now }, $expr: { $lt: ['$registeredCount', '$maxParticipants'] } },
  { $inc: { registeredCount: 1 } },
)
```

So when many users race for the last seat, exactly one gets it. This was tested with 20 concurrent requests for 3 seats: exactly 3 succeeded. If saving the registration fails afterwards, the seat is given back. Cancelling uses a conditional update too, so a double-click can't free the same seat twice.

## API

All routes are prefixed with `/api`. Errors return `{ message, errors? }`, where `errors` maps field names to messages.

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Sign up (always a USER) |
| POST | `/auth/login` | Public | Log in, returns a JWT |
| GET | `/auth/me` | Logged in | Current user |
| GET | `/events?search&category&from&to&page&limit` | Public | Upcoming active events |
| GET | `/events/categories` | Public | Categories in use |
| GET | `/events/:id` | Public (token optional) | Event details plus the caller's registration |
| POST | `/events/:id/register` | USER | Register |
| GET | `/registrations/me` | Logged in | My registrations |
| PATCH | `/registrations/:id/cancel` | Owner | Cancel a registration |
| GET | `/admin/stats` | ADMIN | Dashboard totals |
| GET | `/admin/events?search&status&page&limit` | ADMIN | All events |
| POST | `/admin/events` | ADMIN | Create |
| GET / PUT / DELETE | `/admin/events/:id` | ADMIN | Read / update / delete |
| PATCH | `/admin/events/:id/status` | ADMIN | Enable or disable |
| GET | `/admin/events/:id/registrations?status` | ADMIN | Registrations for an event |

## Project structure

```
server/src/
├─ config/         env and database connection
├─ models/         User, Event, Registration (Mongoose)
├─ middleware/     auth (JWT + roles), Zod validation, error handler
├─ validators/     request schemas
├─ services/       registration rules, startup accounts
├─ controllers/    auth, events, registrations, admin
├─ routes/         all routes in one place
├─ app.js          Express app
└─ index.js        startup
client/src/
├─ api/            fetch wrapper and endpoint functions
├─ context/        auth and toast providers
├─ hooks/          useFetch, useDebounced
├─ utils/          formatting, styles, page paths (routes.js)
├─ components/     layout, navbar, route guard, UI primitives
└─ pages/          user pages and admin/ pages
```

## Security notes

- Passwords are hashed with bcrypt and never returned by the API.
- JWTs are verified on every request, and the user is reloaded from the database, so a deleted account loses access immediately.
- Login gives the same message for an unknown email and a wrong password.
- Emails are stored lowercased, so `Mira@x.com` and `mira@x.com` are the same account.
- Search input is escaped before being used in a regular expression.
- `helmet`, a CORS allow-list (`CLIENT_URL`) and a 100 KB body limit are enabled.

## About this submission

I built this with the help of an AI coding assistant. I directed the features, reviewed and tested all of the code, and I'm comfortable walking through any part of it and the decisions behind it.

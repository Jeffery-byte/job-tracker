# Job Tracker

A React 19 application for organizing job applications with Supabase / PostgreSQL.
Track applications across **16 stages in four phases**, update stages with quick
actions, search application details, and view phase counts and days in stage.

[Live demo](https://job-tracker-alpha-woad.vercel.app/)

## Run locally

Use Node.js 22 and npm.

```sh
git clone https://github.com/Jeffery-byte/job-tracker.git
cd job-tracker
npm ci
cp .env.example .env
npm start
```

Open http://localhost:3000. Set the two `REACT_APP_SUPABASE_*` values in `.env`
to use your own Supabase project; restart the development server after changes.
The existing public demo configuration remains the fallback for compatibility.
Use synthetic records when exploring a shared demo.

## Database setup

The SQL files in this repository are **upgrades for an existing `applications`
table**, not a complete fresh database bootstrap. The app expects base columns
including `id`, `company`, `position`, `status`, `applied_date`, `created_at`,
`location`, `job_url`, `notes`, and `priority`.

Review `simple-pipeline-migration.sql` for the basic pipeline columns and
`database-migration.sql` for stage history, phase calculation, and triggers.
Apply migrations only to your own database after reviewing them and backing up
existing data. Supabase Row Level Security policies are configured separately;
this repository does not establish per-user access isolation.

The browser uses a public Supabase anon key. It is not a secret and does not
replace access policies. Never put a service-role key in a React environment
variable or source file. This version has no end-user authentication flow.

## Features and implementation

- Create, edit, and delete application records.
- Filter by pipeline phase or stage and search application details.
- Use predefined stage transitions and progress indicators.
- View phase totals and average days in stage.

`src/pipelineConfig.js` defines the stages and transitions. `src/App.js` handles
the interface and CRUD operations. Data loads on page load and refreshes after
mutations; the app does not subscribe to Supabase Realtime.

## Development commands

```sh
npm run build
npm test -- --watchAll=false
```

The build output is `build/`. This project uses Create React App and Tailwind CSS.
There are no measured uptime or performance guarantees in this repository.

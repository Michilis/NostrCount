# Architecture.md

## Overview

"Nostr Count" is a fully client-side web app that allows users to track and share life counters using the Nostr protocol. Events are stored as `kind: 30078` and fetched using Nostr relays. It includes two counter types:

* Days **since** a past date (e.g., quit smoking)
* Days **until** a future event (e.g., vacation)

The app does **not require a backend**, but can optionally use one for caching, trending counters, and zap analytics.

---

## Tech Stack

### Frontend

* **React 18 + TypeScript** – UI and component structure
* **Tailwind CSS** – Styling
* **NDK (Nostr Dev Kit)** – Nostr integration
* **Day.js** – Date calculation and formatting
* **Vite** – Build tool (or Next.js if SSR required)

### Nostr Relays

* Default relays (configurable via `.env` or app settings):

  * `wss://relay.azzamo.net`
  * `wss://relay.damus.io`
  * `wss://nostr.oxtr.dev`
* Events published and read via NDK

### Optional Backend (Future Option)

* Node.js/Express or FastAPI
* Purpose:

  * Cache counters per pubkey
  * Track zap totals per counter
  * Optional user API for bookmarks/favorites

---

## Event Structure (kind: 30078)

```json
{
  "kind": 30078,
  "content": "", // Not used for now
  "tags": [
    ["d", "quit-smoking"],
    ["type", "since"],
    ["title", "Quit smoking"],
    ["date", "2023-09-01"],
    ["visibility", "public"]
  ],
  "created_at": 1690000000,
  "pubkey": "<user-pubkey>"
}
```

### Required Tags

* `d`: unique ID or slug (e.g. kebab-case of title)
* `type`: `since` or `until`
* `title`: human-readable name of the counter
* `date`: ISO date string (YYYY-MM-DD)
* `visibility`: `public` or `private`

---

## App Pages / Routes

### `/`

* Landing page
* Featured public counters
* CTA: "Create a Counter"

### `/dashboard`

* Login required
* List of user’s counters (from pubkey)
* Create new counter button

### `/counter/:slug`

* View a public counter
* Show days since/until, zap button, author

---

## Components

### `CounterCard`

* Displays a single counter (days diff + title)
* Button to share or open

### `CounterFormModal`

* Modal for creating/editing a counter
* Inputs: title, date, type, visibility

### `ZapButton`

* Renders LN zap request if author has Lightning address in NIP-05/metadata

### `NDKProvider`

* Provides global access to NDK instance
* Handles login, signer, and event fetch/publish

---

## Future Features (Not MVP)

* Comments (reply to counter event)
* Counter streaks
* Private reminders
* iCal export or notification system

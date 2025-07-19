# context.md

## Purpose

The goal of this app is to provide a minimalist but powerful tool for people to track life milestones using the Nostr protocol. It's completely censorship-resistant and optionally anonymous.

Examples:

* Days **since** quitting alcohol
* Days **since** last porn use
* Days **since** last cigarette
* Days **until** a planned event like a trip, wedding, or conference

The app encourages positive habit tracking and event anticipation. Counters are personal but shareable, with optional zapping support.

---

## User Roles

### Anonymous Visitor

* Can view public counters
* Cannot create or save counters

### Nostr Logged-In User

* Can create counters (published to Nostr relays)
* Can edit/delete own counters (via NIP-01 signature)
* Can receive zaps

---

## User Flows

### 1. Login

* User connects a Nostr signer (e.g. extension or mobile app)
* App stores the pubkey in state (no server-side session needed)

### 2. Create a Counter

* Click `+ Days Since` or `+ Days Until`
* Fill form: title, type, date, visibility
* App constructs a `kind: 30078` event
* Signs and publishes it to relays

### 3. View Dashboard

* Shows counters created by the user
* Sorted by creation or date proximity

### 4. Public Viewing

* Counters from all users marked `public`
* Optional featured section
* Zap button visible if NIP-05 or lightning address is detected

### 5. Share a Counter

* Permalink to `/counter/:slug`
* Users can repost or share

---

## Event Fetch Logic

* Use NDK to fetch kind 30078
* Filter by:

  * Author pubkey (for personal dashboard)
  * Tag `visibility=public` for public view
* Parse date and type for rendering

---

## Edge Cases & Decisions

* Two counters with same `d` tag? Latest one overrides for that user
* Private counters are not displayed publicly, even if published to relays
* If date is in the future and type is `since`, display warning
* Zap metadata must be fetched separately using NIP-05 or kind:0 event

---

## Philosophy

This is a lightweight, open, and empowering way to track progress. It's built on top of Nostr to ensure:

* Decentralized data storage
* No vendor lock-in
* Optional pseudonymity
* Easy integration with the Lightning Network (via zaps)

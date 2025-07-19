
## Purpose

This guide explains how to create and publish "Days Since / Until" counter events on Nostr using NDK (Nostr Development Kit).

Counters are stored as `kind: 30078` events with metadata tags for rendering.

---

## Prerequisites

* NDK installed
* Signer available (via NIP-07, NIP-46, or npub/nsec input)
* Relay pool configured and connected

---

## Example Setup

```ts
import NDK, { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

const ndk = new NDK({
  explicitRelayUrls: [
    "wss://relay.azzamo.net",
    "wss://relay.damus.io"
  ]
});
await ndk.connect();

// Login with nsec
const signer = new NDKPrivateKeySigner("nsec1...");
ndk.signer = signer;
await ndk.signer.user();
```

You can also support login via npub (read-only) or NIP-07 browser extension.

---

## Create Counter Function

```ts
async function publishCounter({
  title,
  date,
  type = "since", // or "until"
  visibility = "public", // or "private"
}: {
  title: string;
  date: string; // format YYYY-MM-DD
  type?: "since" | "until";
  visibility?: "public" | "private";
}) {
  const event = new NDKEvent(ndk);
  event.kind = 30078;
  event.tags = [
    ["type", type],
    ["title", title],
    ["date", date],
    ["visibility", visibility],
  ];
  event.content = "";

  await event.sign();
  await event.publish();
  return event;
}
```

---

## Public Counter Example

```ts
const ev = await publishCounter({
  title: "Quit smoking",
  date: "2024-12-01",
  type: "since",
  visibility: "public",
});
console.log("View at /counter/" + ev.id);
```

### Published JSON Output:

```json
{
  "kind": 30078,
  "content": "",
  "tags": [
    ["type", "since"],
    ["title", "Quit smoking"],
    ["date", "2024-12-01"],
    ["visibility", "public"]
  ],
  "created_at": 1725000000,
  "id": "note1...",
  "pubkey": "npub1..."
}
```

### Slug / Permalink

Use the full event ID as the URL slug:

```
/counter/note1xyz...  ← based on event.id (NIP-19 encoded)
```

---

## Private Counter Example

```ts
await publishCounter({
  title: "Last relapse",
  date: "2025-07-01",
  type: "since",
  visibility: "private",
});
```

> Note: Private counters are still published to relays but can be filtered out in the app logic.

---

## Reading Events

To fetch all public counters:

```ts
const events = await ndk.fetchEvents({
  kinds: [30078]
});

const publicEvents = Array.from(events).filter(e =>
  e.tags.find(([k, v]) => k === "visibility" && v === "public")
);
```

To fetch your own counters:

```ts
const user = await ndk.signer?.user();
const events = await ndk.fetchEvents({
  kinds: [30078],
  authors: [user?.pubkey || ""]
});
```

---

## Notes

* The URL slug for counters is the **event ID** (NIP-19 encoded if needed)
* Event `id` is used to lookup and display the counter
* Lightning zaps should be handled via metadata (fetch kind:0 or NIP-05 info)
* Updating a counter means publishing a new event with new content

---

Let me know if you want to include zaps, NIP-75 fundraising goals, or update/delete flows.

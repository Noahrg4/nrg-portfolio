# NRG CRM — Lead Import JSON Specification

**Audience:** AI agents (Claude Code or otherwise) and anyone generating
leads to import into Noah's CRM at https://nrgwebsites.com/admin.
**Output:** a single JSON object the user pastes into the **Import JSON**
button on the Leads tab.

---

## TL;DR

Produce a JSON object shaped like this:

```json
{
  "leads": [
    {
      "businessName": "El Rey Restaurant",
      "niche": "Restaurant",
      "neighborhood": "Midtown Houston",
      "phone": "(713) 555-0123",
      "email": "info@elreyhouston.example",
      "contactName": "Maria Garcia",
      "source": "Google Maps cold",
      "stage": "Found",
      "scoreFactors": {
        "badOrNoWebsite": true,
        "clearlyMakingMoney": true,
        "easyToReach": true,
        "goodNicheFit": true
      },
      "notes": "Strong lunch crowd, Instagram is active, but the only web presence is a stale Facebook page. Owner runs everything herself.",
      "followUpAt": "2026-06-01",
      "nextActionNote": "Email by Friday — pitch website + Google listing setup"
    }
  ]
}
```

The user pastes this whole object into the Import JSON button. The server
fills in everything else (id, score, timestamps, etc.).

---

## The only required field

| Field | Required? | What it is |
|---|---|---|
| `businessName` | **Yes — the only required field.** | Business / contact's primary name. Used as the human-readable label and as part of the dedup key. |

Every other field is optional. Omitted fields get sensible defaults. The
import will reject the entire batch if any lead is missing `businessName`.

---

## Full field reference

Fields fall into three buckets:

### Bucket 1 — Fields the agent should fill in (the meaningful ones)

| Field | Type | Notes |
|---|---|---|
| `businessName` | string | **Required.** "Anthony Gushow & Sons", "Bloom Beauty Studio". Trim whitespace. |
| `niche` | string | Free text, but matching one of these keeps the data clean: `Restaurant`, `HVAC`, `Law`, `Salon`, `Trades`, `Retail`, `Other`. |
| `neighborhood` | string | Free text. "Houston Heights", "Sugar Land", "Bay City, MI". Useful for filtering and local SEO context. |
| `phone` | string | Free format — `(713) 555-1234` or `713-555-1234` both work. The dedup key normalizes to digits only, so format doesn't matter. |
| `email` | string | Standard email format. Empty string is fine if unknown. |
| `contactName` | string | Owner / decision-maker if you can find them. |
| `source` | string | Where you found this lead. Stick to one of: `Google Maps cold`, `Walk-in`, `Referral`, `Inbound`, `Other`. |
| `stage` | enum | One of: `Found`, `Researched`, `Emailed`, `Called`, `Follow-up`, `Proposal`, `Won`, `Lost`. **Default and almost-always-correct: `"Found"`** for newly discovered prospects. Case-sensitive. |
| `scoreFactors` | object | The lead-quality flags. Boolean each. See the scoring table below — the resulting 0–9 score is **computed server-side**, don't pre-fill `score`. |
| `notes` | string | Anything qualitative about the lead. The more, the better — these are Noah's read on what makes this a real prospect. Multi-line OK (use `\n` in JSON). |
| `followUpAt` | string `YYYY-MM-DD` OR `null` | When Noah should follow up. Setting this puts the lead on the "Due now" banner once that date arrives. |
| `nextActionNote` | string | A concrete TODO. "Email by Friday with case study." Empty string OK. |

### Bucket 2 — Fields you can usually leave out (server fills them)

| Field | Type | Default |
|---|---|---|
| `id` | string (UUID) | Auto-generated if omitted. |
| `score` | number 0–9 | Computed from `scoreFactors` server-side. Don't pre-fill. |
| `touchCount` | number | `0` for new leads. |
| `stageHistory` | array | Initialized to `[{ stage, at: <now> }]`. |
| `createdAt`, `updatedAt` | ISO string | `<now>`. |
| `emailedAt`, `calledAt` | ISO string OR `null` | `null` for new leads. |
| `convertedClientId` | string OR `null` | `null` until the lead is converted to a client. |

### Bucket 3 — `scoreFactors` (the weighted 0–9 lead score)

| Factor (boolean) | Weight | When `true` |
|---|---:|---|
| `badOrNoWebsite` | +3.0 | The clearest buying signal. No website, or a 2008 Wix template. |
| `clearlyMakingMoney` | +2.5 | They can afford it. Steady traffic, visible inventory, multiple staff, real reviews. |
| `easyToReach` | +2.0 | Phone + email + a name. Not just a Facebook handle. |
| `goodNicheFit` | +1.5 | Restaurant / HVAC / Law / Salon / Trades — Noah's sweet spot. |

Default if you omit the object entirely: all `false`. Score = 0.

A lead scoring **≥7 is "hot"** and gets the bright cyan score badge. **4–6
is warm.** **<4 is cold** (worth deprioritizing unless something else is
unique about them).

---

## Valid enum values (must match exactly — case-sensitive)

```
PIPELINE_STAGES: "Found" | "Researched" | "Emailed" | "Called" |
                 "Follow-up" | "Proposal" | "Won" | "Lost"

source values (free text, but pick from this list):
                 "Google Maps cold" | "Walk-in" | "Referral" |
                 "Inbound" | "Other"

niche values (free text, but pick from this list):
                 "Restaurant" | "HVAC" | "Law" | "Salon" |
                 "Trades" | "Retail" | "Other"
```

Wrong stage value (e.g., `"new"` instead of `"Found"`, or `"followup"`
instead of `"Follow-up"`) will be accepted by the API but render incorrectly
in the UI. Match exactly.

---

## Dedup behavior — important

The server deduplicates incoming leads automatically:

- **Within the imported batch:** if two leads in the same JSON have the
  same normalized `businessName + phone-digits`, the first occurrence wins
  and the rest are dropped.
- **Against existing DB (append mode):** if an incoming lead's key matches
  an existing lead already in the CRM, the incoming one is dropped (existing
  data is preserved).
- **Replace mode** (`?mode=replace`): full overwrite — only intra-batch dedup
  applies, and any existing leads are lost. **Use carefully.**

**Dedup key:** lowercased trimmed `businessName` + digits-only `phone`.
Examples:

| Lead A | Lead B | Same key? |
|---|---|---|
| `"El Rey Restaurant"` + `"(713) 555-1234"` | `"El Rey Restaurant"` + `"713-555-1234"` | YES (collapses to one) |
| `"El Rey Restaurant"` + `""` | `"El Rey Restaurant"` + `""` | YES |
| `"El Rey Restaurant"` + `""` | `"el rey restaurant "` + `""` | YES (case + whitespace normalized) |
| `"El Rey Restaurant"` + `"(713) 555-1234"` | `"El Rey Restaurant"` + `""` | No (one has a phone, one doesn't) |
| `"Joe's Pizza"` (Houston) + `""` | `"Joe's Pizza"` (Austin) + `""` | YES — false positive collision. Add a phone or distinguish the names. |

**Edge case to know about:** two genuinely different businesses sharing a
name AND lacking a phone will collide. Rare in practice. If it bites,
disambiguate by adding a phone, or postfix the name (e.g., `"Joe's Pizza —
Austin"`).

The response now returns:

```json
{ "count": 12, "added": 12, "skipped": 3, "leads": [ ... ] }
```

`count` is preserved as an alias for `added` for backward compat. `skipped`
tells you how many duplicates were dropped from the import.

---

## Three full examples ready to paste

### Example A — A single fresh prospect (the minimum)

```json
{
  "leads": [
    {
      "businessName": "Anthony Gushow & Sons Excavating"
    }
  ]
}
```

Server fills everything else. Lead enters the pipeline at `Found` with
score 0.

### Example B — Three Houston restaurants with real signal

```json
{
  "leads": [
    {
      "businessName": "El Rey Restaurant",
      "niche": "Restaurant",
      "neighborhood": "Midtown Houston",
      "phone": "(713) 555-0123",
      "email": "info@elreyhouston.example",
      "contactName": "Maria Garcia",
      "source": "Google Maps cold",
      "stage": "Found",
      "scoreFactors": {
        "badOrNoWebsite": true,
        "clearlyMakingMoney": true,
        "easyToReach": true,
        "goodNicheFit": true
      },
      "notes": "Lunch crowd is packed every weekday. Currently a Facebook page from 2018 and that's it.",
      "followUpAt": "2026-06-01",
      "nextActionNote": "Email this week — pitch site + Google listing"
    },
    {
      "businessName": "Bayou City BBQ",
      "niche": "Restaurant",
      "neighborhood": "Houston Heights",
      "phone": "(713) 555-0456",
      "email": "hello@bayoubbq.example",
      "contactName": "Trey Mitchell",
      "source": "Walk-in",
      "stage": "Researched",
      "scoreFactors": {
        "badOrNoWebsite": false,
        "clearlyMakingMoney": true,
        "easyToReach": true,
        "goodNicheFit": true
      },
      "notes": "Has a basic Squarespace site that's slow and not mobile-optimized. Owner is approachable.",
      "nextActionNote": "Drop in next Tuesday around lunch"
    },
    {
      "businessName": "Casa Verde Cantina",
      "niche": "Restaurant",
      "neighborhood": "Sugar Land",
      "phone": "(281) 555-0789",
      "email": "",
      "contactName": "",
      "source": "Google Maps cold",
      "stage": "Found",
      "scoreFactors": {
        "badOrNoWebsite": true,
        "clearlyMakingMoney": true,
        "easyToReach": false,
        "goodNicheFit": true
      },
      "notes": "No email visible anywhere. Yelp page is active. Will need a walk-in approach."
    }
  ]
}
```

### Example C — Mid-pipeline lead (existing prospect, partway through)

```json
{
  "leads": [
    {
      "businessName": "Reyes & Associates Law Office",
      "niche": "Law",
      "neighborhood": "Downtown Houston",
      "phone": "(713) 555-0234",
      "email": "info@reyesassociates.example",
      "contactName": "Daniel Reyes",
      "source": "Referral",
      "stage": "Proposal",
      "scoreFactors": {
        "badOrNoWebsite": true,
        "clearlyMakingMoney": true,
        "easyToReach": true,
        "goodNicheFit": true
      },
      "notes": "Referred by an existing client. Already had two calls. Sent proposal on 2026-05-20.",
      "followUpAt": "2026-05-30",
      "nextActionNote": "Follow up on proposal — call if no reply by Friday",
      "emailedAt": "2026-05-20T14:30:00.000Z",
      "calledAt": "2026-05-22T16:00:00.000Z",
      "touchCount": 2
    }
  ]
}
```

Note `emailedAt`/`calledAt`/`touchCount` are pre-set because this lead has
real history. For brand-new prospects, omit those.

---

## The import workflow (for the user)

1. Get the JSON object from your AI agent.
2. Copy it (or save to a `.json` file).
3. Sign in at https://nrgwebsites.com/admin/login.
4. Leads tab → **+ Import JSON** button (top-right of the page).
5. Paste the JSON or upload the file.
6. The button defaults to "append" mode — non-destructive. Existing leads
   stay; duplicates are skipped.
7. Confirm. The leads list updates immediately.

---

## Tips for the agent producing this JSON

- **Default to `stage: "Found"`** for newly researched prospects. Don't
  invent a stage just because you have a lot of notes — that field reflects
  Noah's outreach state, not the data you collected.
- **Be honest about score factors.** False optimism wastes Noah's time. If
  you don't know whether they're "clearly making money," set it to `false`
  rather than guessing yes.
- **Notes are the most valuable field.** A short paragraph about what makes
  this prospect interesting is worth more than ten near-empty leads. Specific
  observations beat generic statements.
- **Phone format doesn't matter to the dedup, but stay consistent for
  readability.** Pick `(713) 555-1234` and use it across the batch.
- **No more than ~50 leads per import.** Larger batches work but make the
  UI list noisy. Group by niche or geography if you have a lot.
- **Don't pre-fill `id`, `score`, `stageHistory`, `createdAt`, or
  `updatedAt`** unless you're explicitly migrating data with real history.
  Let the server stamp them.
- **`followUpAt` is the most important date field.** Setting it puts the
  lead on the top of Noah's Due Now banner. If you don't know when he
  should follow up, leave it `null`.

---

## What you should NOT produce

- Markdown commentary around the JSON. Just the JSON object.
- Trailing commas (JSON doesn't allow them).
- Comments (`//` or `/* */`) — JSON doesn't allow them.
- A bare array. Always wrap in `{ "leads": [ ... ] }`.
- Lowercase or alt-cased stage values like `"found"`, `"won"`, `"followup"`.
  Use the exact strings from the enum list.
- Made-up phone numbers or emails for real businesses. Either find the real
  contact info or leave the fields as empty strings.
- Pre-filled `score`. The server computes it from `scoreFactors`.

---

## Schema source

The authoritative type definition lives at
[`src/lib/admin/types.ts`](../src/lib/admin/types.ts) in this repo. The
import endpoint at
[`src/app/api/admin/leads/bulk/route.ts`](../src/app/api/admin/leads/bulk/route.ts)
accepts what this spec describes. Dedup logic is in
[`src/lib/admin/db.ts`](../src/lib/admin/db.ts) under `leadDedupKey` and
`bulkImportLeads`.

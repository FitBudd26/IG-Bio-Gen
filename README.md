# Instagram Bio Generator (FitBudd lead magnet)

A compact, embeddable React + TypeScript + Tailwind widget that generates 3
personalized Instagram bios for fitness professionals. Designed for a ~536×700px
embed container (blog post, landing page, or iframe).

## Run locally

```bash
npm install
npm run dev      # start dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Embedding

The build is a static site. Embed via iframe:

```html
<iframe src="https://your-host/" width="536" height="700" style="border:0"></iframe>
```

`index.html` already includes the `@iframe-resizer/child` script and
`data-iframe-resizer` on `#root`, so the iframe auto-sizes to content when the
parent page loads the iframe-resizer parent library.

## Optional: HubSpot lead capture

Leads are sent to HubSpot via the [Forms Submission API](https://developers.hubspot.com/docs/api/marketing/forms).
This endpoint only needs a **Portal ID** and **Form GUID** — both are non-secret,
so nothing sensitive is exposed in the client-side embed.

Copy `.env.example` to `.env` and set:

```
VITE_HUBSPOT_PORTAL_ID=...
VITE_HUBSPOT_FORM_GUID=...
```

If these are absent the app works normally — leads simply aren't stored.

### Where to find the IDs

- **Portal ID (Hub ID):** HubSpot account menu (top right) → it's shown under your
  account name, or in **Settings → Account Setup → Account Defaults**.
- **Form GUID:** **Marketing → Forms**, open (or create) a form, then copy the
  GUID from the share/embed code or the URL.

### Form fields to create

The form submits `email` and `firstname` (standard properties) plus these
**custom contact properties** — create them in HubSpot with matching internal
names and add them to the form:

| Internal name | Type |
| --- | --- |
| `business_type` | Single-line text / dropdown |
| `years_experience` | Single-line text |
| `location` | Single-line text |
| `specializations` | Single-line text (comma-separated) |
| `target_audience` | Single-line text / dropdown |
| `unique_selling_point` | Multi-line text |
| `tone_preference` | Single-line text / dropdown |
| `generation_count` | Number |

Any field not present on the form is simply ignored by HubSpot.

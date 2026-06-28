# Power BI - First Report Path

A simple, free learning path to help beginners build their first Power BI report.

Live site: https://power-bi-first-report-path.vercel.app

This project is not a course platform, does not sell content, and does not require registration. It organizes free public YouTube videos into a practical sequence for people starting from zero.

## What is included

- `index.html` - static responsive learning path page.
- `data/Training_PowerBI_First_Report.xlsx` - fictitious practice dataset.
- `docs/video-curation.csv` - source of truth for video recommendations and metadata.
- `docs/video-curation.md` - curation notes and validation summary.
- `tools/check-video-links.ps1` - local maintenance script for checking video links.

## How to use

Open `index.html` in a browser and choose a language tab:

- Portuguese
- Spanish
- English

Each language has the same 8-step path:

1. What is Power BI
2. Import data
3. Power Query basics
4. Relationships
5. Basic DAX
6. Basic visuals
7. Simple layout
8. Publish

## Practice dataset

Download the dataset from the page or open:

`data/Training_PowerBI_First_Report.xlsx`

The file is fictitious and non-confidential. It contains simple production data for practicing imports, relationships, measures, visuals, filters, and publishing.

## Maintaining video links

Run the local health check from PowerShell:

```powershell
.\tools\check-video-links.ps1
```

The script reads:

`docs/video-curation.csv`

And generates:

- `docs/link-health-report.html`
- `docs/link-health-report.csv`

Open the HTML report and look for rows marked as `broken`, `suspect`, or `to_validate`. Those are the best candidates to send to an AI assistant with a request like:

> Replace the broken or suspect videos in this Power BI learning path with free public YouTube videos in the same language and topic.

## Updating videos

Update `docs/video-curation.csv` first. Keep metadata honest:

- Use `to_validate` when views, likes, duration, channel, or publish year are not confirmed.
- Keep `is_primary=true` for the main recommendation shown on the page.
- Keep fallback videos as `is_primary=false`.

After updating the CSV, update the embedded video list in `index.html` so the public page matches the curation file.

## Publishing

This project can be published as static files in:

- GitHub Pages
- SharePoint
- Internal knowledge hubs
- Static file hosting
- Vercel

No backend, authentication, database, or paid platform is required.

## GitHub + Vercel

Recommended flow:

1. Keep the source files in GitHub.
2. Import the GitHub repository in Vercel.
3. Use the project root as the Vercel root directory.
4. Leave build command and output directory empty because this is a plain static site.

For manual deploys from this folder:

```powershell
vercel --prod
```

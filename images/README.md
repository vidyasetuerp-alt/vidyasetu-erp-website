# Image replacement guide

The official product logos are now included and displayed throughout the matching product cards and product pages. The site continues to use CSS screenshot placeholders so it never ships broken or misleading application imagery.

Add these production files when ready:

- `logo.png` — company logo, ideally transparent PNG.
- `vidyasetu-erp-logo.png` — official VidyaSetu ERP product logo (in use).
- `vidyasetu-sr-logo.png` — official VidyaSetu ERP Sr. product logo (in use).
- `erp-dashboard-placeholder.jpg` — actual VidyaSetu ERP dashboard screenshot.
- `sr-dashboard-placeholder.jpg` — actual VidyaSetu ERP Sr. dashboard screenshot.

After adding them, replace the matching `.placeholder` blocks in the HTML with accessible `<img>` elements. Never publish real student, employee or financial data in screenshots.

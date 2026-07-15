# VidyaSetu Tech website

Production-ready static website for `https://vidyasetuerptech.com`. It uses HTML5, CSS3 and vanilla JavaScript, requires no build step, database or paid API, and is designed for GitHub Pages.

## Website structure

- `index.html` — home page, product introduction and comparison.
- `products.html` — product chooser.
- `vidyasetu-erp.html` — VidyaSetu ERP v1.05 product page.
- `vidyasetu-sr-erp.html` — VidyaSetu ERP Sr. v1.01 product page.
- `pricing.html`, `downloads.html`, `about.html`, `contact.html` — supporting pages.
- `privacy-policy.html`, `terms.html`, `404.html` — policy and error pages.
- `css/style.css` — all site styling and responsive rules.
- `js/script.js` — shared navigation, footer, downloads, forms and configuration.
- `images/` — replaceable logos and screenshots.
- `assets/` — future public documents.
- `CNAME` — preserves the custom domain.
- `.nojekyll` — tells GitHub Pages to serve the static files directly.
- `robots.txt` and `sitemap.xml` — search engine discovery.

## Preview locally

The simplest preview is to open `index.html` in a browser. For a more accurate local web server, run one of these from the repository folder:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`. No package installation is required.

## Upload to GitHub

1. Create or open the GitHub repository that will host the website.
2. Commit every file in this folder, including `.nojekyll` and `CNAME`.
3. Push the files to the repository's default branch, normally `main`.
4. Do not upload Windows installers directly to the website repository; attach them to GitHub Releases.

## Enable GitHub Pages

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select the default branch and the `/ (root)` folder, then save.
4. Wait for GitHub Pages to publish the site.

The site uses relative internal links, so it can be tested under a GitHub repository path as well as the custom domain. Canonical and sitemap URLs intentionally point to the public custom domain.

## Connect `vidyasetuerptech.com`

1. Keep the `CNAME` file at the repository root. Its only content must remain `vidyasetuerptech.com`.
2. In GitHub Pages settings, enter `vidyasetuerptech.com` as the custom domain.
3. At the domain registrar or DNS provider, add the records currently documented by GitHub for an apex domain. Verify the current GitHub Pages IP addresses in GitHub's official documentation before changing DNS.
4. After DNS validation, enable **Enforce HTTPS** in GitHub Pages settings.

Never delete, rename or add extra lines to `CNAME` while the custom domain is in use. DNS changes can take time to propagate.

## Update versions and download links

All installer URLs are centralized at the top of `js/script.js`:

```javascript
const PRODUCT_LINKS = {
  vidyasetuErp: "https://github.com/vidyasetuerp-alt/vidyasetu-erp-website/releases/download/v1.05/VidyaSetuERP_Setup_v1.05.exe",
  vidyasetuSrErp: "https://github.com/vidyasetuerp-alt/vidyasetu-erp-website/releases/download/v1.01/VidyaSetuERPSr_Setup_v1.01.exe",
  allReleases: "https://github.com/vidyasetuerp-alt/vidyasetu-erp-website/releases"
};
```

Both current installer URLs are active. When publishing a newer version, replace its exact release-asset URL in `PRODUCT_LINKS`, then search the HTML files for the old visible version number and update page titles, badges, button labels, descriptions, release notes and SoftwareApplication structured data together.

## Create a GitHub Release

1. Build and verify the installer outside this website repository.
2. In the repository, open **Releases → Draft a new release**.
3. Create a version tag such as `v1.06` or the correct ERP Sr. tag.
4. Add clear release notes, compatibility notes and upgrade/backup guidance.
5. Attach the correct installer with an unambiguous product and version filename.
6. Publish the release, copy the release asset URL, and update `PRODUCT_LINKS`.
7. Test the website's download confirmation modal and the final download.

## Edit contact details

Update `CONTACT_CONFIG` at the top of `js/script.js`:

```javascript
const CONTACT_CONFIG = {
  whatsappNumber: "913678260401",
  phoneNumber: "+918638663327",
  phoneDisplay: "+918638663327",
  salesEmail: "info@vidyasetuerptech.com",
  supportEmail: "vidyasetu.erp@gmail.com"
};
```

Keep the WhatsApp number in international format without spaces or a `+`. Keep the callable number in international format with a leading `+`. The contact page and shared footer read these values from the central configuration. The business-location placeholder remains intentionally unpublished until a real location is supplied.

## Edit pricing

Pricing is plain text in `pricing.html` and has separate capacity schedules for both products. VidyaSetu ERP uses Basic (up to 200), Standard (up to 500), Premium (up to 1,000), and Enterprise (unlimited). VidyaSetu ERP Sr. uses Basic (up to 300), Standard (up to 600), Premium (up to 1,200), and Enterprise (unlimited). Update standard prices, introductory prices, per-day comparisons, and student limits together. Never copy prices between products automatically, and keep the tax and final-quotation notes visible.

## Replace logos and screenshots

See `images/README.md` for target filenames. Use optimized WebP, JPG or PNG images and descriptive `alt` text. Remove or obscure student names, phone numbers, photographs, fee records and other sensitive information before publishing. Replace the CSS placeholder blocks only after the real images exist, so the site never contains broken images.

## Confirm residential features

The ERP Sr. page intentionally marks residential modules as **Confirm availability** and contains this developer comment:

```html
<!-- Remove or edit any residential feature that is not currently available in VidyaSetu Sr. ERP. -->
```

Confirm each module with the product team before removing those labels. Do not present possible mess, hostel staff or health modules as implemented without verification.

## Test before publishing

Check every page and navigation link at desktop, tablet and mobile widths. In browser developer tools, test at approximately 375 px, 768 px and 1440 px. Verify:

- Mobile navigation opens and all links work.
- Product comparison filters display correctly.
- Both download confirmation flows identify the correct product and version.
- ERP Sr. remains disabled while its placeholder link is present.
- The enquiry form validates required fields and creates a readable WhatsApp or email message.
- FAQ, copy-email and back-to-top controls work with keyboard and pointer input.
- No horizontal scrolling appears on small screens.
- Both the GitHub Pages repository URL and `https://vidyasetuerptech.com` serve CSS and JavaScript correctly.
- `CNAME`, privacy policy, terms, sitemap and robots file remain available.

The privacy policy and terms are careful starter documents, not legal advice. Review them against actual business and data-handling practices before launch.

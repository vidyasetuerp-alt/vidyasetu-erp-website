# VidyaSetu Tech Website

Static responsive website for VidyaSetu Tech and VidyaSetu ERP.

## Project Structure

```text
/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
├── images/
│   ├── favicon.svg
│   ├── vidyasetu-logo.png
│   ├── vidyasetu-logo-horizontal.png
│   ├── vidyasetu-erp-hero.png
│   └── screenshot and logo assets
├── downloads/
│   └── VidyaSetuERP_Setup_v1.03.exe
└── README.md
```

## Run Locally

Open `index.html` directly in a browser, or serve the folder with any static server.

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Deploy Free on GitHub Pages

1. Create a new GitHub repository.
2. Upload all files from this folder to the repository root.
3. Go to repository `Settings`.
4. Open `Pages`.
5. Under `Build and deployment`, choose `Deploy from a branch`.
6. Select the `main` branch and `/root` folder.
7. Save and wait for GitHub Pages to publish the website.

Your site will be available at:

```text
https://your-username.github.io/your-repository-name/
```

## Deploy Free on Netlify

1. Go to [Netlify](https://www.netlify.com/).
2. Sign in and choose `Add new site`.
3. Select `Deploy manually`, then drag and drop this project folder.
4. Netlify will publish the static website automatically.

You can also connect a GitHub repository:

1. Choose `Import an existing project`.
2. Select your GitHub repository.
3. Leave build command empty.
4. Set publish directory to `/`.
5. Deploy.

## Customization

- Current contact email is `info@vidyasetuerptech.com`.
- Current support email is `support@vidyasetuerptech.com`.
- Current mobile number is `+91 8638663327`.
- WhatsApp contact is enabled through the floating button and contact card.
- Replace `images/vidyasetu-logo.png` if you want to update the brand logo.
- Replace placeholder screenshot SVG files in `images/` with real product screenshots when available.
- The website download button points directly to the installer release asset: `https://github.com/vidyasetuerp-alt/vidyasetu-erp-website/releases/download/v1.0.0/VidyaSetuERP_Setup_v1.03.exe`.
- The download counter is hidden from public visitors. Open `index.html?admin=1#download` to view the admin-only local counter.
- The admin download counter is stored in each browser with `localStorage`; a real global admin count requires a backend or analytics service.
- Demo request submissions are saved in the browser with `localStorage`. Open `index.html?admin=1#admin-leads` to view, export, or clear saved leads on that device.
- App feedback submissions are saved in the browser with `localStorage`. Open `index.html?admin=1#admin-feedback` to view, export XLSX/CSV, or clear saved feedback on that device.
- For live public lead capture from all visitors, connect the form to a backend, Google Forms, Netlify Forms, Firebase, or Supabase.
- When uploading to GitHub Pages, keep installer files under 100 MB or use GitHub Releases for larger installers.
- Update social media links in the footer.

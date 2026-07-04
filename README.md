# VidyaSetu Tech Website

Responsive website for VidyaSetu Tech and VidyaSetu ERP.

The school activation account and admin activation key workflow now use a small backend database server. Run the site with `py server.py` when you need school login, machine ID submission, admin activation key entry, and school activation-key display to work across browsers.

## Project Structure

```text
/
|-- index.html
|-- school-login.html
|-- school-dashboard.html
|-- admin.html
|-- app_server.py
|-- server.py
|-- css/
|   |-- styles.css
|   `-- admin.css
|-- js/
|   |-- main.js
|   `-- admin.js
|-- images/
|   |-- favicon.svg
|   |-- vidyasetu-logo.png
|   |-- vidyasetu-logo-horizontal.png
|   `-- vidyasetu-erp-hero.png
|-- database/
|   `-- .gitkeep
`-- README.md
```

## Run Locally

For the full database-backed site, run:

```bash
py server.py
```

Then open:

```text
http://127.0.0.1:5187
```

The server stores activation accounts in:

```text
database/vidyasetu-db.json
```

Optional activation-key email sending can be enabled with SMTP environment variables before running the server:

```powershell
$env:VIDYASETU_SMTP_HOST="smtp.example.com"
$env:VIDYASETU_SMTP_PORT="587"
$env:VIDYASETU_SMTP_FROM="support@vidyasetuerptech.com"
$env:VIDYASETU_SMTP_USER="your-smtp-user"
$env:VIDYASETU_SMTP_PASSWORD="your-smtp-password"
py server.py
```

If SMTP is not configured, activation keys are still saved and visible through the school login, but no email is sent.

You can still open `index.html` directly in a browser, or serve the folder with any static server, but the school/admin activation database will not be shared in that mode.

For static-only preview:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Deploy Free on GitHub Pages

GitHub Pages can host the public static website only. It cannot run `server.py`, so the school login, database-backed machine ID submission, and admin activation key workflow need a separate Python backend host.

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

For full activation workflow hosting, deploy this repository to a Python-capable host such as Render, Railway, PythonAnywhere, or a VPS, and run `py server.py` / `python server.py`.

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
- The website download button points directly to the installer release asset: `https://github.com/vidyasetuerp-alt/vidyasetu-erp-website/releases/download/v1.05/VidyaSetuERP_Setup_v1.05.exe`.
- The admin page is `admin.html` and uses the password configured in `app_server.py`.
- The download counter is stored in the backend JSON database when the site is run with `py server.py`, so the admin count is shared across machines. If the site is opened as static files, it falls back to browser `localStorage`.
- Demo request submissions are saved in the browser with `localStorage` and can be viewed/exported from `admin.html`.
- App feedback submissions are saved in the browser with `localStorage` and can be viewed/exported from `admin.html`.
- After-sales feedback submissions are saved separately in the browser with `localStorage` and published as after-sales feedback cards on the site after submission.
- For live public lead capture from all visitors, connect the form to a backend, Google Forms, Netlify Forms, Firebase, or Supabase.
- When uploading to GitHub Pages, keep installer files under 100 MB or use GitHub Releases for larger installers.
- Update social media links in the footer.


# Arive Dynamic Document Generator

A browser-based, wizard-style Single Page Application (SPA) for creating dynamic, personalized documents for use with the Arive LOS. This tool empowers non-technical users to build, style, and generate self-contained HTML files that can be hosted anywhere and populated with data via URL parameters.

The entire application runs client-side, and all project data is stored in the user's local browser storage, ensuring complete data privacy.

---

## Live Application

### [**> Click Here to Use the Document Generator <**](https://your-github-username.github.io/your-repository-name/)

*(Replace the link above with your actual GitHub Pages URL after deployment)*

---

## Features

-   **Wizard-Style Interface:** A simple, multi-step process guides the user from content creation to final URL generation.
-   **Dual Rich Text Editors:** Utilizes **TinyMCE** for separate editing of the "Main Document" and a reusable "Footer/Call-to-Action" section.
-   **Dynamic Merge Tags:** Easily insert Arive merge tags with an a searchable modal.
-   **Live Preview:** See a real-time, pixel-perfect preview of the final document before generating the file.
-   **Full Customization:** Configure the document's browser title, PDF filename (with merge tags), and a custom favicon.
-   **Single-File Generation:** Compiles all content, styles, and logic into a single, portable `.html` file.
-   **Secure Data Handling:** The generated page uses JavaScript to parse data from URL parameters, render it, and then immediately remove the parameters from the visible address bar.
-   **PDF Export:** The final, hosted document includes a "Download as PDF" button, powered by **html2pdf.js**.
-   **Full Project Management:**
    -   **Auto-Save:** Automatically saves your current work to `localStorage`.
    -   **Named Projects:** Save multiple distinct projects in the browser.
    -   **Load & Delete:** Easily load, manage, and delete previous projects.
    -   **HTML Import:** Recover a project's content by importing a previously generated HTML file.

---

## How to Use the Generator

1.  **Content Creation:** Use the rich text editors to design the main body and footer of your document. Use the "Add Merge Tag" button or type `{{` to insert dynamic placeholders.
2.  **Configuration:** Go to the "Settings" step to define the page title, the name for the generated PDF, and upload a favicon.
3.  **Preview:** Review your document to ensure it looks exactly as intended.
4.  **Generate & Host:**
    -   Click the "Generate HTML File" button to download the document.
    -   Drag and drop this file onto a free hosting service like [Netlify Drop](https://drop.netlify.com/) or [Cloudflare Pages](https://pages.cloudflare.com/).
    -   Copy the live URL provided by the hosting service.
5.  **Finalize:**
    -   Paste the hosted URL back into the "Finalize" step of the wizard.
    -   The tool will automatically compose the final, Arive-ready link with all merge tags included as URL parameters.
    -   Copy this link and use it in your Arive email templates.

---

## For Developers (Forking & Modifying)

If you wish to fork this repository and run the code on your own machine for development, you must serve it from a local web server (e.g., using the **Live Server** extension in VS Code). Opening `index.html` directly as a file will not work.

The TinyMCE API key included in this project is configured to work on the original GitHub Pages domain. If you fork and host this tool on a different URL, you will need to:
1.  Create a free account on [Tiny.cloud](https://www.tiny.cloud/).
2.  Add your new domain to the "Approved Domains" list for your API key.
3.  Replace the API key in `index.html` with your own.

---

## Tech Stack

-   **Core:** HTML5, CSS3, JavaScript (ES6+)
-   **CSS Framework:** [Bulma.css](https://bulma.io/)
-   **Rich Text Editor:** [TinyMCE](https://www.tiny.cloud/)
-   **PDF Generation:** [html2pdf.js](https://github.com/eKoopmans/html2pdf.js)
-   **Autocomplete:** [Tribute.js](https://github.com/zurb/tribute)

---

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.

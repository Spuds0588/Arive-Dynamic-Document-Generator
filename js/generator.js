// HTML Generation Logic

function getDocumentHtml() {
    const { mainContent, footerContent, title, pdfFilename, faviconBase64 } = appState;

    const footerHtml = footerContent ? `
        <footer id="footer-content" class="footer-container content no-print">
            ${footerContent}
        </footer>
    ` : '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Generated Document'}</title>
    ${faviconBase64 ? `<link rel="icon" href="${faviconBase64}">` : ''}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
    <style>
        * { box-sizing: border-box; }
        body {
            background-color: #F0F2F5;
            padding: 2rem;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
        }
        .main-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
        }
        .page {
            background: white;
            width: 8.5in;
            min-height: 11in;
            padding: 1in;
            box-shadow: 0 0 0.5cm rgba(0,0,0,0.5);
        }
        /* New: Styling for the footer card */
        .footer-container {
             background: white;
             box-shadow: 0 0 0.5cm rgba(0,0,0,0.5);
             border-radius: 8px;
             max-width: 8.5in;
             width: 100%;
             padding: 1.5rem;
        }
        table {
            table-layout: fixed;
            width: 100%;
            word-wrap: break-word;
        }
        @media print {
            body {
                background-color: white;
                padding: 0;
            }
            .no-print {
                display: none;
            }
            .page {
                box-shadow: none;
                margin: 0;
                width: auto;
                height: auto;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="main-container">
        <button id="download-pdf" class="button is-primary no-print">Download as PDF</button>
        <div id="document-page" class="page">
            <div id="main-content" class="content">${mainContent}</div>
        </div>
        ${footerHtml}
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const params = new URLSearchParams(window.location.search);
            const data = Object.fromEntries(params.entries());

            function renderContent(elementId) {
                const element = document.getElementById(elementId);
                if (element) {
                    let content = element.innerHTML;
                    for (const key in data) {
                        const regex = new RegExp('{{' + key.replace(/\\./g, '\\\\.') + '}}', 'g');
                        content = content.replace(regex, data[key]);
                    }
                    element.innerHTML = content;
                }
            }

            renderContent('main-content');
            if (document.getElementById('footer-content')) {
                renderContent('footer-content');
            }

            if (history.replaceState) {
                history.replaceState(null, '', window.location.pathname);
            }

            document.getElementById('download-pdf').addEventListener('click', () => {
                const element = document.getElementById('document-page'); 
                let filename = "${pdfFilename || 'document'}";
                const filenameTags = filename.match(/{{\\s*([^}\\s]+)\\s*}}/g) || [];
                filenameTags.forEach(tag => {
                    const key = tag.replace(/{|}/g, '').trim();
                    if (data[key]) {
                        filename = filename.replace(tag, data[key]);
                    }
                });

                const opt = {
                    margin: 0,
                    filename: filename.endsWith('.pdf') ? filename : filename + '.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                };
                html2pdf().from(element).set(opt).save();
            });
        });
    <\/script>
</body>
</html>`;
}

function generatePreview() {
    const iframe = document.getElementById('preview-iframe');
    const htmlContent = getDocumentHtml();
    iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
}

function generateAndDownloadHtml() {
    const htmlContent = getDocumentHtml();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'generated-document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function composeFinalUrl() {
    const hostedUrl = document.getElementById('hosted-url').value;
    if (!hostedUrl) {
        document.getElementById('final-link').value = '';
        return;
    }

    const allContent = appState.mainContent + appState.footerContent + appState.pdfFilename;
    const mergeTags = [...new Set(allContent.match(/{{(.*?)}}/g) || [])];
    
    if (mergeTags.length === 0) {
        document.getElementById('final-link').value = hostedUrl;
        return;
    }

    const params = new URLSearchParams();
    mergeTags.forEach(tag => {
        const key = tag.replace(/{{|}}/g, '').trim();
        params.append(key, tag);
    });
    
    const decodedParams = decodeURIComponent(params.toString());

    try {
        const url = new URL(hostedUrl);
        url.search = decodedParams;
        document.getElementById('final-link').value = url.toString();
    } catch(e) {
        document.getElementById('final-link').value = `${hostedUrl}?${decodedParams}`;
    }
}
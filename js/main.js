// Global App State
let appState = {
    mainContent: '',
    footerContent: '',
    title: '',
    pdfFilename: '',
    faviconBase64: '',
    tags: [],
    activeStep: 1
};

let activeEditor;

document.addEventListener('DOMContentLoaded', () => {
    // Check if ARIVE_TAGS is loaded and initialize
    if (typeof ARIVE_TAGS !== 'undefined') {
        appState.tags = ARIVE_TAGS;
        initializeTribute(appState.tags);
        populateMergeTagModal(appState.tags);
    } else {
        console.error("ARIVE_TAGS not loaded.");
    }

    // Initialize Editors and load last state
    initializeEditors().then(() => {
        loadCurrentState();
    });

    // Event Listeners for settings
    document.getElementById('document-title').addEventListener('input', (e) => { appState.title = e.target.value; saveCurrentState(); });
    document.getElementById('pdf-filename').addEventListener('input', (e) => { appState.pdfFilename = e.target.value; saveCurrentState(); });
    document.getElementById('favicon-input').addEventListener('change', handleFaviconUpload);
    document.getElementById('generate-html').addEventListener('click', generateAndDownloadHtml);
    document.getElementById('hosted-url').addEventListener('input', composeFinalUrl);
    document.getElementById('import-html-input').addEventListener('change', handleHtmlImport);

    // Event listeners for Add Merge Tag buttons
    document.getElementById('add-merge-tag-main').addEventListener('click', () => { activeEditor = tinymce.get('editor-main'); openModal('merge-tag-modal'); });
    document.getElementById('add-merge-tag-footer').addEventListener('click', () => { activeEditor = tinymce.get('editor-footer'); openModal('merge-tag-modal'); });

    // Search for merge tags
    document.getElementById('merge-tag-search').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredTags = appState.tags.filter(tag => tag.label.toLowerCase().includes(searchTerm));
        populateMergeTagModal(filteredTags);
    });
});

async function initializeEditors() {
    const editorConfig = (id) => ({
        selector: `#${id}`,
        height: 500,
        menubar: false,
        plugins: 'table lists link image code autoresize',
        toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image | table | code',
        setup: (editor) => {
            editor.on('change', () => {
                const content = editor.getContent();
                if (editor.id === 'editor-main') appState.mainContent = content;
                else if (editor.id === 'editor-footer') appState.footerContent = content;
                saveCurrentState();
            });
            editor.on('focus', () => { activeEditor = editor; });
        }
    });
    // Use Promise.all to wait for both editors to initialize
    await Promise.all([
        tinymce.init(editorConfig('editor-main')),
        tinymce.init(editorConfig('editor-footer'))
    ]);
}

function initializeTribute(tags) {
    const tribute = new Tribute({
        values: tags.map(tag => ({ key: tag.label, value: tag.tagString })),
        trigger: '{{',
        selectTemplate: (item) => item.original.value,
        menuContainer: document.body,
        allowSpaces: true,
    });
    setTimeout(() => {
        try {
            tribute.attach(document.querySelector('#editor-main_ifr').contentDocument.body);
            tribute.attach(document.querySelector('#editor-footer_ifr').contentDocument.body);
        } catch (e) { console.error("Tribute.js attach error:", e); }
    }, 1500);
}

function handleFaviconUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            appState.faviconBase64 = e.target.result;
            saveCurrentState();
        };
        reader.readAsDataURL(file);
    }
}

// --- LOCAL STORAGE & PROJECT MANAGEMENT ---

function saveCurrentState() {
    localStorage.setItem('ariveApp_currentState', JSON.stringify(appState));
}

function loadCurrentState() {
    const savedState = localStorage.getItem('ariveApp_currentState');
    if (savedState) {
        appState = JSON.parse(savedState);
        repopulateUIFromState();
        console.log("Loaded previous session.");
    }
}

function repopulateUIFromState() {
    tinymce.get('editor-main').setContent(appState.mainContent || '');
    tinymce.get('editor-footer').setContent(appState.footerContent || '');
    document.getElementById('document-title').value = appState.title || '';
    document.getElementById('pdf-filename').value = appState.pdfFilename || '';
    // Favicon cannot be repopulated due to security restrictions on file inputs
    goToStep(appState.activeStep || 1);
}

// --- HTML IMPORT FUNCTIONALITY ---
function handleHtmlImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const htmlText = e.target.result;
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        const mainContent = doc.getElementById('main-content')?.innerHTML || '';
        const footerContent = doc.getElementById('footer-content')?.innerHTML || '';
        const title = doc.querySelector('title')?.innerText || '';

        appState.mainContent = mainContent;
        appState.footerContent = footerContent;
        appState.title = title;
        appState.pdfFilename = ''; // Cannot be recovered
        appState.faviconBase64 = ''; // Cannot be recovered

        repopulateUIFromState();
        alert('Project content imported successfully! Please review the Page Settings, as some metadata like PDF filename could not be recovered.');
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
}
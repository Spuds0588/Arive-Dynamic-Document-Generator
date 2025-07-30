function goToStep(stepNumber) {
    document.querySelectorAll('.wizard-step').forEach(step => {
        step.classList.remove('is-active');
    });
    document.getElementById(`step-${stepNumber}`).classList.add('is-active');
    appState.activeStep = stepNumber; // Save the current step
    saveCurrentState(); // Persist the step change
}

function switchTab(tabNumber) {
    document.querySelectorAll('.tabs li').forEach(tab => tab.classList.remove('is-active'));
    document.querySelector(`[data-tab='${tabNumber}']`).classList.add('is-active');

    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('is-active'));
    document.getElementById(`tab-content-${tabNumber}`).classList.add('is-active');
}

document.querySelectorAll('.tabs [data-tab]').forEach(tabElement => {
    tabElement.addEventListener('click', () => switchTab(tabElement.getAttribute('data-tab')));
});

function openModal(modalId) {
    document.getElementById(modalId).classList.add('is-active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('is-active');
}

function showImageHelp() {
    openModal('image-help-modal');
}

function populateMergeTagModal(tags) {
    const list = document.getElementById('merge-tag-list');
    list.innerHTML = '';
    tags.forEach(tag => {
        const item = document.createElement('div');
        item.className = 'merge-tag-item';
        item.textContent = `${tag.label} - ${tag.tagString}`;
        item.onclick = () => {
            if (activeEditor) {
                activeEditor.insertContent(tag.tagString);
            }
            closeModal('merge-tag-modal');
        };
        list.appendChild(item);
    });
}

function copyFinalLink() {
    const finalLink = document.getElementById('final-link');
    finalLink.select();
    document.execCommand('copy');
    alert('Link copied to clipboard!');
}


// --- PROJECT MANAGEMENT UI FUNCTIONS ---

function getSavedProjects() {
    return JSON.parse(localStorage.getItem('ariveApp_savedProjects') || '[]');
}

function saveProjects(projects) {
    localStorage.setItem('ariveApp_savedProjects', JSON.stringify(projects));
}

function saveNamedProject() {
    const projectNameInput = document.getElementById('project-name-input');
    const projectName = projectNameInput.value.trim();
    if (!projectName) {
        alert('Please enter a project name.');
        return;
    }

    const projects = getSavedProjects();
    const newProject = {
        name: projectName,
        timestamp: new Date().toISOString(),
        state: { ...appState }
    };

    // Check if project with same name exists and ask to overwrite
    const existingIndex = projects.findIndex(p => p.name === projectName);
    if (existingIndex > -1) {
        if (confirm(`A project named "${projectName}" already exists. Do you want to overwrite it?`)) {
            projects[existingIndex] = newProject;
        } else {
            return;
        }
    } else {
        projects.push(newProject);
    }

    saveProjects(projects);
    projectNameInput.value = '';
    loadProjectsIntoModal(); // Refresh the list
}

function loadProjectsIntoModal() {
    const projects = getSavedProjects();
    const listContainer = document.getElementById('saved-projects-list');
    listContainer.innerHTML = '';

    if (projects.length === 0) {
        listContainer.innerHTML = '<p>No saved projects found.</p>';
        return;
    }

    projects.forEach((project, index) => {
        const projectElement = document.createElement('div');
        projectElement.className = 'level';
        projectElement.innerHTML = `
            <div class="level-left">
                <div class="level-item">
                    <div>
                        <p class="is-size-6 has-text-weight-bold">${project.name}</p>
                        <p class="is-size-7 has-text-grey">Saved: ${new Date(project.timestamp).toLocaleString()}</p>
                    </div>
                </div>
            </div>
            <div class="level-right">
                <div class="level-item">
                    <div class="buttons">
                        <button class="button is-small is-link" onclick="loadProject(${index})">Load</button>
                        <button class="button is-small is-danger is-light" onclick="deleteProject(${index})">Delete</button>
                    </div>
                </div>
            </div>
        `;
        listContainer.appendChild(projectElement);
    });
}

function loadProject(index) {
    const projects = getSavedProjects();
    if (projects[index]) {
        appState = projects[index].state;
        repopulateUIFromState();
        closeModal('projects-modal');
        alert(`Project "${projects[index].name}" loaded successfully.`);
    }
}

function deleteProject(index) {
    if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
        const projects = getSavedProjects();
        projects.splice(index, 1);
        saveProjects(projects);
        loadProjectsIntoModal();
    }
}
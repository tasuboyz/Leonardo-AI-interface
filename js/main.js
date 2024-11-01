const API_BASE_URL = "https://cloud.leonardo.ai/api/rest/v1";

// Fetch models on page load
async function fetchModels() {
    try {
        const response = await fetch(`${API_BASE_URL}/platformModels`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('apiToken')}`
            }
        });
        const data = await response.json();
        populateModelSelect(data);
    } catch (error) {
        console.error('Error fetching models:', error);
    }
}

function populateModelSelect(data) {
    const modelContainer = document.querySelector('.model-select-container');
    modelContainer.innerHTML = ''; // Clear existing content
    
    data.custom_models?.forEach(model => {
        const modelOption = document.createElement('div');
        modelOption.className = 'model-option';
        modelOption.setAttribute('data-model-id', model.id);
        
        const thumbnailUrl = model.generated_image?.url || '';
        
        modelOption.innerHTML = `
            ${thumbnailUrl ? 
                `<img src="${thumbnailUrl}" alt="Model thumbnail" class="model-thumbnail">` :
                `<div class="no-thumbnail">No Image</div>`
            }
            <div class="model-info">
                <div class="model-title">${model.name}</div>
                <div class="model-id">ID: ${model.id}</div>
                <div class="model-description">${model.description || 'No description available'}</div>
            </div>
        `;
        
        modelOption.addEventListener('click', () => {
            document.querySelectorAll('.model-option').forEach(opt => opt.classList.remove('selected'));
            modelOption.classList.add('selected');
            selectModel(model.id);
        });
        
        modelContainer.appendChild(modelOption);
    });
}



function generateImage() {
    const prompt = document.getElementById('prompt');
    const modelDisplay = document.getElementById('modelDisplay');
    const selectedModelId = localStorage.getItem('selectedModelId');
    
    // Reset error states
    prompt.classList.remove('input-error');
    modelDisplay.classList.remove('input-error');
    
    // Validate fields
    let hasError = false;
    
    if (!prompt.value.trim()) {
        prompt.classList.add('input-error');
        hasError = true;
    }
    
    if (!modelDisplay.value.trim() || !selectedModelId) {
        modelDisplay.classList.add('input-error');
        hasError = true;
    }
    
    if (hasError) {
        alert('Please fill in all required fields marked with *');
        return;
    }
    
    const parameters = {
        prompt: prompt.value,
        elements: selectedElements,
        modelId: selectedModelId,
        preset: document.getElementById('preset').value,
        size: document.getElementById('size').value,
        alchemy: document.getElementById('alchemyToggle').checked,
        photoReal: document.getElementById('photoRealToggle').checked
    };
    alert(JSON.stringify(parameters, null, 2))
    Telegram.WebApp.sendData(JSON.stringify(parameters, null, 2));
    document.getElementById('resultJson').textContent = JSON.stringify(parameters, null, 2);
    document.getElementById('resultModal').style.display = 'block';
}

function openSettings() {
    const modal = document.getElementById('settingsModal');
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
    document.getElementById('apiToken').value = localStorage.getItem('apiToken') || '';
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

function closeResult() {
    document.getElementById('resultModal').style.display = 'none';
}

function saveSettings() {
    const token = document.getElementById('apiToken').value;
    localStorage.setItem('apiToken', token);
    closeSettings();
    fetchModels(); // Refresh models with new token
}

function filterModels() {
    const filterText = document.getElementById('modelFilter').value.toLowerCase();
    const photoRealEnabled = document.getElementById('photoRealToggle').checked;
    const modelOptions = document.querySelectorAll('.model-option');
    
    modelOptions.forEach(option => {
        if (option.classList.contains('hidden') && photoRealEnabled) {
            return; // Skip if hidden by photo real filter
        }
        
        const title = option.querySelector('.model-title').textContent.toLowerCase();
        const id = option.querySelector('.model-id').textContent.toLowerCase();
        const description = option.querySelector('.model-description').textContent.toLowerCase();
        
        if (title.includes(filterText) || id.includes(filterText) || description.includes(filterText)) {
            option.classList.remove('hidden');
        } else {
            option.classList.add('hidden');
        }
    });
}

function filterPhotoRealModels() {
    const photoRealEnabled = document.getElementById('photoRealToggle').checked;
    const modelOptions = document.querySelectorAll('.model-option');
    
    modelOptions.forEach(option => {
        const title = option.querySelector('.model-title').textContent;
        const photoRealModels = [
            "Leonardo Kino XL",
            "Leonardo Vision XL", 
            "Leonardo Diffusion XL"
        ];
        
        if (photoRealEnabled) {
            if (photoRealModels.includes(title)) {
                option.classList.remove('hidden');
            } else {
                option.classList.add('hidden');
            }
        } else {
            option.classList.remove('hidden');
        }
    });
    
    // Also apply text filter if there's any
    const filterText = document.getElementById('modelFilter').value;
    if (filterText) {
        filterModels();
    }
}

function selectModel(modelId) {
    localStorage.setItem('selectedModelId', modelId);
    
    // Update visual feedback
    document.querySelectorAll('.model-option').forEach(option => {
        if (option.getAttribute('data-model-id') === modelId) {
            option.classList.add('selected');
            option.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            option.classList.remove('selected');
        }
    });
}

function openModels() {
    const modal = document.getElementById('modelModal');
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
    const container = document.querySelector('.model-select-container');
    container.classList.add('loading');
    fetchModels().finally(() => container.classList.remove('loading'));
}

function closeModels() {
    const modal = document.getElementById('modelModal');
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

function confirmModelSelection() {
    const selectedModelId = localStorage.getItem('selectedModelId');
    const selectedModel = document.querySelector(`.model-option[data-model-id="${selectedModelId}"]`);
    if (selectedModel) {
        const modelName = selectedModel.querySelector('.model-title').textContent;
        document.getElementById('modelDisplay').value = modelName;
        
        // Clear existing element selections when model changes
        selectedElements = [];
        document.getElementById('element').value = '';
        
        // Refresh elements list with new filter
        if (document.getElementById('elementsModal').style.display === 'block') {
            fetchElements();
        }
    }
    closeModels();
}

// Special models that require filtered elements
const SPECIAL_MODELS = [
    'Anime Pastel Dream',
    'DreamSharper v7', 
    'Absolute Reality v1.6',
    '3D Animation Style',
    'Stable Diffusion 1.5',
    'Stable Diffusion 2.1',
    'Leonardo Phoenix'
];

// Elements handling
let selectedElements = [];

async function fetchElements() {
    try {
        const token = localStorage.getItem('apiToken');
        const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/elements', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        let elements = data.loras;
        
        if (!Array.isArray(elements)) {
            throw new Error('Invalid data format received from API');
        }

        // Get currently selected model name
        const selectedModelName = document.getElementById('modelDisplay').value;
        
        // For Leonardo Phoenix, return empty array
        if (selectedModelName === 'Leonardo Phoenix') {
            elements = [];
        } else if (SPECIAL_MODELS.includes(selectedModelName)) {
            // For special models, show only konyconi elements
            elements = elements.filter(element => element.creatorName === 'konyconi');
        } else {
            // For all other models, show only Leonardo elements
            elements = elements.filter(element => element.creatorName.toLowerCase().includes('leonardo'));
        }
        
        displayElements(elements);
        
        // Show message if no elements available
        const container = document.querySelector('.elements-container');
        if (elements.length === 0) {
            container.innerHTML = '<div class="no-elements" style="padding: 20px; text-align: center;">No elements available for this model</div>';
        }
    } catch (error) {
        console.error('Error fetching elements:', error);
    }
}

function displayElements(elements) {
    const container = document.querySelector('.elements-container');
    container.innerHTML = '';
    
    elements.forEach(element => {
        const elementDiv = document.createElement('div');
        elementDiv.className = 'element-option';
        elementDiv.setAttribute('data-element-id', element.akUUID);
        
        if (selectedElements.includes(element.akUUID)) {
            elementDiv.classList.add('selected');
        }
        
        elementDiv.innerHTML = `
            ${element.urlImage ? 
                `<img src="${element.urlImage}" alt="Element thumbnail" class="element-thumbnail">` :
                `<div class="no-thumbnail">No Image</div>`
            }
            <div class="element-info">
                <div class="element-title">${element.name}</div>
                <div class="element-creator">By: ${element.creatorName}</div>
                <div class="element-description">${element.description || 'No description available'}</div>
            </div>
        `;
        
        elementDiv.addEventListener('click', () => toggleElementSelection(element.akUUID));
        container.appendChild(elementDiv);
    });
}

function filterElements() {
    const filterText = document.getElementById('elementFilter').value.toLowerCase();
    const elementOptions = document.querySelectorAll('.element-option');
    
    elementOptions.forEach(option => {
        const title = option.querySelector('.element-title').textContent.toLowerCase();
        const creator = option.querySelector('.element-creator').textContent.toLowerCase();
        const description = option.querySelector('.element-description').textContent.toLowerCase();
        
        if (title.includes(filterText) || creator.includes(filterText) || description.includes(filterText)) {
            option.style.display = 'flex';
        } else {
            option.style.display = 'none';
        }
    });
}

function toggleElementSelection(elementId) {
    const elementDiv = document.querySelector(`.element-option[data-element-id="${elementId}"]`);
    
    if (selectedElements.includes(elementId)) {
        // Remove element from selection with animation
        elementDiv.style.animation = 'deselectPulse 0.3s ease';
        setTimeout(() => {
            selectedElements = selectedElements.filter(id => id !== elementId);
            elementDiv.classList.remove('selected');
            elementDiv.style.animation = '';
        }, 300);
    } else {
        // Add element if under limit with animation
        if (selectedElements.length >= 4) {
            elementDiv.style.animation = 'errorShake 0.5s ease';
            setTimeout(() => {
                elementDiv.style.animation = '';
            }, 500);
            alert('Maximum 4 elements can be selected');
            return;
        }
        elementDiv.style.animation = 'selectPulse 0.3s ease';
        selectedElements.push(elementId);
        elementDiv.classList.add('selected');
        elementDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            elementDiv.style.animation = '';
        }, 300);
    }
    
    updateElementsDisplay();
}

function updateElementsDisplay() {
    const elementInput = document.getElementById('element');
    
    if (selectedElements.length > 0) {
        // Get names of selected elements
        const selectedNames = selectedElements.map(id => {
            const element = document.querySelector(`.element-option[data-element-id="${id}"]`);
            return element ? element.querySelector('.element-title').textContent : id;
        });
        elementInput.value = selectedNames.join(', ');
    } else {
        elementInput.value = '';
    }
}

function clearElementSelection() {
    selectedElements = [];
    document.querySelectorAll('.element-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    updateElementsDisplay();
}

function confirmElementSelection() {
    updateElementsDisplay();
    closeElements();
}

function openElements() {
    const modal = document.getElementById('elementsModal');
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
    const container = document.querySelector('.elements-container');
    container.classList.add('loading');
    fetchElements().finally(() => container.classList.remove('loading'));
}

function closeElements() {
    const modal = document.getElementById('elementsModal');
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    localStorage.setItem('apiToken', token);
    fetchModels();
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    document.getElementById('theme').value = savedTheme;
    applyTheme(savedTheme);
    
    // Restore selected model
    const savedModelId = localStorage.getItem('selectedModelId');
    if (savedModelId) {
        const savedModelOption = document.querySelector(`.model-option[data-model-id="${savedModelId}"]`);
        if (savedModelOption) {
            savedModelOption.classList.add('selected');
            document.getElementById('modelDisplay').value = savedModelOption.querySelector('.model-title').textContent;
        }
    }
    
    // Add Photo Real toggle listener
    document.getElementById('photoRealToggle').addEventListener('change', filterPhotoRealModels);
    
    // Add touch support
    addTouchSupport();
});

function addTouchSupport() {
    // Add touch support for modal closing
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('touchstart', (e) => {
            if (e.target.className === 'modal') {
                e.target.style.display = 'none';
            }
        });
    });

    // Improve scrolling in containers
    const scrollContainers = document.querySelectorAll('.elements-container, .model-select-container');
    scrollContainers.forEach(container => {
        container.style.webkitOverflowScrolling = 'touch';
    });
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = 'none';
    }
}

window.openElements = openElements;
window.closeElements = closeElements;
window.closeResult = closeResult;
window.closeSettings = closeSettings;
window.openSettings = openSettings;
window.openModels = openModels;
window.closeModels = closeModels;
window.generateImage = generateImage;
window.saveSettings = saveSettings;
window.confirmModelSelection = confirmModelSelection;
window.confirmElementSelection = confirmElementSelection;
window.clearElementSelection = clearElementSelection;
window.filterElements = filterElements;

import Elements from "./elements.js";

const elements = new Elements();

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

async function improvePrompt() {
    const promptInput = document.getElementById('prompt');
    const wand = document.querySelector('.magic-wand');
    const originalPrompt = promptInput.value.trim();

    if (!originalPrompt) {
        alert('Please enter a prompt first');
        return;
    }

    try {
        // Add spinning animation
        wand.classList.add('spinning');

        const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/prompt/improve', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('apiToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: originalPrompt
            })
        });

        if (!response.ok) {
            throw new Error('Failed to improve prompt');
        }

        const data = await response.json();
        if (data.promptGeneration) {
            promptInput.value = data.promptGeneration.prompt; // Corretto l'accesso alla proprietà
            // Add subtle highlight animation to show it changed
            promptInput.style.animation = 'highlightChange 0.5s ease';
            setTimeout(() => {
                promptInput.style.animation = '';
            }, 500);
        }
    } catch (error) {
        console.error('Error improving prompt:', error);
        alert('Failed to improve prompt. Please try again.');
    } finally {
        // Remove spinning animation
        wand.classList.remove('spinning');
    }
  }

function updatePresetOptions() {
    const alchemyEnabled = document.getElementById('alchemyToggle').checked;
    const presetSelect = document.getElementById('preset');
    
    presetSelect.innerHTML = ''; // Clear existing options
    
    if (alchemyEnabled) {
        // Alchemy presets
        const alchemyPresets = [
            'NONE',
            'ANIME',
            'CREATIVE',
            'DYNAMIC', 
            'ENVIRONMENT',
            'GENERAL',
            'ILLUSTRATION',
            'PHOTOGRAPHY',
            'RAYTRACED',
            'RENDER_3D',
            'SKETCH_BW',
            'SKETCH_COLOR'
        ];
        
        alchemyPresets.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.toLowerCase();
            option.textContent = preset;
            presetSelect.appendChild(option);
        });
    } else {
        // Non-alchemy presets
        const standardPresets = [
            'NONE',
            'LEONARDO'
        ];
        
        standardPresets.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.toLowerCase();
            option.textContent = preset;
            presetSelect.appendChild(option);
        });
    }
}

// Add event listener to alchemy toggle
document.getElementById('alchemyToggle').addEventListener('change', updatePresetOptions);

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
        elements: elements.selectedElements,
        modelId: selectedModelId,
        preset: document.getElementById('preset').value,
        size: document.getElementById('size').value,
        alchemy: document.getElementById('alchemyToggle').checked,
        photoReal: document.getElementById('photoRealToggle').checked
    };
    //alert(JSON.stringify(parameters, null, 2))
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
        Elements.selectedElements = [];
        document.getElementById('element').value = '';
        
        // Refresh elements list with new filter
        if (document.getElementById('elementsModal').style.display === 'block') {
            fetchElements();
        }
    }
    closeModels();
}

async function calculatePrice() {
    const size = document.getElementById('size').value;
    const [width, height] = size.split('x').map(Number);
    const elements = Elements.selectedElements || [];
    const alchemyEnabled = document.getElementById('alchemyToggle').checked;
    const selectedModelName = document.getElementById('modelDisplay').value;

    // Build pricing payload
    const payload = {
        serviceParams: {
            IMAGE_GENERATION: {
                imageHeight: height,
                imageWidth: width,
                numImages: 1,
                inferenceSteps: 30,
                promptMagic: false,
                alchemyMode: alchemyEnabled,
                highResolution: width >= 768 || height >= 768,
                loraCount: elements.length,
                isModelCustom: false,
                controlnetsCost: 0,
                isPhoenix: selectedModelName === 'Leonardo Phoenix',
                isSDXL: selectedModelName.includes('XL'),
                isSDXLLightning: false
            }
        },
        service: "IMAGE_GENERATION"
    };

    try {
        console.log(payload)
        const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/pricing-calculator', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('apiToken')}`
            },
            
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to calculate price');
        
        const data = await response.json();
        console.log('Price:', data.calculateProductionApiServiceCost);
        return data.calculateProductionApiServiceCost.cost || 0;
    } catch (error) {
        console.error('Error calculating price:', error);
        return null;
    }
}

// Update the interface to show price
async function updatePriceDisplay() {
    const credits = await calculatePrice();
    const priceDisplay = document.getElementById('priceDisplay');
    if (credits !== null) {
        priceDisplay.textContent = `${credits} credits`;
        priceDisplay.style.color = '';
    } else {
        priceDisplay.textContent = 'Price calculation failed';
        priceDisplay.style.color = 'red';
    }
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
    updatePresetOptions();

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
    
    ['size', 'alchemyToggle'].forEach(id => {
        document.getElementById(id).addEventListener('change', updatePriceDisplay);
    });

    // Initial price calculation
    updatePriceDisplay();
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

document.getElementById('openElements').onclick = function() {
    elements.openElements();
};

document.getElementById('closeElements').onclick = function() {
    elements.closeElements();
};

document.getElementById('confirmElementSelection').onclick = function() {
    elements.confirmElementSelection();
};

document.getElementById('clearElementSelection').onclick = function() {
    elements.clearElementSelection();
};

elements.filterElements = function() {
    const filterValue = document.getElementById('elementFilter').value.toLowerCase();
    const filteredElements = elements.getElements().filter(element => element.toLowerCase().includes(filterValue));
    console.log('Filtered Elements:', filteredElements);
};

window.closeResult = closeResult;
window.closeSettings = closeSettings;
window.openSettings = openSettings;
window.openModels = openModels;
window.closeModels = closeModels;
window.generateImage = generateImage;
window.saveSettings = saveSettings;
window.confirmModelSelection = confirmModelSelection;
window.improvePrompt = improvePrompt;

class Elements {
    constructor() {
      this.selectedElements = {};
      this.currentElements = [];
      
      this.SPECIAL_MODELS = [
            'Anime Pastel Dream',
            'DreamSharper v7', 
            'Absolute Reality v1.6',
            '3D Animation Style',
            'Stable Diffusion 1.5',
            'Stable Diffusion 2.1',
            'Leonardo Phoenix'
        ];
    }

    
    toggleElementSelection(elementId) {
        const elementDiv = document.querySelector(`.element-option[data-element-id="${elementId}"]`);
        
        if (elementId in this.selectedElements) {
            // Remove element from selection with animation
            elementDiv.style.animation = 'deselectPulse 0.3s ease';
            setTimeout(() => {
                delete this.selectedElements[elementId];
                elementDiv.classList.remove('selected');
                elementDiv.style.animation = '';
                this.displayElements(this.currentElements); // Aggiorna la visualizzazione
            }, 300);
        } else {
            // Add element if under limit with animation
            if (Object.keys(this.selectedElements).length >= 4) {
                elementDiv.style.animation = 'errorShake 0.5s ease';
                setTimeout(() => {
                    elementDiv.style.animation = '';
                }, 500);
                alert('Maximum 4 elements can be selected');
                return;
            }
            elementDiv.style.animation = 'selectPulse 0.3s ease';
            this.selectedElements[elementId] = {
                id: elementId,
                weight: 1
            };
            elementDiv.classList.add('selected');
            elementDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                elementDiv.style.animation = '';
                this.displayElements(this.currentElements); // Aggiorna la visualizzazione
            }, 300);
        }
        
        this.updateElementsDisplay();
    }



    updateElementsDisplay() {
        const elementInput = document.getElementById('element');
        
        if (Object.keys(this.selectedElements).length > 0) {
            const selectedDetails = Object.values(this.selectedElements).map(el => {
                const element = document.querySelector(`.element-option[data-element-id="${el.id}"]`);
                const name = element ? element.querySelector('.element-title').textContent : el.id;
                return `${name} (${el.weight})`;
            });
            elementInput.value = selectedDetails.join(', ');
        } else {
            elementInput.value = '';
        }
    }

    displayElements(elements) {
        const container = document.querySelector('.elements-container');
        container.innerHTML = '';
        
        elements.forEach(element => {
            const elementDiv = document.createElement('div');
            elementDiv.className = 'element-option';
            elementDiv.setAttribute('data-element-id', element.akUUID);
            
            if (element.akUUID in this.selectedElements) {
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
                    ${element.akUUID in this.selectedElements ? `
                    <div class="element-weight-control">
                        <span>Weight:</span>
                        <input type="range" 
                            class="element-weight-slider" 
                            min="-1" 
                            max="1" 
                            step="0.1" 
                            value="${this.selectedElements[element.akUUID].weight}"
                        >
                        <span class="element-weight-value">${this.selectedElements[element.akUUID].weight}</span>
                    </div>
                    ` : ''}
                </div>
            `;
            
            // Aggiungi l'event listener dopo aver creato l'elemento
            elementDiv.addEventListener('click', (e) => {
                if (!e.target.classList.contains('element-weight-slider')) {
                    this.toggleElementSelection(element.akUUID);
                }
            });

            // Aggiungi subito l'elemento al container
            container.appendChild(elementDiv);

            // Aggiungi l'event listener per il peso dopo aver aggiunto l'elemento al DOM
            if (element.akUUID in this.selectedElements) {
                const slider = elementDiv.querySelector('.element-weight-slider');
                if (slider) {
                    slider.addEventListener('input', (e) => {
                        this.updateElementWeight(element.akUUID, e.target.value);
                    });
                }
            }
        });
    }

    updateElementWeight(elementId, weight) {
        if (elementId in this.selectedElements) {
            const numWeight = parseFloat(weight);
            this.selectedElements[elementId].weight = numWeight;
            
            // Aggiorna il valore visualizzato
            const weightValue = document.querySelector(
                `.element-option[data-element-id="${elementId}"] .element-weight-value`
            );
            if (weightValue) {
                weightValue.textContent = numWeight.toFixed(1);
            }
            
            this.updateElementsDisplay();
        }
    }

    clearElementSelection() {
        this.selectedElements = {};
        document.querySelectorAll('.element-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        this.updateElementsDisplay();
    }
    openElements() {
        const modal = document.getElementById('elementsModal');
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
        const container = document.querySelector('.elements-container');
        container.classList.add('loading');
        this.fetchElements().finally(() => container.classList.remove('loading'));
    }
    
    closeElements() {
        const modal = document.getElementById('elementsModal');
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    }
    async fetchElements() {
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
            } else if (this.SPECIAL_MODELS.includes(selectedModelName)) {
                // For special models, show only konyconi elements
                elements = elements.filter(element => element.creatorName === 'konyconi');
            } else {
                // For all other models, show only Leonardo elements
                elements = elements.filter(element => element.creatorName.toLowerCase().includes('leonardo'));
            }
            
            this.currentElements = elements;
            this.displayElements(elements);
            
            // Show message if no elements available
            const container = document.querySelector('.elements-container');
            if (elements.length === 0) {
                container.innerHTML = '<div class="no-elements" style="padding: 20px; text-align: center;">No elements available for this model</div>';
            }
        } catch (error) {
            console.error('Error fetching elements:', error);
        }

       
    }
    confirmElementSelection() {
        this.updateElementsDisplay();
        this.closeElements();
    }
};

    

export default Elements
  



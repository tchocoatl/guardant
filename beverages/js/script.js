// ===== CONFIGURATION SECTION =====
const CONFIG = {
    pickupTimeMin: '14:00',  // 2:00 PM
    pickupTimeMax: '17:00',  // 5:00 PM
    showLocationField: false,
    locations: ['Main Office', 'Conference Room A', 'Break Room']
};
// ===== END CONFIGURATION SECTION =====

let formState = {
    temperature: null,
    caffeination: null,
    beverage: null,
    style: null,
    item: null,
    milk: null,
    flavors: [],
    toppings: [],
    specialInstructions: '',
    name: '',
    pickupTime: '',
    location: '',
    email: '',
    emailOptIn: false
};

let items = [];
let currentSection = 0;
const sections = [
    'temperatureSection',
    'caffeinationSection',
    'beverageSection',
    'styleSection',
    'itemSection',
    'milkSection',
    'flavorsSection',
    'toppingsSection',
    'detailsSection',
    'summarySection'
];

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded');
    await loadItems();
    setupEventListeners();
    renderTemperatureButtons();
    renderCaffeinationButtons();
    renderFlavorsButtons();
    renderToppingsButtons();
    showSection(0);
});

async function loadItems() {
    try {
        const response = await fetch('./Items.csv');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const csv = await response.text();
        items = parseCSV(csv);
        console.log(`Loaded ${items.length} items`);
    } catch (error) {
        console.error('Error loading CSV:', error);
    }
}

function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const obj = {};
        const values = lines[i].split(',').map(v => v.trim());
        headers.forEach((header, idx) => {
            obj[header] = values[idx] || '';
        });
        if (obj.Available === 'TRUE') data.push(obj);
    }
    return data;
}

function setupEventListeners() {
    document.getElementById('beverageForm').addEventListener('submit', submitForm);
    document.getElementById('specialInstructions').addEventListener('input', (e) => {
        document.getElementById('instructionsCount').textContent = `${e.target.value.length}/500`;
    });
}

function showSection(index) {
    sections.forEach((section, idx) => {
        const element = document.getElementById(section);
        element.classList.toggle('active', idx === index);
    });
    currentSection = index;
    updateProgress();
}

function nextSection() {
    if (!validateSection(currentSection)) return;
    
    updateFormState();
    
    if (currentSection === 1) renderBeverageButtons();
    if (currentSection === 2) renderStyleButtons();
    if (currentSection === 3) renderItemButtons();
    if (currentSection === 4) renderMilkButtons();
    if (currentSection === 8) renderSummary();
    
    showSection(currentSection + 1);
}

function previousSection() {
    if (currentSection > 0) showSection(currentSection - 1);
}

function validateSection(section) {
    if (section === 0) {
        if (!formState.temperature) {
            alert('Please select a temperature');
            return false;
        }
    }
    if (section === 1) {
        if (!formState.caffeination) {
            alert('Please select caffeination');
            return false;
        }
    }
    if (section === 2) {
        if (!formState.beverage) {
            alert('Please select a beverage type');
            return false;
        }
    }
    if (section === 3) {
        if (!formState.style) {
            alert('Please select a style');
            return false;
        }
    }
    if (section === 4) {
        if (!formState.item) {
            alert('Please select an item');
            return false;
        }
    }
    if (section === 5) {
        if (!formState.milk) {
            alert('Please select milk');
            return false;
        }
    }
    if (section === 6) {
        if (formState.flavors.length === 0) {
            alert('Please select flavors or "No Flavors"');
            return false;
        }
    }
    if (section === 7) {
        if (formState.toppings.length === 0) {
            alert('Please select toppings or "No Toppings"');
            return false;
        }
    }
    if (section === 8) {
        if (!formState.name || !formState.pickupTime) {
            alert('Please fill in name and pick-up time');
            return false;
        }
        if (formState.pickupTime < CONFIG.pickupTimeMin || formState.pickupTime > CONFIG.pickupTimeMax) {
            alert(`Time must be between ${CONFIG.pickupTimeMin} and ${CONFIG.pickupTimeMax}`);
            return false;
        }
    }
    return true;
}

function updateFormState() {
    formState.name = document.getElementById('name').value;
    formState.pickupTime = document.getElementById('pickupTime').value;
    formState.specialInstructions = document.getElementById('specialInstructions').value;
    formState.email = document.getElementById('email').value;
    formState.emailOptIn = document.getElementById('emailOptIn').checked;
}

function updateProgress() {
    const progress = ((currentSection + 1) / sections.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

function selectOption(name, value, element) {
    // Remove previous selection
    document.querySelectorAll(`.${name}-option`).forEach(btn => btn.classList.remove('selected'));
    
    // Add selection to clicked element
    element.classList.add('selected');
    
    // Update state
    if (name === 'temperature') formState.temperature = value;
    if (name === 'caffeination') formState.caffeination = value;
    if (name === 'beverage') formState.beverage = value;
    if (name === 'style') formState.style = value;
    if (name === 'item') formState.item = value;
    if (name === 'milk') formState.milk = value;
}

function toggleOption(name, value, element) {
    element.classList.toggle('selected');
    
    if (name === 'flavors') {
        if (value === 'No Flavors or Add-ons') {
            // Uncheck all others
            document.querySelectorAll('.flavors-option').forEach(btn => {
                if (btn.textContent.trim() !== 'No Flavors or Add-ons') btn.classList.remove('selected');
            });
            formState.flavors = ['No Flavors or Add-ons'];
        } else {
            // Remove "No Flavors" if selected
            document.querySelectorAll('.flavors-option').forEach(btn => {
                if (btn.textContent.includes('No Flavors')) btn.classList.remove('selected');
            });
            formState.flavors = Array.from(document.querySelectorAll('.flavors-option.selected')).map(btn => btn.textContent.trim());
        }
    }
    
    if (name === 'toppings') {
        if (value === 'No Toppings') {
            document.querySelectorAll('.toppings-option').forEach(btn => {
                if (btn.textContent.trim() !== 'No Toppings') btn.classList.remove('selected');
            });
            formState.toppings = ['No Toppings'];
        } else {
            document.querySelectorAll('.toppings-option').forEach(btn => {
                if (btn.textContent.includes('No Toppings')) btn.classList.remove('selected');
            });
            formState.toppings = Array.from(document.querySelectorAll('.toppings-option.selected')).map(btn => btn.textContent.trim());
        }
    }
}

function renderTemperatureButtons() {
    const html = ['Hot', 'Iced']
        .map(temp => `<button type="button" class="option-button temperature-option" onclick="selectOption('temperature', '${temp}', this)">${temp}</button>`)
        .join('');
    document.getElementById('temperatureGroup').innerHTML = html;
}

function renderCaffeinationButtons() {
    const html = ['Caffeinated', 'Decaffeinated']
        .map(caff => `<button type="button" class="option-button caffeination-option" onclick="selectOption('caffeination', '${caff}', this)">${caff}</button>`)
        .join('');
    document.getElementById('caffeinationGroup').innerHTML = html;
}

function renderBeverageButtons() {
    const beverages = new Set(
        items
            .filter(item => {
                if (item.Category !== 'Beverage') return false;
                if (item.Temperature !== 'Both' && item.Temperature !== formState.temperature) return false;
                if (item.Caffeination !== 'Both' && item.Caffeination !== formState.caffeination) return false;
                return true;
            })
            .map(item => item.Type)
    );
    
    const html = Array.from(beverages)
        .sort()
        .map(bev => `<button type="button" class="option-button beverage-option" onclick="selectOption('beverage', '${bev}', this)">${bev}</button>`)
        .join('');
    document.getElementById('beverageGroup').innerHTML = html;
}

function renderStyleButtons() {
    const styles = new Set(
        items
            .filter(item => {
                if (item.Category !== 'Beverage') return false;
                if (item.Type !== formState.beverage) return false;
                if (item.Temperature !== 'Both' && item.Temperature !== formState.temperature) return false;
                if (item.Caffeination !== 'Both' && item.Caffeination !== formState.caffeination) return false;
                return true;
            })
            .map(item => item.Style)
    );
    
    const html = Array.from(styles)
        .sort()
        .map(style => `<button type="button" class="option-button style-option" onclick="selectOption('style', '${style}', this)">${style}</button>`)
        .join('');
    document.getElementById('styleGroup').innerHTML = html;
}

function renderItemButtons() {
    const filteredItems = items.filter(item => {
        if (item.Category !== 'Beverage') return false;
        if (item.Type !== formState.beverage) return false;
        if (item.Style !== formState.style) return false;
        if (item.Temperature !== 'Both' && item.Temperature !== formState.temperature) return false;
        if (item.Caffeination !== 'Both' && item.Caffeination !== formState.caffeination) return false;
        return true;
    });
    
    const html = filteredItems
        .map(item => `<button type="button" class="option-button item-option" onclick="selectOption('item', '${item.Item}', this)">${item.Item}</button>`)
        .join('');
    document.getElementById('itemGroup').innerHTML = html;
}

function renderMilkButtons() {
    const itemData = items.find(i => i.Item === formState.item && i.Category === 'Beverage');
    if (!itemData) return;
    
    const milkChoice = itemData['Milk Choice'];
    const milkItems = items.filter(i => i.Category === 'Milk' && i.Available === 'TRUE');
    
    let availableMilks = [];
    if (milkChoice === 'None') availableMilks = [{ Item: 'No Milk' }];
    else if (milkChoice === 'Required') availableMilks = milkItems.filter(m => m.Type !== 'No Milk');
    else if (milkChoice === 'Optional') availableMilks = milkItems;
    else if (milkChoice === 'Half & Half') availableMilks = milkItems.filter(m => m.Type === 'Half & Half');
    
    const html = availableMilks
        .map(milk => `<button type="button" class="option-button milk-option" onclick="selectOption('milk', '${milk.Item}', this)">${milk.Item}</button>`)
        .join('');
    document.getElementById('milkGroup').innerHTML = html || '<p>No options</p>';
}

function renderFlavorsButtons() {
    const flavors = items.filter(i => i.Category === 'Flavors & Add-ons' && i.Available === 'TRUE');
    const html = flavors
        .map(flavor => `<button type="button" class="option-button flavors-option" onclick="toggleOption('flavors', '${flavor.Type}', this)">${flavor.Type}</button>`)
        .join('');
    document.getElementById('flavorsGroup').innerHTML = html;
}

function renderToppingsButtons() {
    const temperature = formState.temperature || document.querySelector('input[name="temperature"]:checked')?.value;
    const toppings = items.filter(i => {
        if (i.Category !== 'Toppings') return false;
        if (i.Available !== 'TRUE') return false;
        if (i.Temperature !== 'Both' && i.Temperature !== temperature) return false;
        return true;
    });
    
    const html = toppings
        .map(topping => `<button type="button" class="option-button toppings-option" onclick="toggleOption('toppings', '${topping.Type}', this)">${topping.Type}</button>`)
        .join('');
    document.getElementById('toppingsGroup').innerHTML = html;
}

function toggleEmailField() {
    const emailField = document.getElementById('emailField');
    if (document.getElementById('emailOptIn').checked) {
        emailField.classList.remove('hidden');
    } else {
        emailField.classList.add('hidden');
        document.getElementById('email').value = '';
    }
}

function renderSummary() {
    let summary = `
        <div class="summary-item"><span class="summary-label">Temperature:</span> ${formState.temperature}</div>
        <div class="summary-item"><span class="summary-label">Caffeination:</span> ${formState.caffeination}</div>
        <div class="summary-item"><span class="summary-label">Beverage:</span> ${formState.beverage}</div>
        <div class="summary-item"><span class="summary-label">Style:</span> ${formState.style}</div>
        <div class="summary-item"><span class="summary-label">Item:</span> ${formState.item}</div>
    `;
    
    if (formState.milk) summary += `<div class="summary-item"><span class="summary-label">Milk:</span> ${formState.milk}</div>`;
    if (formState.flavors.length > 0) summary += `<div class="summary-item"><span class="summary-label">Flavors:</span> ${formState.flavors.join(', ')}</div>`;
    if (formState.toppings.length > 0) summary += `<div class="summary-item"><span class="summary-label">Toppings:</span> ${formState.toppings.join(', ')}</div>`;
    if (formState.specialInstructions) summary += `<div class="summary-item"><span class="summary-label">Instructions:</span> ${formState.specialInstructions}</div>`;
    if (formState.name) summary += `<div class="summary-item"><span class="summary-label">Name:</span> ${formState.name}</div>`;
    if (formState.pickupTime) summary += `<div class="summary-item"><span class="summary-label">Pick-up Time:</span> ${formState.pickupTime}</div>`;
    
    document.getElementById('orderSummary').innerHTML = summary;
}

function submitForm(e) {
    e.preventDefault();
    
    const payload = {
        temperature: formState.temperature,
        caffeination: formState.caffeination,
        beverage: formState.beverage,
        style: formState.style,
        item: formState.item,
        milk: formState.milk,
        flavors: formState.flavors,
        toppings: formState.toppings,
        specialInstructions: formState.specialInstructions,
        name: formState.name,
        pickupTime: formState.pickupTime,
        email: formState.email,
        emailOptIn: formState.emailOptIn,
        timestamp: new Date().toISOString()
    };

    fetch(window.GAS_DEPLOYMENT_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(result => {
        if (result.success) {
            document.getElementById('beverageForm').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
            if (result.emailSent && formState.email) {
                document.getElementById('confirmationText').innerHTML = 'Confirmation sent to ' + formState.email;
            }
        } else {
            alert('Error submitting order');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error submitting order');
    });
}

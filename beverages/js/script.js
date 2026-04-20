// Global state
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadItems();
    setupEventListeners();
    renderBeverageOptions();
    renderFlavorsOptions();
    renderToppingsOptions();
    renderLocations();
    showSection(0);
});

// Load items from CSV
async function loadItems() {
    try {
        const response = await fetch('Items.csv');
        const csv = await response.text();
        items = parseCSV(csv);
    } catch (error) {
        console.error('Error loading items:', error);
    }
}

// Parse CSV
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

        if (obj.Available === 'TRUE') {
            data.push(obj);
        }
    }

    return data;
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('beverageForm').addEventListener('submit', submitForm);
    document.getElementById('specialInstructions').addEventListener('input', (e) => {
        document.getElementById('instructionsCount').textContent = `${e.target.value.length}/500`;
    });
}

// Show a specific section
function showSection(index) {
    sections.forEach((section, idx) => {
        const element = document.getElementById(section);
        if (idx === index) {
            element.classList.add('active');
            element.classList.remove('hidden');
        } else {
            element.classList.remove('active');
            element.classList.add('hidden');
        }
    });
    
    currentSection = index;
    updateProgress();
}

// Navigate to next section
function nextSection() {
    if (currentSection < sections.length - 1) {
        // Validate current section
        if (!validateSection(currentSection)) return;
        
        // Update state
        updateFormState();
        
        // Special handling for dynamic sections
        if (currentSection === 2) {
            renderBeverageOptions();
        } else if (currentSection === 3) {
            updateStyles();
        } else if (currentSection === 4) {
            updateItems();
        } else if (currentSection === 5) {
            updateMilkOptions();
        } else if (currentSection === 8) {
            renderSummary();
        }
        
        showSection(currentSection + 1);
    }
}

// Navigate to previous section
function previousSection() {
    if (currentSection > 0) {
        showSection(currentSection - 1);
    }
}

// Validate current section
function validateSection(section) {
    const form = document.getElementById('beverageForm');
    const inputs = form.querySelectorAll(`#${sections[section]} input[required], #${sections[section]} select[required]`);
    
    for (let input of inputs) {
        if (input.type === 'radio') {
            const radioGroup = form.querySelector(`input[name="${input.name}"]:checked`);
            if (!radioGroup) return false;
        } else if (!input.value) {
            return false;
        }
    }
    return true;
}

// Update form state from current inputs
function updateFormState() {
    const form = document.getElementById('beverageForm');
    formState.temperature = form.querySelector('input[name="temperature"]:checked')?.value || null;
    formState.caffeination = form.querySelector('input[name="caffeination"]:checked')?.value || null;
    formState.beverage = form.querySelector('#beverageType')?.value || null;
    formState.style = form.querySelector('#style')?.value || null;
    formState.item = form.querySelector('#item')?.value || null;
    formState.milk = form.querySelector('input[name="milk"]:checked')?.value || null;
    formState.flavors = Array.from(form.querySelectorAll('input[name="flavors"]:checked')).map(cb => cb.value);
    formState.toppings = Array.from(form.querySelectorAll('input[name="toppings"]:checked')).map(cb => cb.value);
    formState.specialInstructions = form.querySelector('#specialInstructions')?.value || '';
    formState.name = form.querySelector('#name')?.value || '';
    formState.pickupTime = form.querySelector('#pickupTime')?.value || '';
    formState.location = form.querySelector('#location')?.value || '';
    formState.email = form.querySelector('#email')?.value || '';
    formState.emailOptIn = form.querySelector('#emailOptIn')?.checked || false;
}

// Update progress bar
function updateProgress() {
    const progress = ((currentSection + 1) / sections.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

// Render beverage type options
function renderBeverageOptions() {
    const temperature = document.querySelector('input[name="temperature"]:checked')?.value;
    const caffeination = document.querySelector('input[name="caffeination"]:checked')?.value;
    
    const beverages = new Set(items
        .filter(item => {
            if (item.Category !== 'Beverage') return false;
            if (item.Temperature !== 'Both' && item.Temperature !== temperature) return false;
            if (item.Caffeination !== 'Both' && item.Caffeination !== caffeination) return false;
            return true;
        })
        .map(item => item.Type));

    const select = document.getElementById('beverageType');
    select.innerHTML = '<option value="">Choose...</option>' + 
        Array.from(beverages).map(bev => `<option value="${bev}">${bev}</option>`).join('');
}

// Update style options based on beverage
function updateStyles() {
    const beverage = document.getElementById('beverageType').value;
    const temperature = document.querySelector('input[name="temperature"]:checked')?.value;
    const caffeination = document.querySelector('input[name="caffeination"]:checked')?.value;
    
    const styles = new Set(items
        .filter(item => {
            if (item.Category !== 'Beverage') return false;
            if (item.Type !== beverage) return false;
            if (item.Temperature !== 'Both' && item.Temperature !== temperature) return false;
            if (item.Caffeination !== 'Both' && item.Caffeination !== caffeination) return false;
            return true;
        })
        .map(item => item.Style));

    const select = document.getElementById('style');
    select.innerHTML = '<option value="">Choose...</option>' + 
        Array.from(styles).map(style => `<option value="${style}">${style}</option>`).join('');
}

// Update item options based on style
function updateItems() {
    const beverage = document.getElementById('beverageType').value;
    const style = document.getElementById('style').value;
    const temperature = document.querySelector('input[name="temperature"]:checked')?.value;
    const caffeination = document.querySelector('input[name="caffeination"]:checked')?.value;
    
    const filteredItems = items.filter(item => {
        if (item.Category !== 'Beverage') return false;
        if (item.Type !== beverage) return false;
        if (item.Style !== style) return false;
        if (item.Temperature !== 'Both' && item.Temperature !== temperature) return false;
        if (item.Caffeination !== 'Both' && item.Caffeination !== caffeination) return false;
        return true;
    });

    const select = document.getElementById('item');
    select.innerHTML = '<option value="">Choose...</option>' + 
        filteredItems.map(item => `<option value="${item.Item}">${item.Item}</option>`).join('');
}

// Update milk options
function updateMilkOptions() {
    const item = document.getElementById('item').value;
    const itemData = items.find(i => i.Item === item && i.Category === 'Beverage');
    
    if (!itemData) {
        document.getElementById('milkOptions').innerHTML = '';
        formState.milk = 'None';
        return;
    }

    const milkChoice = itemData['Milk Choice'];
    const milkItems = items.filter(i => i.Category === 'Milk' && i.Available === 'TRUE');
    
    let availableMilks = [];
    if (milkChoice === 'None') {
        availableMilks = [{ Item: 'No Milk' }];
    } else if (milkChoice === 'Required') {
        availableMilks = milkItems.filter(m => m.Type !== 'No Milk');
    } else if (milkChoice === 'Optional') {
        availableMilks = milkItems;
    } else if (milkChoice === 'Half & Half') {
        availableMilks = milkItems.filter(m => m.Type === 'Half & Half');
    }

    const html = availableMilks.map(milk => `
        <div class="radio-option">
            <label><input type="radio" name="milk" value="${milk.Item}" ${milkChoice === 'None' ? 'checked' : ''} ${milkChoice === 'Required' && !availableMilks[0] ? 'required' : ''}> ${milk.Item}</label>
        </div>
    `).join('');

    document.getElementById('milkOptions').innerHTML = html || '<p>No milk options available</p>';
}

// Render flavors options
function renderFlavorsOptions() {
    const flavors = items.filter(i => i.Category === 'Flavors & Add-ons' && i.Available === 'TRUE');
    const html = flavors.map(flavor => `
        <div class="checkbox-option">
            <label><input type="checkbox" name="flavors" value="${flavor.Type}"> ${flavor.Type}</label>
        </div>
    `).join('');
    
    document.getElementById('flavorsOptions').innerHTML = html;
}

// Render toppings options
function renderToppingsOptions() {
    const temperature = document.querySelector('input[name="temperature"]:checked')?.value;
    const toppings = items.filter(i => {
        if (i.Category !== 'Toppings') return false;
        if (i.Available !== 'TRUE') return false;
        if (i.Temperature !== 'Both' && i.Temperature !== temperature) return false;
        return true;
    });

    const html = toppings.map(topping => `
        <div class="checkbox-option">
            <label><input type="checkbox" name="toppings" value="${topping.Type}"> ${topping.Type}</label>
        </div>
    `).join('');
    
    document.getElementById('toppingsOptions').innerHTML = html;
}

// Render locations
function renderLocations() {
    const locations = ['Main Office', 'Conference Room A', 'Break Room'];
    const select = document.getElementById('location');
    select.innerHTML = '<option value="">Select...</option>' + 
        locations.map(loc => `<option value="${loc}">${loc}</option>`).join('');
}

// Toggle email field
function toggleEmailField() {
    const emailField = document.getElementById('emailField');
    const emailOptIn = document.getElementById('emailOptIn').checked;
    
    if (emailOptIn) {
        emailField.classList.remove('hidden');
        document.getElementById('email').focus();
    } else {
        emailField.classList.add('hidden');
        document.getElementById('email').value = '';
    }
}

// Render order summary
function renderSummary() {
    updateFormState();
    
    let summary = `
        <div class="summary-item"><span class="summary-label">Temperature:</span> ${formState.temperature}</div>
        <div class="summary-item"><span class="summary-label">Caffeination:</span> ${formState.caffeination}</div>
        <div class="summary-item"><span class="summary-label">Item:</span> ${formState.item}</div>
    `;

    if (formState.milk) {
        summary += `<div class="summary-item"><span class="summary-label">Milk:</span> ${formState.milk}</div>`;
    }

    if (formState.flavors.length > 0) {
        summary += `<div class="summary-item"><span class="summary-label">Flavors:</span> ${formState.flavors.join(', ')}</div>`;
    }

    if (formState.toppings.length > 0) {
        summary += `<div class="summary-item"><span class="summary-label">Toppings:</span> ${formState.toppings.join(', ')}</div>`;
    }

    if (formState.specialInstructions) {
        summary += `<div class="summary-item"><span class="summary-label">Instructions:</span> ${formState.specialInstructions}</div>`;
    }

    if (formState.name) {
        summary += `<div class="summary-item"><span class="summary-label">Name:</span> ${formState.name}</div>`;
    }

    if (formState.pickupTime) {
        summary += `<div class="summary-item"><span class="summary-label">Pick-up Time:</span> ${formState.pickupTime}</div>`;
    }

    if (formState.location) {
        summary += `<div class="summary-item"><span class="summary-label">Location:</span> ${formState.location}</div>`;
    }

    document.getElementById('orderSummary').innerHTML = summary;
}

// Submit form
function submitForm(e) {
    e.preventDefault();
    updateFormState();

    const payload = {
        temperature: formState.temperature,
        caffeination: formState.caffeination,
        beverage: formState.beverage,
        style: formState.style,
        item: formState.item,
        milk: formState.milk || 'None',
        flavors: formState.flavors,
        toppings: formState.toppings,
        specialInstructions: formState.specialInstructions,
        name: formState.name,
        pickupTime: formState.pickupTime,
        location: formState.location,
        email: formState.email,
        emailOptIn: formState.emailOptIn,
        timestamp: new Date().toISOString()
    };

    fetch(window.GAS_DEPLOYMENT_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            document.getElementById('beverageForm').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
            if (result.emailSent) {
                document.getElementById('confirmationText').innerHTML = 'A confirmation email has been sent to ' + formState.email;
            }
        } else {
            alert('Error submitting order. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error submitting order. Please try again.');
    });
}

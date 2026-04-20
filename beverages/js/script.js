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
    pickupTime: null,
    specialInstructions: '',
    name: '',
    location: '',
    email: '',
    emailOptIn: false
};

let items = [];
let currentSection = 0;
let submissionInProgress = false;

const sections = [
    'temperatureSection',
    'caffeinationSection',
    'beverageSection',
    'styleSection',
    'itemSection',
    'milkSection',
    'flavorsSection',
    'toppingsSection',
    'timeSection',
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
    if (currentSection === 2) {
        // If Other Beverage selected, skip Style and go to Items
        if (formState.beverage === 'Other Beverage') {
            showSection(currentSection + 2); // Skip Style section
            renderItemButtons();
            return;
        } else {
            renderStyleButtons();
        }
    }
    if (currentSection === 3) renderItemButtons();
    if (currentSection === 4) renderMilkButtons();
    if (currentSection === 7) renderTimeButtons();
    if (currentSection === 9) renderSummary();
    
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
        // Skip style validation if Other Beverage (it goes directly to items)
        if (formState.beverage !== 'Other Beverage' && !formState.style) {
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
            alert('Please select flavors or "No Flavors or Add-ons"');
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
        const hour = document.getElementById('pickupHour').value;
        const minute = document.getElementById('pickupMinute').value;
        
        if (!hour || minute === '') {
            alert('Please select a pick-up time (hour and minutes)');
            return false;
        }
    }
    if (section === 9) {
        const name = document.getElementById('name').value.trim();
        
        if (!name) {
            alert('Please enter your name');
            return false;
        }
    }
    return true;
}

function updateFormState() {
    formState.name = document.getElementById('name').value.trim();
    formState.specialInstructions = document.getElementById('specialInstructions').value;
    formState.email = document.getElementById('email').value.trim();
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
    if (name === 'time') formState.pickupTime = value;
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
    const beverageItems = items.filter(item => {
        if (item.Category !== 'Beverage') return false;
        if (item.Temperature !== 'Both' && item.Temperature !== formState.temperature) return false;
        if (item.Caffeination !== 'Both' && item.Caffeination !== formState.caffeination) return false;
        return true;
    });
    
    // Custom order: Coffee, Tea, Other
    const beverageMap = {};
    beverageItems.forEach(item => {
        let displayName = item.Type;
        if (item.Type === 'Other Beverage') displayName = 'Other';
        beverageMap[displayName] = item.Type;
    });
    
    // Fixed order: Coffee, Tea, Other
    const customOrder = ['Coffee', 'Tea', 'Other'];
    const sortedKeys = customOrder.filter(key => key in beverageMap);
    
    const html = sortedKeys
        .map(display => `<button type="button" class="option-button beverage-option" onclick="selectOption('beverage', '${beverageMap[display]}', this)">${display}</button>`)
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
    
    // Custom order for Coffee styles: Espresso, Brewed Coffee
    const customOrder = ['Espresso', 'Brewed Coffee', 'Tea Latte', 'Brewed Tea', 'Specialty'];
    const stylesArray = Array.from(styles);
    const sortedStyles = stylesArray.sort((a, b) => {
        const aIndex = customOrder.indexOf(a);
        const bIndex = customOrder.indexOf(b);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.localeCompare(b);
    });
    
    const html = sortedStyles
        .map(style => `<button type="button" class="option-button style-option" onclick="selectOption('style', '${style}', this)">${style}</button>`)
        .join('');
    document.getElementById('styleGroup').innerHTML = html;
}

function renderItemButtons() {
    const filteredItems = items.filter(item => {
        if (item.Category !== 'Beverage') return false;
        if (item.Type !== formState.beverage) return false;
        if (formState.beverage !== 'Other Beverage' && item.Style !== formState.style) return false;
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

function renderTimeButtons() {
    // Hour and minute dropdowns are already in HTML, just add change listeners
    const hourSelect = document.getElementById('pickupHour');
    const minuteSelect = document.getElementById('pickupMinute');
    
    const updateTime = () => {
        const hour = hourSelect.value;
        const minute = minuteSelect.value;
        
        if (hour && minute !== '') {
            formState.pickupTime = `${hour}:${minute}`;
        } else {
            formState.pickupTime = null;
        }
    };
    
    if (hourSelect && minuteSelect) {
        hourSelect.addEventListener('change', updateTime);
        minuteSelect.addEventListener('change', updateTime);
    }
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

function timeValueToLabel(value) {
    const [hours, minutes] = value.split(':');
    let hour = parseInt(hours);
    const min = minutes;
    
    // Convert to 12-hour format
    let period = 'AM';
    if (hour >= 12) {
        period = 'PM';
        if (hour > 12) {
            hour = hour - 12;
        }
    } else if (hour === 0) {
        hour = 12;
    }
    
    return hour + ':' + min + ' ' + period;
}

function renderSummary() {
    let summary = `
        <div class="summary-item"><span class="summary-label">Temperature:</span> ${formState.temperature}</div>
        <div class="summary-item"><span class="summary-label">Caffeination:</span> ${formState.caffeination}</div>
        <div class="summary-item"><span class="summary-label">Beverage:</span> ${formState.beverage}</div>
    `;
    
    if (formState.style) {
        summary += `<div class="summary-item"><span class="summary-label">Style:</span> ${formState.style}</div>`;
    }
    
    summary += `<div class="summary-item"><span class="summary-label">Item:</span> ${formState.item}</div>`;
    
    if (formState.milk) summary += `<div class="summary-item"><span class="summary-label">Milk:</span> ${formState.milk}</div>`;
    if (formState.flavors.length > 0) summary += `<div class="summary-item"><span class="summary-label">Flavors:</span> ${formState.flavors.join(', ')}</div>`;
    if (formState.toppings.length > 0) summary += `<div class="summary-item"><span class="summary-label">Toppings:</span> ${formState.toppings.join(', ')}</div>`;
    
    const hour = document.getElementById('pickupHour').value;
    const minute = document.getElementById('pickupMinute').value;
    if (hour && minute !== '') {
        const time = `${hour}:${minute}`;
        summary += `<div class="summary-item"><span class="summary-label">Pick-up Time:</span> ${timeValueToLabel(time)}</div>`;
    }
    
    if (formState.name) summary += `<div class="summary-item"><span class="summary-label">Name:</span> ${formState.name}</div>`;
    if (formState.specialInstructions) summary += `<div class="summary-item"><span class="summary-label">Special Instructions:</span> ${formState.specialInstructions}</div>`;
    if (formState.emailOptIn && formState.email) summary += `<div class="summary-item"><span class="summary-label">Email:</span> ${formState.email}</div>`;
    
    document.getElementById('orderSummary').innerHTML = summary;
}

function submitForm(e) {
    e.preventDefault();
    
    // Prevent double submission
    if (submissionInProgress) {
        return;
    }
    submissionInProgress = true;
    
    // Get pickup time from dropdowns for payload
    const hour = document.getElementById('pickupHour').value;
    const minute = document.getElementById('pickupMinute').value;
    const pickupTimeValue = `${hour}:${minute}`;
    
    const payload = {
        temperature: formState.temperature,
        caffeination: formState.caffeination,
        beverage: formState.beverage,
        style: formState.style,
        item: formState.item,
        milk: formState.milk,
        flavors: formState.flavors,
        toppings: formState.toppings,
        pickupTime: pickupTimeValue,
        specialInstructions: formState.specialInstructions,
        name: formState.name,
        email: formState.email,
        emailOptIn: formState.emailOptIn,
        timestamp: new Date().toISOString()
    };

    console.log('Sending payload:', payload);
    console.log('GAS URL:', window.GAS_DEPLOYMENT_URL);

    // Show loading message
    document.getElementById('beverageForm').style.display = 'none';
    document.getElementById('successMessage').style.display = 'block';
    document.getElementById('confirmationText').innerHTML = 'Submitting your order...';

    fetch(window.GAS_DEPLOYMENT_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(r => {
        console.log('Response status:', r.status);
        return r.json();
    })
    .then(result => {
        console.log('Response result:', result);
        
        // Update confirmation message with email status
        if (result.emailSent && formState.email) {
            document.getElementById('confirmationText').innerHTML = 'Confirmation email sent to ' + formState.email;
        } else if (result.success) {
            document.getElementById('confirmationText').innerHTML = 'Your order has been submitted!';
        }
        
        // Redirect after 3 seconds
        setTimeout(() => {
            window.location.href = 'https://goldfishcoffee.com';
        }, 3000);
    })
    .catch(error => {
        submissionInProgress = false;
        console.error('Fetch error:', error);
        document.getElementById('beverageForm').style.display = 'block';
        document.getElementById('successMessage').style.display = 'none';
        alert('Error submitting order: ' + error.message);
    });
}

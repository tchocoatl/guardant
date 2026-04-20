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
    console.log('Page loaded, starting initialization...');
    await loadItems();
    console.log(`Items loaded: ${items.length} items total`);
    setupEventListeners();
    renderFlavorsOptions();
    renderLocations();
    showSection(0);
    console.log('Form initialized');
});

// Load items from CSV
async function loadItems() {
    try {
        const response = await fetch('Items.csv');
        const csv = await response.text();
        items = parseCSV(csv);
        console.log('CSV loaded and parsed');
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

    console.log('Parsed items:', data.length);
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
    console.log(`nextSection called from section ${currentSection}`);
    console.log(`Validating section ${currentSection}...`);
    
    if (currentSection < sections.length - 1) {
        // Validate current section
        if (!validateSection(currentSection)) {
            console.log('Validation FAILED');
            return;
        }
        
        console.log('Validation PASSED');
        
        // Update state
        updateFormState();
        console.log('Form state updated:', formState);
        
        // Special handling for dynamic sections
        if (currentSection === 1


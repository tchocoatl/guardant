// Global state
let formState = {
    temperature: null,
    caffeination: null,
    beverage: null,
    beverageType: null,
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

let config = {};
let items = [];
let currentSection = 0;
let visibleSections = [];

// Initialize form
document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    await loadItems();
    initializeForm();
});

async function loadConfig() {
    try {
        const response = await fetch('config.json');
        config = await response.json();
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

async function loadItems() {
    try {
        const response = await fetch('Items.csv');
        const csv = await response.text();
        items = parseCSV(csv);
    } catch (error) {
        console.error('Error loading items:', error);
    }
}

function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const obj = {};
        const currentLine = lines[i].split(',');

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j].trim()] = currentLine[j]?.trim() || '';
        }

        if (obj.Available === 'TRUE') {
            data.push(obj);
        }
    }

    return data;
}

function initializeForm() {
    buildVisibleSections();
    renderTemperatureOptions();
    setupEventListeners();
    updateProgress();
}

function buildVisibleSections() {
    visibleSections = [];
    const sections = config.sections;

    if (sections.temperature?.enabled) visibleSections.push('temperature');
    if (sections.caffeination?.enabled) visibleSections.push('caffeination');
    if (sections.beverage?.enabled) {
        visibleSections.push('beverage');
        visibleSections.push('beverageType');
        visibleSections.push('item');
    }
    if (sections.milk?.enabled) visibleSections.push('milk');
    if (sections.flavors?.enabled) visibleSections.push('flavors');
    if (sections.toppings?.enabled) visibleSections.push('toppings');
    if (sections.specialInstructions?.enabled || 
        sections.name?.enabled || 
        sections.pickupTime?.enabled || 
        sections.location?.enabled ||
        sections.emailOptIn?.enabled) {
        visibleSections.push('details');
    }

    visibleSections.push('summary');
}

function setupEventListeners() {
    document.getElementById('nextBtn').addEventListener('click', nextSection);
    document.getElementById('beverageForm').addEventListener('submit', submitForm);

    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', previousSection);
    });

    const instructionsField = document.getElementById('specialInstructions');
    if (instructionsField) {
        instructionsField.addEventListener('input', (e) => {
            document.getElementById('instructionsCount').textContent = 
                `${e.target.value.length}/500`;
        });
    }
}

function toggleEmailField() {
    const emailOptIn = document.getElementById('emailOptIn').checked;
    const emailField = document.getElementById('emailField');
    
    if (emailOptIn) {
        emailField.classList.remove('hidden');
        document.getElementById('email').focus();
    } else {
        emailField.classList.add('hidden');
        document.getElementById('email').value = '';
    }
    
    formState.emailOptIn = emailOptIn;
}

function renderTemperatureOptions() {
    const


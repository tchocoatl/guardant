function submitToGoogleSheets(data) {
    const payload = {
        temperature: data.temperature,
        caffeination: data.caffeination,
        beverage: data.beverage,
        style: data.beverageType,
        item: data.item,
        milk: data.milk || 'None',
        flavors: data.flavors,
        toppings: data.toppings,
        specialInstructions: data.specialInstructions,
        name: data.name,
        pickupTime: data.pickupTime,
        location: data.location,
        email: data.email,
        emailOptIn: data.emailOptIn,
        timestamp: new Date().toISOString()
    };

    // Get the Google Apps Script web app URL from environment or config
    const gasUrl = window.GAS_DEPLOYMENT_URL || 'YOUR_GAS_DEPLOYMENT_URL_HERE';

    fetch(gasUrl, {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            console.log('Order submitted successfully. Order ID:', result.orderId);
            showSuccess(result.emailSent || false);
        } else {
            alert('Error submitting form. Please try again.');
            console.error('Error:', result.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error submitting form. Please try again.');
    });
}

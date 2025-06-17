// renderer.js - Corrected to send the right property names

const apiKeyInput = document.getElementById('apiKey');
const apiSecretInput = document.getElementById('apiSecret');
const connectBtn = document.getElementById('connectBtn');
const saveKeyCheck = document.getElementById('saveKeyCheck');

connectBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value;
    const apiSecret = apiSecretInput.value;
    // Let's stick to the India URL for now as it's been consistent
    const baseUrl = "https://api.india.delta.exchange";

    if (!apiKey || !apiSecret) {
        alert('Please enter both API Key and Secret.');
        return;
    }

    connectBtn.textContent = 'Connecting...';
    connectBtn.disabled = true;

    try {
        // --- THIS IS THE FIX ---
        // We now send the data with the property names that main.js expects: 'key', 'secret', 'url'
        const credentialsToTest = {
            key: apiKey,
            secret: apiSecret,
            url: baseUrl
        };

        // We use these credentials to test the connection
        const positions = await window.api.invoke('get-positions', credentialsToTest);

        if (positions.error) {
            alert(`Connection Failed: ${positions.message}`);
        } else {
            // If the connection is successful and the user wants to save...
            if (saveKeyCheck.checked) {
                // We send the same correctly named object to be saved
                window.api.send('save-api-keys', credentialsToTest);
            }
            // Tell the main process to close this login window and open the dashboard
            window.api.send('login-successful');
        }

    } catch (error) {
        console.error('Error invoking backend:', error);
        alert(`An error occurred: ${error}`);
    } finally {
        connectBtn.textContent = 'Connect';
        connectBtn.disabled = false;
    }
});
function getSettings() {
    return browser.storage.local.get(['timeSpent', 'timeLimitExceeded', 'timeLimitHalf', 'timeLimit', 'notifiyTimeUp', 'notifiyHalfTimeUp', 'websiteStatus'])
        .then((result) => {
            // Initialize settings with defaults if not set
            settings = {
                timeSpent: result.timeSpent || 0,
                timeLimitExceeded: result.timeLimitExceeded || false,
                timeLimitHalf: result.timeLimitHalf || false,
                timeLimit: result.timeLimit || 3600, 
                notifiyTimeUp: result.notifiyTimeUp || false, 
                notifiyHalfTimeUp: result.notifiyHalfTimeUp || false, 
                websiteStatus: result.websiteStatus || "restrict", 
            };
            document.getElementById('timeLimit').value = settings.timeLimit / 3600;
            document.getElementById('timeLimitAction').value = settings.websiteStatus;
            document.getElementById('notifyWhenTimeUp').checked = settings.notifiyTimeUp;
            document.getElementById('notifyAtHalfTime').checked = settings.notifiyHalfTimeUp;

            updateTimeLabel(settings.timeLimit / 3600);
            
            console.log("Settings loaded:", settings);
            
        })
        .catch((error) => {
            console.error("Error loading settings:", error);
        });
}


// Function to save settings
function saveSettings() {
    settings.timeLimit = document.getElementById('timeLimit').value * 3600;
    settings.websiteStatus = document.getElementById('timeLimitAction').value;
    settings.notifiyTimeUp = document.getElementById('notifyWhenTimeUp').checked;
    settings.notifiyHalfTimeUp = document.getElementById('notifyAtHalfTime').checked;
    
    settings.timeLimitExceeded = false;
    settings.timeLimitHalf = false;
    
    return browser.storage.local
        .set(settings)
        .then(() => {
            console.log("Settings saved:", settings);
            alert('Settings have been saved!');
        })
        .catch((error) => {
            console.error("Error saving settings:", error);
            alert("Error saving settings:", error);
        });
    
}


// Update the time label based on the slider value
function updateTimeLabel(value) {
    const hours = Math.floor(value);
    const minutes = (value - hours) * 60;
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} Hour/s`;
    document.getElementById('timeLabel').textContent = formattedTime;
}

// Attach event listeners
document.addEventListener('DOMContentLoaded', () => {
    getSettings();
    
    const timeLimitSlider = document.getElementById('timeLimit');
    const saveButton = document.getElementById('saveSettingsButton');
    
    timeLimitSlider.addEventListener('input', (event) => {
        updateTimeLabel(event.target.value);
    });

    saveButton.addEventListener('click', saveSettings);
    
    // Add click listeners to custom checkboxes
    document.querySelectorAll('.custom-checkbox').forEach((checkboxContainer) => {
        checkboxContainer.addEventListener('click', () => {
            const input = checkboxContainer.querySelector('input[type="checkbox"]');
            input.checked = !input.checked;
        });
    });
});


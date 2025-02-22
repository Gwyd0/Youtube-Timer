// Function to get settings from browser storage
function getSettings() {
    return browser.storage.local.get([
        'timeSpent', 'timeLimitExceeded', 'timeLimitHalf', 'timeLimitCustom', 'timeLimit', 'notifiyTimeUp', 'notifiyHalfTimeUp', 'notifyCustomTime', 'websiteStatus', 'resetType', 'lastReset', 'advanceForceRestrict', 'nextResetTime'
        ]).then((result) => {
            settings = {
                timeSpent: result.timeSpent,
                timeLimitExceeded: result.timeLimitExceeded,
                timeLimitHalf: result.timeLimitHalf,
                timeLimitCustom: result.timeLimitCustom,
                timeLimit: result.timeLimit,
                notifiyTimeUp: result.notifiyTimeUp,
                notifiyHalfTimeUp: result.notifiyHalfTimeUp,
                notifyCustomTime: result.notifyCustomTime, // default 15mins before limit, 0 = disabled
                websiteStatus: result.websiteStatus,
                resetType: result.resetType,
                lastReset: result.lastReset,
                advanceForceRestrict: result.advanceForceRestrict,
                nextResetTime: result.nextResetTime
            };
        
            
            document.getElementById('timeLimit').value = settings.timeLimit / 3600;
            
            document.getElementById('timeLimitAction').value = settings.websiteStatus;
            document.getElementById('timeResetAction').value = settings.resetType;
           
            if (settings.notifyCustomTime != 0) {
                document.getElementById('customNotificationInput').value = settings.notifyCustomTime / 60;
                document.getElementById('notifyCustomTime').checked = true;
            }
            else {
                document.getElementById('customNotificationInput').value = 0;
                document.getElementById('notifyCustomTime').checked = false;
            }
            
            document.getElementById('notifyWhenTimeUp').checked = settings.notifiyTimeUp;
            document.getElementById('notifyAtHalfTime').checked = settings.notifiyHalfTimeUp;
            document.getElementById('advanceForceRestrict').checked = settings.advanceForceRestrict;

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
    settings.resetType = document.getElementById('timeResetAction').value;
    
    if (document.getElementById('notifyCustomTime').checked == false) {
        settings.notifyCustomTime = 0;
    }
    else {
        settings.notifyCustomTime = document.getElementById('customNotificationInput').value * 60;
    }
    
    settings.advanceForceRestrict = document.getElementById('advanceForceRestrict').checked;
    
    settings.notifiyTimeUp = document.getElementById('notifyWhenTimeUp').checked;
    settings.notifiyHalfTimeUp = document.getElementById('notifyAtHalfTime').checked;
    
    settings.timeLimitExceeded = false;
    settings.timeLimitHalf = false;
    settings.timeLimitCustom = false;
    
    return browser.storage.local
    .set({ 
        timeSpent: settings.timeSpent,
        timeLimitExceeded: settings.timeLimitExceeded,
        timeLimitHalf: settings.timeLimitHalf,
        timeLimitCustom: settings.timeLimitCustom,
        timeLimit: settings.timeLimit,
        notifiyTimeUp: settings.notifiyTimeUp,
        notifiyHalfTimeUp: settings.notifiyHalfTimeUp,
        notifyCustomTime: settings.notifyCustomTime, // default 15mins before limit, 0 = disabled
        websiteStatus: settings.websiteStatus,
        resetType: settings.resetType,
        advanceForceRestrict: settings.advanceForceRestrict

    })
    .then(() => {
        console.log("Settings saved:", settings);
    })
    .catch((error) => {
        console.error("Error saving settings:", error);
    });
    
}

// Update the time label based on the slider value
function updateTimeLabel(value) {
    const hours = Math.floor(value);
    const minutes = (value - hours) * 60;
    let formattedTime = 0
    if (hours >= 1) {
        formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} Hour/s`;
    }
    else {
        formattedTime = `${String(minutes).padStart(2, '0')} Minute/s`;
    }
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


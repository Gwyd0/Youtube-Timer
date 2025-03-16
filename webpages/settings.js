// Function to get settings from browser storage
function getSettings() {
    return browser.storage.local.get([
        'timeSpent', 'timeLimitExceeded', 'timeLimitHalf', 'timeLimitCustom', 'timeLimit', 'notifiyTimeUp', 'notifiyHalfTimeUp', 'notifyCustomTime', 'websiteStatus', 'resetType', 'lastReset', 'advanceForceRestrict', 'nextResetTime', 'settingsLocked', 'settingsUnlockedTime'
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
                nextResetTime: result.nextResetTime,
                settingsLocked: result.settingsLocked,
                settingsUnlockedTime: result.settingsUnlockedTime
            };
            if (settings.settingsUnlockedTime < new Date()) {
                settings.settingsLocked = false;
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
            }
            else {
                const settingsSection = document.getElementById('settings');
                const settingsLockText = document.getElementById('lockText');
                settingsSection.innerHTML = "";
                lockText.textContent = "Settings have been locked until " + settings.settingsUnlockedTime + ", No changes can be made until then.";
            }
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
        advanceForceRestrict: settings.advanceForceRestrict,
        settingsLocked: settings.settingsLocked,
        settingsUnlockedTime: settings.settingsUnlockedTime

    })
    .then(() => {
        console.log("Settings saved:", settings);
    })
    .catch((error) => {
        console.error("Error saving settings:", error);
    });
    
}

// function to lock settings for set date
function lockSettings() {
    if (!settings.settingsLocked) {
        settings.settingsLocked = true;
        let unlockedDate = new Date();
        unlockedDate.setDate(unlockedDate.getDate() + 7);
        settings.settingsUnlockedTime = unlockedDate;
        saveSettings();
        getSettings();
    }
    else {
        console.log("ERROR: Settings are supposed to be locked????")
    }
}

// shows custom alert to user
function showPopup(text, btnYesText, btnNoText) {
    return new Promise((resolve) => {
        const popup = document.getElementById("popup");
        const popupText = document.getElementById("popupText");
        const confirmYes = document.getElementById("confirmYes");
        const confirmNo = document.getElementById("confirmNo");

        popupText.textContent = text;
        confirmYes.textContent = btnYesText;
        confirmNo.textContent = btnNoText;
        popup.style.display = "block";

        // Remove any existing event listeners before adding new ones
        confirmYes.replaceWith(confirmYes.cloneNode(true));
        confirmNo.replaceWith(confirmNo.cloneNode(true));

        const newConfirmYes = document.getElementById("confirmYes");
        const newConfirmNo = document.getElementById("confirmNo");

        newConfirmYes.addEventListener("click", () => {
            popup.style.display = "none";
            resolve(true);
        });

        newConfirmNo.addEventListener("click", () => {
            popup.style.display = "none";
            resolve(false);
        });
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
    const lockButton = document.getElementById('lockSettingsButton');
    
    timeLimitSlider.addEventListener('input', (event) => {
        updateTimeLabel(event.target.value);
    });

    saveButton.addEventListener('click', async () => {
        const popupAskA = await showPopup("Are you sure you want to save current settings?", "Save Settings", "Cancel")
        if (popupAskA) {
            saveSettings();
            alert("Settings Saved!");
        }
    });
    
    lockButton.addEventListener('click', async () => {
        const popupAskA = await showPopup("How long do you want to lock settings for?", "7 days (Default)", "Cancel")
        if (popupAskA) {
            const popupAskB = await showPopup("Are you sure you want to lock settings for 7 days (This cant be changed other than re-installing the extension completely)", "Yes I am sure.", "Cancel")
            if(popupAskB)  {     
                lockSettings();
                alert("Current Settings have been locked for 7 Days!");
            }
        }
    });
    
    
    // Add click listeners to custom checkboxes
    document.querySelectorAll('.custom-checkbox').forEach((checkboxContainer) => {
        checkboxContainer.addEventListener('click', () => {
            const input = checkboxContainer.querySelector('input[type="checkbox"]');
            input.checked = !input.checked;
        });
    });
});


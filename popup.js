console.log("Popup Opened.");

// Function to format and update time display
function formatTime(data) {
    const totalTimeSpent = data || 0;
    const hours = Math.floor(totalTimeSpent / 3600);
    const minutes = Math.floor((totalTimeSpent % 3600) / 60);
    const seconds = Math.floor(totalTimeSpent % 60);

    // Format numbers to always have two digits
    const formatNumber = (num) => (num < 10 ? `0${num}` : num);

    document.getElementById("time-display-hour").textContent = formatNumber(hours);
    document.getElementById("time-display-min").textContent = formatNumber(minutes);
    document.getElementById("time-display-sec").textContent = formatNumber(seconds);
}

// Function to update all UI elements from settings
function updateUI(settings) {
    // Update time display
    formatTime(settings.timeSpent);

    // Update last reset time
    document.getElementById("time-last-reset").textContent =
    settings.lastReset ? `Last reset: ${new Date(settings.lastReset).toLocaleString()}` : "Last reset: Never";
    
    
    console.log(settings.nextResetTime);
    document.getElementById("time-next-reset").textContent =
    settings.nextResetTime ? `Next reset: ${new Date(settings.nextResetTime).toLocaleString()}` : "Next Reset: Never";
    

}

// Function to get settings from storage
function getSettings() {
    return browser.storage.local.get([
        'timeSpent', 'timeLimitExceeded', 'timeLimitHalf', 'timeLimit', 
        'notifiyTimeUp', 'notifiyHalfTimeUp', 'websiteStatus', 'resetType', 'lastReset', 'nextResetTime'
    ])
    .then((result) => {
        // Initialize settings with defaults if not set
        const settings = {
            timeSpent: result.timeSpent,
            timeLimitExceeded: result.timeLimitExceeded,
            timeLimitHalf: result.timeLimitHalf,
            timeLimit: result.timeLimit,
            notifiyTimeUp: result.notifiyTimeUp,
            notifiyHalfTimeUp: result.notifiyHalfTimeUp,
            websiteStatus: result.websiteStatus,
            resetType: result.resetType,
            lastReset: result.lastReset,
            nextResetTime: result.nextResetTime,
        };

        console.log("Settings loaded:", settings);
        updateUI(settings); // Update the UI with settings
        return settings; // Return settings for further use
    })
    .catch((error) => {
        console.error("Error loading settings:", error);
        document.getElementById("time-display-msg").textContent = "Error loading data.";
        return null;
    });
}

// Function to update time dynamically, ensuring settings are always retrieved first
function updateLiveTime() {
    getSettings().then((settings) => {
        browser.tabs.query({ active: true, currentWindow: true })
        .then((tabs) => {
            const activeTab = tabs[0];
            if (activeTab) {
                // Request live time from the active tab
                browser.tabs.sendMessage(activeTab.id, { type: "getLiveTime" })
                .then((response) => {
                    if (response) {
                        formatTime(response.timeSpent); // Update with live time
                    }
                })
                .catch((error) => {
                    console.error("Error fetching live time:", error);
                });
            }
        }).catch((error) => {
            console.error("Error querying tabs:", error);
        });
    });
}

// Start the live time updater
document.addEventListener("DOMContentLoaded", () => {
    updateLiveTime();
    setInterval(updateLiveTime, 1000); // Update every second
});


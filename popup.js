console.log("Popup Opened.")

// Formats and updates elements
function formatTime(data) {
    const totalTimeSpent = data || 0;
    const hours = Math.floor(totalTimeSpent / 3600);
    const minutes = Math.floor((totalTimeSpent % 3600) / 60);
    const seconds = Math.floor(totalTimeSpent % 60);
    document.getElementById("time-display-hour").textContent = 
        `${hours}`;
    document.getElementById("time-display-min").textContent = 
        `${minutes}`;
    document.getElementById("time-display-sec").textContent = 
        `${seconds}`;
}

// function to get settings from storage
function getSettings() {
    return browser.storage.local.get(['timeSpent', 'timeLimitExceeded', 'timeLimitHalf', 'timeLimit', 'notifiyTimeUp', 'notifiyHalfTimeUp', 'websiteStatus'])
        .then((result) => {
            // Initialize settings with defaults if not set
            settings = {
                timeSpent: result.timeSpent || 0,
                timeLimitExceeded: result.timeLimitExceeded || false,
                timeLimitHalf: result.timeLimitHalf || false,
                timeLimit: result.timeLimit || 3600, 
                notifiyTimeUp: result.notifiyTimeUp || true, 
                notifiyHalfTimeUp: result.notifiyHalfTimeUp || true, 
                websiteStatus: result.websiteStatus || "restrict", 
            };
            console.log("Settings loaded:", settings);
            formatTime(result.timeSpent);
        })
        .catch((error) => {
            console.error("Error loading settings:", error);
            document.getElementById("time-display-msg").textContent = "Error loading data.";
        });
}

// Update the time display dynamically
function updateLiveTime() {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        const activeTab = tabs[0];
        if (activeTab) {
            // Request live time from the active tab
            browser.tabs.sendMessage(activeTab.id, { type: "getLiveTime" }).then((response) => {
                if (response) {formatTime(response.timeSpent);}
            }).catch((error) => {
                console.error("Error fetching live time:", error);

                // Fetch from storage if active tab isn't on YouTube
                getSettings();
            });
        } else {
            // Fetch stored time if no active tab is available
            browser.storage.local.get("youtubeTimeSpent").then((data) => {
                formatTime(data.youtubeTimeSpent);
            }).catch((error) => {
                console.error("Error fetching stored time:", error);
                document.getElementById("time-display-msg").textContent = "Error loading data.";
            });
        }
    }).catch((error) => {
        console.error("Error querying tabs:", error);
        document.getElementById("time-display").textContent = "Error loading data.";
    });
}

// Start the live time updater
document.addEventListener("DOMContentLoaded", () => {
    updateLiveTime();
    setInterval(updateLiveTime, 1000); // Update every second
});


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
                browser.storage.local.get("youtubeTimeSpent").then((data) => {
                    formatTime(data.youtubeTimeSpent);
                }).catch((storageError) => {
                    console.error("Error fetching stored time:", storageError);
                    document.getElementById("time-display-msg").textContent = "Error loading data.";
                });
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


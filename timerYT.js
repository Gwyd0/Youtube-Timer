console.log("YouTube Timer content script loaded.");

// Global variables
let settings = {};
let startTime = null;
let saveInterval = null; // Interval for saving settings

function restrictMode() {
    getSettings();
    let showHomepage;
    if (settings.websiteStatus = "restrict" && settings.timeLimitExceeded) {
        showHomepage = "none";
        const contentDiv = document.getElementById('content');
        if (!document.getElementById('YTTrackerText')) {
            // Create a new text element
            const text = document.createElement('p');
            text.id = "YTTrackerText";
            text.textContent = 'Your Homepage has been blocked as you have reached your time limit, Is this really worth it?';
            text.style.color = "white";
            text.style.fontSize = "3em";
            text.style.padding = '10px';
            text.style.fontFamily = 'monospace';  // Set font to monospace
            text.style.textAlign = 'center';  
            // Append the new text element to the content div
            contentDiv.appendChild(text);
        } 
        else {
            console.warn('No element with id="content" found.');
        }
    }
    else {
        showHomepage = "block";
    }
    const primaryElement = document.getElementById("primary");
    if (primaryElement) {
        primaryElement.style.display = showHomepage; // Hides the element
        console.log("The 'primary' element has been changed.");
    } else {
        console.log("Element with ID 'primary' not found.");
    }
}

// Function to get settings and initialize if not set
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
                websiteStatus: result.websiteStatus || "block", 
            };
            console.log("Settings loaded:", settings);
        })
        .catch((error) => {
            console.error("Error loading settings:", error);
        });
}


// Function to save settings
function saveTimeSpent() {
    return browser.storage.local
        .set({ timeSpent: settings.timeSpent })
        .then(() => {
            console.log("Time spent saved:", formatTime(settings.timeSpent));
        })
        .catch((error) => {
            console.error("Error saving timeSpent:", error);
        });
}
// Function to format time in hours, minutes, and seconds
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${hours} hour/s ${minutes} min/s and ${remainingSeconds} sec/s`;
}

// Start tracking time
function startTracking() {
    if (!startTime) {
        startTime = Date.now();
        console.log("Tracking started at:", new Date(startTime).toLocaleTimeString());
    }
}

// Stop tracking time
function stopTracking() {
    if (startTime) {
        const endTime = Date.now();
        const timeSpent = (endTime - startTime) / 1000; // Convert milliseconds to seconds
        settings.timeSpent += timeSpent; // Update settings
        startTime = null; // Reset startTime
        console.log("Tracking stopped. Time spent:", formatTime(timeSpent));
    }
}

// Save settings periodically every second
function startAutoSave() {
    if (!saveInterval) {
        saveInterval = setInterval(() => {
            if (startTime) {
                const currentTime = Date.now();
                const timeSpent = (currentTime - startTime) / 1000; // Calculate time since last save
                settings.timeSpent += timeSpent; // Update settings
                startTime = currentTime; // Reset startTime for the next interval
            }
            saveTimeSpent(); // Save updated settings
        }, 1000); // Save every second
        console.log("Auto-save started.");
    }
}

// Stop auto-saving
function stopAutoSave() {
    if (saveInterval) {
        clearInterval(saveInterval);
        saveInterval = null;
        console.log("Auto-save stopped.");
    }
}

// Track visibility changes (e.g., switching tabs)
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
        stopTracking();
        stopAutoSave();
    } else if (document.visibilityState === "visible") {
        startTracking();
        startAutoSave();
    }
    console.log("Visibility changed:", document.visibilityState);
});

// Handle messages from popup.js
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getLiveTime") {
        // Calculate the live time including the current session
        const currentTime = startTime ? (Date.now() - startTime) / 1000 : 0;
        const totalLiveTime = settings.timeSpent + currentTime;
        sendResponse({ timeSpent: totalLiveTime });
        console.log("Live time sent to popup:", formatTime(totalLiveTime));
    }
});

// Start tracking and auto-saving if on YouTube
if (window.location.hostname === "www.youtube.com") {
    getSettings().then(() => {
        console.log("Initial time spent:", formatTime(settings.timeSpent));
        startTracking();
        startAutoSave();

        // Log total time spent every 10 seconds
        setInterval(() => {
            const currentTime = startTime ? (Date.now() - startTime) / 1000 : 0;
            console.log(`Total time spent on YouTube: ${formatTime(settings.timeSpent + currentTime)}`);
            
            //settings
            restrictMode();
        }, 1000); // Check every 1 seconds
    });
} else {
    console.log("Not on YouTube. Timer is inactive.");
    // Handle messages when not on YouTube
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === "getLiveTime") {
            sendResponse({ timeSpent: formatTime(settings.timeSpent) });
        }
    });
}


// content script cant be called content as it clashes with another script on youtube homepage
console.log("YouTube Timer content script loaded.");

/* TODO

 * setting to force restrict always
 * refine restrict mode
 * have tip/info tooltips for settings
 * Donate button?
 * have qauter time notfication
 * add more quotes to notifications

*/ 

// Global variables
let settings = {};
let startTime = null;
let saveInterval = null; // Interval for saving settings

// function to Restrict Youtube or block Youtube and add text to the page
function modifyYoutube() {
    getSettings();
    if (settings.timeLimitExceeded) {
        let text = document.createElement("div");
        text.style.position = "fixed";
        text.style.top = "50%";
        text.style.left = "50%";
        text.style.transform = "translate(-50%, -50%)";
        text.style.color = "white";
        text.style.fontSize = "3em";
        text.style.padding = "10px";
        text.style.fontFamily = "monospace";
        text.style.textAlign = "center";
        text.style.backgroundColor = "black";
        text.style.width = "100vw";
        text.style.height = "100vh";
        text.style.display = "flex";
        text.style.justifyContent = "center";
        text.style.alignItems = "center";
        text.id = "YTTrackerText";

        console.log(settings.websiteStatus);
        
        if (settings.websiteStatus === ".restrict") {
            let primary = document.getElementById("primary");
            if (primary && window.location.pathname === "/") { // Only remove if on homepage
                primary.remove();
                text.textContent = "YouTube homepage has been restricted as you have reached your time limit. Is this really worth it?";
                document.body.appendChild(text);
            }
        } else if (settings.websiteStatus === "block") {
            document.body.innerHTML = ""; // Remove everything
            text.textContent = "YouTube has been blocked as you have reached your time limit.";
            document.body.appendChild(text);
        }
    }
}

// Comment
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

// Handle message types from all scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getLiveTime") {
        // Handle popup.js request for live time
        const currentTime = startTime ? (Date.now() - startTime) / 1000 : 0;
        const totalLiveTime = settings.timeSpent + currentTime;
        sendResponse({ timeSpent: totalLiveTime });
        console.log("Live time sent to popup:", formatTime(totalLiveTime));
    } else if (message.action === "startTracking") {
        // Start tracking when background script says it's the active tab
        startTracking();
        startAutoSave();
    } else if (message.action === "stopTracking") {
        // Stop tracking when background script says it's inactive
        stopTracking();
        stopAutoSave();
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
            
            modifyYoutube();
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


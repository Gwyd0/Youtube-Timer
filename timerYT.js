console.log("YouTube Timer content script loaded.");

/* TODO

 * track users full watch histroy - time grapth
 * lock mode for settings
 
 * Donate button? - buy me a coffee
 
 * add more quotes to notifications


 * reset hour setting?
*/ 


// Global variables
let settings = {};
let startTime = null;
let saveInterval = null; // Interval for saving settings

// Function to check and reset the timer if needed
function checkAndResetTimer() {
    const now = Date.now();
    if (!settings.lastReset || !settings.nextResetTime) return;
    console.log(settings.nextResetTime)
    console.log(now)
    if (now >= settings.nextResetTime) {
        console.log("Resetting time spent...");
        settings.timeSpent = 0;
        settings.timeLimitExceeded = false;
        settings.lastReset = now;

        // Determine next reset time based on resetType
        if (settings.resetType === "daily") {
            settings.nextResetTime = new Date().setHours(24, 0, 0, 0); // Next midnight
        } else if (settings.resetType === "weekly") {
            let nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()));
            nextWeek.setHours(0, 0, 0, 0);
            settings.nextResetTime = nextWeek.getTime();
        } else if (settings.resetType === "monthly") {
            let nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
            nextMonth.setHours(0, 0, 0, 0);
            settings.nextResetTime = nextMonth.getTime();
        }

        saveSettings();
    }
}


// Function to modify YouTube page based on settings
function modifyYoutube() {
    getSettings().then(() => {   
        if (settings.timeLimitExceeded || settings.advanceForceRestrict) {
            textOverlay = document.createElement("h1");
            textOverlay.style.color = "white";
            textOverlay.style.fontSize = "3em";
            textOverlay.style.textAlign = "center";
            textOverlay.style.fontFamily = "monospace";
            textOverlay.style.padding = "3em";
            textOverlay.id = "yt-dialog-text"
            if (settings.websiteStatus === "block" && !document.getElementById("yt-dialog-text")) {
                document.body.innerHTML = "";
                textOverlay.textContent = "YouTube is blocked due to time limit.";
                document.body?.appendChild(textOverlay);
            }
            else if (settings.websiteStatus === "restrict" || settings.advanceForceRestrict) {
                if (location.href.includes("/watch") ||  location.href.includes("/results")) {
                    document.getElementById("secondary")?.style.setProperty("display", "none", "important");
                } else {
                    document.getElementById("primary")?.style.setProperty("display", "none", "important");
                    document.getElementById("page-manager")?.style.setProperty("display", "none", "important");
                    
                    if (!document.getElementById("yt-dialog-text")) {
                        textOverlay.textContent = "YouTube has been restricted. Is this worth it?";
                        document.getElementById("content")?.appendChild(textOverlay);
                    }
                }
            } 
        } 
        else {
            // Restore previously hidden elements when the time limit is lifted
            document.getElementById("secondary")?.style.removeProperty("display");
            document.getElementById("primary")?.style.removeProperty("display");
            
            if (document.getElementById("yt-dialog-text")) {
                textOverlay.remove();
            }
        }
    });
}

// Function to retrieve settings from storage
function getSettings() {
    return browser.storage.local.get([
        'timeSpent', 'timeLimitExceeded', 'timeLimitHalf', 'timeLimitCustom', 'timeLimit', 'notifiyTimeUp', 'notifiyHalfTimeUp', 'notifyCustomTime', 'websiteStatus', 'resetType', 'lastReset', 'advanceForceRestrict', 'nextResetTime'
    ]).then((result) => {
        settings = {
            timeSpent: result.timeSpent || 0, 
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
        checkAndResetTimer();
    }).catch(console.error);
}

// Function to save settings
function saveSettings() {
    return browser.storage.local
        .set({ 
            timeSpent: settings.timeSpent, 
            lastReset: settings.lastReset, 
            nextResetTime: settings.nextResetTime 
        })
        .then(() => {
            console.log("Settings saved:", settings);
        })
        .catch((error) => {
            console.error("Error saving settings:", error);
        });
}


// Function to start tracking time
function startTracking() {
    if (!startTime) {
        startTime = Date.now();
        console.log("Tracking started at:", new Date(startTime).toLocaleTimeString());
    }
}

// Function to stop tracking time
function stopTracking() {
    if (startTime) {
        const timeSpent = (Date.now() - startTime) / 1000;
        settings.timeSpent += timeSpent;
        startTime = null;
        saveSettings();
    }
}

// Function to start auto-saving time every second
function startAutoSave() {
    if (!saveInterval) {
        saveInterval = setInterval(() => {
            if (startTime) {
                const currentTime = Date.now();
                const timeSpent = (currentTime - startTime) / 1000;
                settings.timeSpent += timeSpent;
                startTime = currentTime;
            }
            saveSettings();
        }, 1000);
    }
}

// Function to stop auto-saving
function stopAutoSave() {
    if (saveInterval) {
        clearInterval(saveInterval);
        saveInterval = null;
    }
}

// Handle messages from other scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getLiveTime") {
        const currentTime = startTime ? (Date.now() - startTime) / 1000 : 0;
        sendResponse({ timeSpent: settings.timeSpent + currentTime });
    } else if (message.action === "startTracking") {
        startTracking();
        startAutoSave();
    } else if (message.action === "stopTracking") {
        stopTracking();
        stopAutoSave();
    }
});

// Start tracking if on YouTube
if (window.location.hostname === "www.youtube.com") {
    getSettings().then(() => {
        startTracking();
        startAutoSave();
        setInterval(() => {
            modifyYoutube();
        }, 1000);
    });
} else {
    console.log("Not on YouTube. Timer inactive.");
}


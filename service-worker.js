console.log("Background script worker loaded.");

// Default settings
const defaultSettings = {
    timeSpent: 0,
    timeLimitExceeded: false,
    timeLimitHalf: false,
    timeLimit: 3600, // Default time limit in seconds
    notifiyTimeUp: true, 
    notifiyHalfTimeUp: true, 
    websiteStatus: "restrict", 
};

// Global variable for settings
let settings = { ...defaultSettings };

// Function to initialize or retrieve settings
async function setSettings() {
    try {
        const result = await browser.storage.local.get(['timeSpent', 'timeLimitExceeded', 'timeLimitHalf', 'timeLimit', 'notifiyTimeUp', 'notifiyHalfTimeUp', 'websiteStatus']);
        // Merge stored settings with defaults
        settings = {
            timeSpent: result.timeSpent ?? defaultSettings.timeSpent,
            timeLimitExceeded: result.timeLimitExceeded ?? defaultSettings.timeLimitExceeded,
            timeLimitHalf: result.timeLimitHalf ?? defaultSettings.timeLimitHalf,
            timeLimit: result.timeLimit ?? defaultSettings.timeLimit,
            notifiyTimeUp: result.notifiyTimeUp ?? defaultSettings.notifiyTimeUp, 
            notifiyHalfTimeUp: result.notifiyHalfTimeUp ?? defaultSettings.notifiyHalfTimeUp,
            websiteStatus: result.websiteStatus ?? defaultSettings.websiteStatus 
        };
        // Save settings back to storage if any default was used
        await browser.storage.local.set(settings);
        //console.log("Settings initialized and saved:", settings);
    } catch (error) {
        console.error("Error retrieving or saving settings:", error);
    }
}

// Function to save updated settings
async function saveSettings() {
    try {
        await browser.storage.local.set(settings);
        //console.log("Settings updated and saved:", settings);
    } catch (error) {
        console.error("Error saving settings:", error);
    }
}

// Function to check and update the time
async function checkTimeSpent() {
    await setSettings(); // Ensure settings are loaded before proceeding

    console.log(`Total time spent: ${settings.timeSpent} seconds, Time Limit: ${settings.timeLimit}`);

    // If the time exceeds the limit, show a notification
    if (settings.timeSpent >= settings.timeLimit && !settings.timeLimitExceeded) {
        browser.notifications.create({
            type: "basic",
            title: "Time Limit Reached",
            message: "You've exceeded the time limit for YouTube today.",
        });
        settings.timeLimitExceeded = true;
    } 
    else if (settings.timeSpent >= settings.timeLimit / 2 && !settings.timeLimitHalf) {
        browser.notifications.create({
            type: "basic",
            title: "YouTube Timer",
            message: "You have used half of your YouTube time limit. Is it worth it?",
        });
        settings.timeLimitHalf = true;
    }

    // Save updated settings
    await saveSettings();
}

setInterval(async () => {
    await checkTimeSpent();
}, 10000); // 10 second interval


console.log("Background script worker loaded.");

// Default settings set from background.js
const defaultSettings = {
    timeSpent: 0,
    timeLimitExceeded: false,
    timeLimitHalf: false,
    timeLimitCustom: false,
    timeLimit: 3600, // Default time limit in seconds
    notifiyTimeUp: true, 
    notifiyHalfTimeUp: true, 
    notifyCustomTime: 60 * 15, // default 15mins before
    resetType: "daily",
    lastReset: "0",
    websiteStatus: "restrict", 
    advanceForceRestrict: false,
    nextResetTime: 10000000000
};

// Global variables
let settings = { ...defaultSettings };
let activeTabId = null;

// Function to initialize or retrieve settings
async function setSettings() {
    try {
        const result = await browser.storage.local.get(Object.keys(defaultSettings));
        settings = { ...defaultSettings, ...result };
        await browser.storage.local.set(settings);
        console.log(settings);
    } catch (error) {
        console.error("Error retrieving or saving settings:", error);
    }
}

// Function to save updated settings
async function saveSettings() {
    try {
        await browser.storage.local.set(settings);
    } catch (error) {
        console.error("Error saving settings:", error);
    }
}

// Function to check and update the time
async function checkTimeSpent() {
    await setSettings();
    console.log(`Total time spent: ${settings.timeSpent} seconds, Time Limit: ${settings.timeLimit}`);
    
    if (settings.timeSpent >= settings.timeLimit - settings.notifyCustomTime && !settings.timeLimitCustom && settings.notifyCustomTime != 0) {
        browser.notifications.create({
            type: "basic",
            title: "Custom Time Notification",
            message: "You have " + Math.round((settings.timeLimit - settings.notifyCustomTime) / 60)  + " Minute/s left, Is it worth it?",
        });
        settings.timeLimitCustom = true;
        
    } 
    else if (settings.timeSpent >= settings.timeLimit / 2 && !settings.timeLimitHalf && settings.notifiyHalfTimeUp) {
        browser.notifications.create({
            type: "basic",
            title: "Half Time Notification",
            message: "You have used half (" + Math.round((settings.timeLimit / 2) / 60)  +" Min/s) of your YouTube time limit. Is it worth it?",
        });
        settings.timeLimitHalf = true;
    }
    else if (settings.timeSpent >= settings.timeLimit && !settings.timeLimitExceeded && settings.notifiyTimeUp) {
        browser.notifications.create({
            type: "basic",
            title: "Time Limit Notification",
            message: "You've exceeded the time limit for YouTube today. (" + Math.round((settings.timeLimit) / 60)  + " Min/s) Go outside.",
        });
        settings.timeLimitExceeded = true;
    } 

    await saveSettings();
}

// Function to update the active tab and manage tracking
function updateActiveTab() {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        if (tabs.length > 0 && tabs[0].url.includes("youtube.com")) {
            if (activeTabId !== tabs[0].id) {
                if (activeTabId) {
                    browser.tabs.sendMessage(activeTabId, { action: "stopTracking" }).catch(() => {});
                }
                activeTabId = tabs[0].id;
                browser.tabs.sendMessage(activeTabId, { action: "startTracking" }).catch(() => {});
            }
        } else {
            if (activeTabId) {
                browser.tabs.sendMessage(activeTabId, { action: "stopTracking" }).catch(() => {});
                activeTabId = null;
            }
        }
    });
}

// Listen for tab activation
browser.tabs.onActivated.addListener(updateActiveTab);
browser.windows.onFocusChanged.addListener(updateActiveTab);
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.active && changeInfo.url && tab.url.includes("youtube.com")) {
        updateActiveTab();
    }
});

// Check time every 10 seconds
setInterval(async () => {
    await checkTimeSpent();
}, 5000);


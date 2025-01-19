// This script tracks how many hours you spend on youtube.com
console.log("Timer loaded.")


let startTime = null;
browser.storage.local.get("youtubeTimeSpent").then((data) => {
    totalTimeSpent = data.youtubeTimeSpent || 0;
});

// Check if we're on YouTube
if (window.location.hostname === "www.youtube.com") {
    // Start tracking when the user is on the page
    function startTracking() {
        startTime = Date.now();
    }

    // Stop tracking and update the total time spent
    function stopTracking() {
        if (startTime) {
            const endTime = Date.now();
            const timeSpent = (endTime - startTime) / 1000; // Convert milliseconds to seconds
            totalTimeSpent += timeSpent;
            browser.storage.local.set({ youtubeTimeSpent: totalTimeSpent });
            startTime = null;
        }
    }

    // Convert total time to hours, minutes, and seconds
    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${hours} hour/s ${minutes} min/s and ${remainingSeconds} sec/s`;
    }

    // Track visibility changes (e.g., switching tabs)
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            stopTracking();
        } else if (document.visibilityState === "visible") {
            startTracking();
        }
        console.log("[state change]")
    });
    
    // Handle messages from popup.js
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === "getLiveTime") {
            // Calculate the live time including current session
            const currentTime = startTime ? (Date.now() - startTime) / 1000 : 0;
            const totalLiveTime = totalTimeSpent + currentTime;
            sendResponse({ timeSpent: totalLiveTime });
            console.log(totalLiveTime)
        }
    });

    
    // Start tracking immediately when the script loads
    startTracking();

    // Display the total time spent on YouTube
    setInterval(() => {
        console.log(`Total time spent on YouTube: ${formatTime(totalTimeSpent)}`);
    }, 600); // Log every minute
}


else {
    // Handle messages when not on YouTube
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === "getLiveTime") {
            // Send the stored total time without live updates
            sendResponse({ timeSpent: formatTime(totalTimeSpent) });
        }
    });
}


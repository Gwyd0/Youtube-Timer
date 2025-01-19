console.log("background-script worker loaded.")
// service-worker.js
const timeLimit = 60 * 60 * 2 // 120 minutes in milliseconds
let totalTimeSpent = 0;

// Function to check and update the time
function checkTimeSpent() {
  browser.storage.local.get("youtubeTimeSpent")
    .then((data) => {
      totalTimeSpent = data.youtubeTimeSpent || 0;
      console.log(`Total time spent: ${totalTimeSpent} seconds`);

      // If the time exceeds the limit, show a notification
      if (totalTimeSpent >= timeLimit) {
        browser.notifications.create({
          type: "basic",
          iconUrl: "icon.png",
          title: "Time Limit Reached",
          message: "You've exceeded the time limit for YouTube today."
        });
      }
      else if (totalTimeSpent >= timeLimit / 2) {
        browser.notifications.create({
          type: "basic",
          //iconUrl: "icon.png",  // Optional, path to your notification icon
          title: "Youtube Timer",
          message: "You have wasted 1 Hour on Youtube, Is what your watching worth it?",
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching stored time:", error);
    });
}

// Set the interval to check time every minute (60000 ms)
setInterval(checkTimeSpent, 6000); // 60 seconds

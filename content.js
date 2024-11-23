connect();
console.log("Loaded SparxBwk");
//setInterval(function(){mainLoop();}, 400); //runs a loop continuously will replace with listeners soon.
// SETTINGS
//localStorage.setItem("test",  "[]");
console.log(localStorage.getItem("test"));
let SettingsReelsBlock = false;
let SettingsReelsDirectAllow = false;

// COMMUNICATION
function connect() {
	let CsPort = browser.runtime.connect({ name: "port-from-cs" });
	console.log("connecting");
	CsPort.postMessage({ connection: "CS Connected" });
	CsPort.onMessage.addListener((m) => {
		if (m.msgType == "PageUpdated") {
			console.log("Page Changed")
			mainLoop();
		}
		else if (m.msgType == "SETTING") {
			if (m.id=="checkbox0") {console.log("0")}
			else if (m.id=="checkbox1") {console.log(m); SettingsReelsBlock=m.checked;}
			else if (m.id=="checkbox2") {console.log("2?");}
			else if (m.id=="checkbox3") {console.log(m); SettingsReelsDirectAllow=m.checked;}
			else if (m.id=="checkbox4") {console.log("4?");}
		}
	});
}


/* TODO:
    Add help icons to settings to explain what it does
    Decide how much i want to change instagram: settings names?

*/

function mainLoop() {
    let labels = document.querySelectorAll('[aria-label]');



    for (let i = 0; i < labels.length; i++) {
        label = labels[i].getAttribute("aria-label")
        if (label == "Reels" && SettingsReelsBlock) {
            console.log(SettingsBlockReels)
            element = getNthParent(8, labels[i]);
            element.remove();
            if (SettingsReelsDirectAllow) {
                let videos = document.getElementsByTagName("video");
                for (let i = 0; i < videos.length; i++) {
                    videos[i].remove();
                }
            }
        }
        if (label == "Home") {
            element = getNthParent(8, labels[i]);
            element.remove();
        }
        if (label == "Search") {
            element = getNthParent(8, labels[i]);
            element.remove();
        }
        if (label == "Notifications") {
            element = getNthParent(8, labels[i]);
            element.remove();
        }
        //if (label == "Direct") {
         //   element = getNthParent(8, labels[i]);
         //   element.remove();
        //}
        if (label == "Explore") {
            element = getNthParent(8, labels[i]);
            element.remove();
        }
        if (label == "New post") {
            element = getNthParent(8, labels[i]);
            element.remove();
        }
        //console.log(labels[i])
    }
    console.log("script ran");



}

function getNthParent(repetitions, element) {
    for (let i = 0; i < repetitions; i++) {
        element = element.parentElement;
    }
    return element;
    // most efficient way i could find to find nth parent.
}

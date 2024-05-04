let countdownInterval;
let timeInSeconds = 0;

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ timeInSeconds: 0 });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === "start") {
        timeInSeconds = request.timeInSeconds;
        startTimer();
        sendResponse({status: "Timer started", timeInSeconds: timeInSeconds});
    } else if (request.command === "stop") {
        stopTimer();
        sendResponse({status: "Timer stopped"});
    }
});

function startTimer() {
    stopTimer();
    countdownInterval = setInterval(() => {
        timeInSeconds--;
        if (timeInSeconds <= 0) {
            clearInterval(countdownInterval);
            chrome.notifications.create('timerDone', {
                type: 'basic',
                iconUrl: 'icon_48.png',
                title: 'Time Up!',
                message: 'Congratulations! You have completed the session.',
                priority: 2,
                silent: false
            });
            chrome.tabs.query({}, function(tabs) {
                tabs.forEach(tab => {
                    if (!tab.url.startsWith('chrome://')) {
                        chrome.scripting.executeScript({
                            target: {tabId: tab.id},
                            function: playAlarm
                        });
                    }
                });
            });
        }
        chrome.storage.sync.set({ timeInSeconds: timeInSeconds });
    }, 1000);
}

function stopTimer() {
    clearInterval(countdownInterval);
    chrome.storage.sync.set({ timeInSeconds: 0 });
}

function playAlarm() {
    let count = 0;
    const interval = setInterval(() => {
        // Erstellt jedes Mal ein neues Audio-Objekt für die Wiedergabe
        const audio = new Audio(chrome.runtime.getURL("alarm.mp3"));
        audio.play().then(() => {
            console.log("Sound played successfully");
        }).catch(error => {
            console.error("Error playing sound: ", error);
        });
        count++;
        if (count >= 5) {
            clearInterval(interval);
        }
    }, 1500); // Erhöht das Intervall leicht, um sicherzustellen, dass das Audio beendet wird.
}

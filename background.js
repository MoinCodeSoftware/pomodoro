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
    const audio = new Audio(chrome.runtime.getURL("alarm.mp3"));
    let count = 0;
    const interval = setInterval(() => {
        audio.play().catch(error => console.error(error));
        count++;
        if (count >= 5) {
            clearInterval(interval);
        }
    }, 1000); // Wiederholt alle 1000ms, um den Sound fünfmal zu spielen
}

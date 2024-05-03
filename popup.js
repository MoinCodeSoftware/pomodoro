document.addEventListener('DOMContentLoaded', function() {
    const timeSelect = document.getElementById('timeSelect');
    const customTime = document.getElementById('customTime');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const timeDisplay = document.getElementById('timeDisplay');

    let refreshInterval;

    function fetchTimeAndUpdateDisplay() {
        chrome.storage.sync.get('timeInSeconds', function(data) {
            updateDisplay(data.timeInSeconds);
        });
    }

    // Diese Funktion aktualisiert das Timer-Display
    function updateDisplay(seconds) {
        let minutes = Math.floor(seconds / 60);
        let sec = seconds % 60;
        timeDisplay.textContent = `${minutes} minutes and ${sec} seconds remaining`;
        if (seconds <= 0) {
            clearInterval(refreshInterval);
        }
    }

    // Setzt einen Intervall, der den Timerstand regelmäßig überprüft
    function startRefreshTimer() {
        refreshInterval = setInterval(fetchTimeAndUpdateDisplay, 1000);
    }

    timeSelect.addEventListener('change', function() {
        customTime.hidden = this.value !== 'custom';
    });

    startButton.addEventListener('click', function() {
        let duration = parseInt(timeSelect.value);
        if (timeSelect.value === 'custom') {
            duration = parseInt(customTime.value) * 60;
        }
        chrome.runtime.sendMessage({command: "start", timeInSeconds: duration}, function(response) {
            updateDisplay(response.timeInSeconds);
            startRefreshTimer(); // Startet das regelmäßige Aktualisieren beim Starten des Timers
        });
    });

    stopButton.addEventListener('click', function() {
        clearInterval(refreshInterval);
        updateDisplay(0);
        chrome.runtime.sendMessage({command: "stop"}, function(response) {
            updateDisplay(0);
        });
    });

    fetchTimeAndUpdateDisplay(); // Abrufen und Anzeigen der aktuellen Timerzeit beim Laden des Popups
    startRefreshTimer(); // Beginnt mit dem regelmäßigen Überprüfen des Timerstands
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "highlight") {
        document.body.style.backgroundColor = 'yellow'; // Highlight the page
        setTimeout(() => {
            document.body.style.backgroundColor = ''; // Reset the background color after a few seconds
        }, 3000);
    }
});

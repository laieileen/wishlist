// Get current tab URL
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0].url;
    const currentTitle = tabs[0].title;

    // Show form for price + category
    document.getElementById('submit').addEventListener('click', async () => {
        const price = document.getElementById('price').value;
        const category = document.getElementById('category').value;
        const userId = 'user123'; // Replace with actual auth later

        // POST to your backend
        const response = await fetch('https://wishlist-yu2x.onrender.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: currentUrl,
                price,
                category,
                title: currentTitle,
                userId,
            }),
        });

        if (response.ok) {
            alert('Added to wishlist!');
        }
    });
});
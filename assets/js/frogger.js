// Check if we're on the homepage
if (window.location.pathname === '/' || window.location.pathname === '/index.html' || window.location.pathname === '') {
    // Create game container
    const gameDiv = document.createElement('div');
    gameDiv.id = 'hiddenFrogger';
    gameDiv.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:#000; z-index:99999; display:none;';
    gameDiv.innerHTML = `
    <button onclick="closeFrogger()" style="position:fixed; top:20px; right:20px; background:#f00; color:#fff; border:none; padding:10px; cursor:pointer; z-index:100000;">✕</button>
    <iframe id="froggerIframe" style="width:100%; height:100%; border:none;"></iframe>
    `;
    document.body.appendChild(gameDiv);

    // Add subtle hint
    const hint = document.createElement('div');
    hint.style.cssText = 'position:fixed; bottom:20px; right:20px; font-family:"Courier New",monospace; font-size:12px; color:#666; opacity:0.2; transition:opacity 0.3s; z-index:99998; background:#f0f0f0; padding:5px 10px; border-radius:5px;';
    hint.innerHTML = '↑↑↓↓←→←→BA';
    hint.onmouseover = () => hint.style.opacity = '0.8';
    hint.onmouseout = () => hint.style.opacity = '0.2';
    document.body.appendChild(hint);

    // Konami code detection
    let keySequence = [];
    const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];

    document.addEventListener('keydown', (e) => {
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyB','KeyA','Escape'].includes(e.code)) {
            e.preventDefault();
        }

        keySequence.push(e.code);
        if (keySequence.length > 10) keySequence.shift();

        // Check for Konami code
        if (keySequence.length >= 10) {
            const last10 = keySequence.slice(-10);
            if (last10.every((key, i) => key === konamiCode[i])) {
                showGame();
            }
        }

        // ESC to close
        if (e.code === 'Escape') {
            closeGame();
        }
    });

    // Handle B and A keys
    document.addEventListener('keypress', (e) => {
        const key = e.key.toUpperCase();
        if (key === 'B' || key === 'A') {
            e.preventDefault();
            document.dispatchEvent(new KeyboardEvent('keydown', {
                code: 'Key' + key,
                key: key
            }));
        }
    });

    function showGame() {
        document.getElementById('hiddenFrogger').style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Load the game from a separate HTML file
        const iframe = document.getElementById('froggerIframe');
        iframe.src = '/games/frogger.html'; // You'll need to create this file
    }

    function closeGame() {
        document.getElementById('hiddenFrogger').style.display = 'none';
        document.body.style.overflow = 'auto';
        keySequence = [];
    }

    // Make functions globally available
    window.closeFrogger = closeGame;

    // Focus management
    document.body.tabIndex = 0;
    document.body.style.outline = 'none';
    document.addEventListener('click', () => document.body.focus());
    document.body.focus();

    console.log('Hidden Frogger game loaded. Type the Konami code to activate!');
}

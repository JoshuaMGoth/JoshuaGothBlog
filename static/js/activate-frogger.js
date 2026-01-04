// Hidden Frogger Game Activator
// Add this to your homepage

(function() {
    // Only run on homepage
    const isHomepage = window.location.pathname === '/' ||
    window.location.pathname === '/index.html' ||
    window.location.pathname === '' ||
    window.location.pathname.endsWith('/') &&
    !window.location.pathname.includes('/page/');

    if (!isHomepage) return;

    // Create game container (hidden by default)
    const gameContainer = document.createElement('div');
    gameContainer.id = 'hiddenFroggerContainer';
    gameContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
    z-index: 99999;
    display: none;
    `;
    gameContainer.innerHTML = `
    <button onclick="hideFrogger()" style="
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f00;
    color: #fff;
    border: none;
    padding: 10px 15px;
    cursor: pointer;
    z-index: 100000;
    border-radius: 5px;
    font-family: Arial, sans-serif;
    ">✕ Close Game</button>
    <iframe id="froggerGameFrame" style="width:100%; height:100%; border:none;"></iframe>
    `;

    // Create subtle hint
    const hint = document.createElement('div');
    hint.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: #666;
    opacity: 0.2;
    transition: opacity 0.3s;
    z-index: 99998;
    background: rgba(240, 240, 240, 0.7);
    padding: 6px 12px;
    border-radius: 6px;
    cursor: default;
    `;
    hint.innerHTML = '↑↑↓↓←→←→BA';
    hint.title = 'Secret game: Type this code!';

    hint.onmouseover = function() {
        this.style.opacity = '0.8';
    };
    hint.onmouseout = function() {
        this.style.opacity = '0.2';
    };

    // Add elements to page
    document.body.appendChild(gameContainer);
    document.body.appendChild(hint);

    // Konami code detection
    let konamiKeys = [];
    const konamiSequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];

    // Listen for keydown events
    document.addEventListener('keydown', function(event) {
        // Prevent default for game keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA', 'Escape'].includes(event.code)) {
            event.preventDefault();
        }

        // Add key to sequence
        konamiKeys.push(event.code);
        if (konamiKeys.length > 10) {
            konamiKeys.shift();
        }

        // Check for Konami code
        if (konamiKeys.length >= 10) {
            const last10 = konamiKeys.slice(-10);
            if (last10.every((key, index) => key === konamiSequence[index])) {
                showFrogger();
            }
        }

        // ESC to close game
        if (event.code === 'Escape') {
            hideFrogger();
        }
    });

    // Also listen for keypress for B and A keys
    document.addEventListener('keypress', function(event) {
        const key = event.key.toUpperCase();
        if (key === 'B' || key === 'A') {
            event.preventDefault();
            // Simulate keydown event
            document.dispatchEvent(new KeyboardEvent('keydown', {
                code: 'Key' + key,
                key: key
            }));
        }
    });

    // Show the game
    function showFrogger() {
        const container = document.getElementById('hiddenFroggerContainer');
        const frame = document.getElementById('froggerGameFrame');

        // Show container
        container.style.display = 'block';
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        // Load the game
        frame.src = '/games/frogger.html';

        // Focus the iframe
        frame.focus();

        console.log('Hidden Frogger game activated!');
    }

    // Hide the game
    function hideFrogger() {
        const container = document.getElementById('hiddenFroggerContainer');
        container.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        konamiKeys = [];

        // Reset iframe source
        const frame = document.getElementById('froggerGameFrame');
        frame.src = 'about:blank';

        // Refocus on body
        document.body.focus();
    }

    // Make functions globally available
    window.showFrogger = showFrogger;
    window.hideFrogger = hideFrogger;

    // Listen for messages from the game iframe
    window.addEventListener('message', function(event) {
        if (event.data === 'closeFrogger') {
            hideFrogger();
        }
    });

    // Focus management
    document.body.tabIndex = 0;
    document.body.style.outline = 'none';

    // Auto-focus on click
    document.addEventListener('click', function() {
        document.body.focus();
    });

    // Initialize focus
    window.addEventListener('load', function() {
        document.body.focus();
        console.log('Hidden Frogger activator loaded. Type ↑↑↓↓←→←→BA to activate!');
    });
})();

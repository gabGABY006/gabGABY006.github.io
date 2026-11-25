// Estela de brillitos que sigue al mouse (solo en computador y si no se pidió reducir el movimiento).
(function () {
    if (window.__sparkles) return;
    window.__sparkles = true;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var fine = window.matchMedia('(pointer: fine)');
    if (reduce.matches || !fine.matches) return;

    var symbols = ['✦', '✧', '♡', '⋆'];
    var colors = ['#f472b6', '#ffb5d7', '#d9a8f0', '#ffd36e', '#e45ea0'];
    var last = 0;

    document.addEventListener(
        'mousemove',
        function (e) {
            var now = performance.now();
            if (now - last < 50) return;
            last = now;
            var s = document.createElement('span');
            s.className = 'sparkle';
            s.setAttribute('aria-hidden', 'true');
            s.textContent = symbols[(Math.random() * symbols.length) | 0];
            s.style.left = e.clientX + 'px';
            s.style.top = e.clientY + 'px';
            s.style.color = colors[(Math.random() * colors.length) | 0];
            s.style.fontSize = 10 + Math.random() * 10 + 'px';
            s.style.setProperty('--dx', Math.random() * 30 - 15 + 'px');
            document.body.appendChild(s);
            setTimeout(function () {
                s.remove();
            }, 850);
        },
        { passive: true }
    );
})();

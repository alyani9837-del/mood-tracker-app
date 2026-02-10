class BreathArt {
    constructor() {
        this.isActive = false;
        this.timer = null;
        this.init();
    }

    init() {
        const startBtn = document.getElementById('start-breath');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.toggleSession());
        }
    }

    toggleSession() {
        const btn = document.getElementById('start-breath');
        if (this.isActive) {
            this.stop();
            btn.innerText = "Start Session";
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-primary');
        } else {
            this.start();
            btn.innerText = "Stop Session";
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-danger'); // Assuming danger class for stop
        }
    }

    start() {
        this.isActive = true;
        this.runCycle();
    }

    stop() {
        this.isActive = false;
        clearTimeout(this.timer);
        const inner = document.querySelector('.inner-circle');
        const text = document.getElementById('breath-instruction');
        if (inner) {
            inner.style.transform = 'scale(0.4)';
            inner.style.opacity = '0.6';
        }
        if (text) text.innerText = "Session Ended";
    }

    runCycle() {
        if (!this.isActive) return;

        const inner = document.querySelector('.inner-circle');
        const visual = document.querySelector('.breath-visual');
        const text = document.getElementById('breath-instruction');
        if (!inner || !text) return;

        // Phase 1: Inhale (4 seconds)
        text.innerText = "Breathe In...";
        inner.style.transform = 'scale(1)';
        inner.style.opacity = '0.9';
        inner.style.transition = 'all 4s cubic-bezier(0.4, 0, 0.2, 1)';
        if (visual) visual.classList.add('breathing');

        this.timer = setTimeout(() => {
            if (!this.isActive) return;

            // Phase 2: Hold (4 seconds)
            text.innerText = "Hold...";
            inner.style.transform = 'scale(1.05)'; // Slight expansion during hold
            inner.style.transition = 'all 4s linear';

            this.timer = setTimeout(() => {
                if (!this.isActive) return;

                // Phase 3: Exhale (4 seconds)
                text.innerText = "Breathe Out...";
                inner.style.transform = 'scale(0.4)';
                inner.style.opacity = '0.6';
                inner.style.transition = 'all 4s cubic-bezier(0.4, 0, 0.2, 1)';
                if (visual) visual.classList.remove('breathing');

                this.timer = setTimeout(() => {
                    this.runCycle();
                }, 4000);

            }, 4000);

        }, 4000);
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    window.breathArt = new BreathArt();
});

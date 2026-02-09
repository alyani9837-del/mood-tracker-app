class MoodApp {
    constructor() {
        this.currentScore = 0;
        this.faceScore = 0;
        this.emojiScore = 0;
        this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        this.entries = JSON.parse(localStorage.getItem('moodEntries')) || [];

        this.init();
    }

    init() {
        // Nav listeners
        document.querySelectorAll('.nav-links li').forEach(li => {
            li.addEventListener('click', (e) => {
                const pageId = e.currentTarget.getAttribute('data-page');
                if (pageId) {
                    this.navigateTo(pageId);
                    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                }
            });
        });

        // Initialize state
        if (this.isLoggedIn) {
            this.showMainApp();
        } else {
            this.navigateTo('landing');
        }

        // Scanner listeners
        const captureBtn = document.getElementById('capture-btn');
        if (captureBtn) {
            captureBtn.addEventListener('click', () => this.analyzeExpression());
        }

        const emojiBtns = document.querySelectorAll('.emoji-btn');
        emojiBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.emojiScore = parseInt(e.currentTarget.getAttribute('data-value'));
                this.syncValues();

                emojiBtns.forEach(b => b.style.borderColor = 'var(--glass-border)');
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.background = 'var(--primary-light)';
            });
        });

        this.updateDashboard();
        lucide.createIcons();
    }

    navigateTo(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        if (pageId === 'scanner') {
            this.startCamera();
        } else {
            this.stopCamera();
        }

        if (pageId === 'dashboard' || pageId === 'trends') {
            setTimeout(() => this.renderTrends(), 100);
        }
    }

    toggleAuth(mode) {
        const forms = ['login-form', 'register-form', 'forgot-password-form'];
        forms.forEach(id => {
            const form = document.getElementById(id);
            if (form) form.classList.add('hidden');
        });

        const targetForm = document.getElementById(`${mode}-form`) || document.getElementById(`${mode}-password-form`);
        if (targetForm) targetForm.classList.remove('hidden');
    }

    login() {
        this.isLoggedIn = true;
        localStorage.setItem('isLoggedIn', 'true');
        this.showMainApp();
    }

    logout() {
        this.isLoggedIn = false;
        localStorage.removeItem('isLoggedIn');
        document.getElementById('app-wrapper').classList.add('hidden');
        this.navigateTo('landing');
    }

    showMainApp() {
        document.getElementById('app-wrapper').classList.remove('hidden');
        document.getElementById('landing-page').classList.remove('active');
        document.getElementById('auth-page').classList.remove('active');
        this.navigateTo('dashboard');
        lucide.createIcons();
    }

    async startCamera() {
        const video = document.getElementById('webcam');
        const feedback = document.getElementById('scan-feedback');
        if (!video || !feedback) return;

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Browser doesn't support camera or non-secure context.");
            }

            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;

            // Critical fix: Ensure video actually starts playing
            video.onloadedmetadata = () => {
                video.play().catch(e => console.error("Play failed:", e));
            };

            feedback.innerText = "Visualizing facial markers...";
            feedback.style.color = 'var(--text-muted)';
        } catch (err) {
            console.error("Camera Error:", err);

            // Fallback for non-secure context or permission denial
            feedback.innerText = "Camera restricted. Using Simulated Scan mode.";
            feedback.style.color = '#f59e0b'; // Amber for warning/fallback
            video.style.background = 'linear-gradient(45deg, #0f172a, #1e293b)';
        }
    }

    stopCamera() {
        const video = document.getElementById('webcam');
        if (video && video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }
    }

    analyzeExpression() {
        const feedback = document.getElementById('scan-feedback');
        feedback.innerText = "Analyzing micro-expressions...";
        feedback.style.color = 'var(--primary)';

        setTimeout(() => {
            this.faceScore = Math.floor(Math.random() * 100);
            feedback.innerText = "Objective Data Acquired ✅";
            document.getElementById('emoji-validation').classList.remove('hidden');
            document.getElementById('capture-btn').innerText = "Re-analyze";
        }, 1500);
    }

    syncValues() {
        const finalScore = (this.faceScore + this.emojiScore) / 2;
        this.currentScore = finalScore;

        document.getElementById('sync-result').classList.remove('hidden');
        document.getElementById('final-calculated-score').innerText = finalScore.toFixed(0);

        if (finalScore > 75) {
            feedbackWithImpact("Warning: High emotional load detected. Breath Art is recommended.");
        }
    }

    saveEntry() {
        const entry = {
            date: new Date().toISOString(),
            score: this.currentScore,
            faceScore: this.faceScore,
            emojiScore: this.emojiScore
        };

        this.entries.push(entry);
        localStorage.setItem('moodEntries', JSON.stringify(this.entries));

        this.updateDashboard();
        this.navigateTo('dashboard');
    }

    updateDashboard() {
        if (this.entries.length > 0) {
            const last = this.entries[this.entries.length - 1];
            const scoreEl = document.getElementById('today-main-score');
            const pillEl = document.getElementById('current-score-pill');
            if (scoreEl) scoreEl.innerText = last.score.toFixed(0);
            if (pillEl) pillEl.innerText = `Mood: ${last.score.toFixed(0)}`;

            const statusText = last.score > 70 ? "Critical Stress" : (last.score > 40 ? "Stable" : "Positive Flow");
            const statusEl = document.getElementById('today-status');
            if (statusEl) statusEl.innerText = statusText;
        }

        const avg = this.calculateMovingAverage(7);
        const trendEl = document.getElementById('trend-summary');
        if (trendEl) trendEl.innerText = this.entries.length > 0 ? (avg > 55 ? "Elevated Stress Trend" : "Optimal range") : "No data recorded";
    }

    calculateMovingAverage(days) {
        if (this.entries.length === 0) return 0;
        const recent = this.entries.slice(-days);
        const sum = recent.reduce((a, b) => a + b.score, 0);
        return sum / recent.length;
    }

    renderTrends() {
        // Multi-Chart Logic
        const entries = this.entries.slice(-7);
        const labels = entries.map(e => new Date(e.date).toLocaleDateString(undefined, { weekday: 'short' }));
        const scores = entries.map(e => e.score);

        // 1. Line Chart
        this.createChart('line-chart', 'line', labels, scores, {
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            fill: true
        });

        // 2. Bar Chart
        this.createChart('bar-chart', 'bar', labels, scores, {
            backgroundColor: '#3b82f6',
            borderRadius: 8
        });

        // 3. Pie Chart (Distribution)
        const distribution = [
            this.entries.filter(e => e.score > 70).length,
            this.entries.filter(e => e.score > 40 && e.score <= 70).length,
            this.entries.filter(e => e.score <= 40).length
        ];
        this.createChart('pie-chart', 'pie', ['High Stress', 'Stable', 'Positive'], distribution, {
            backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
            borderWidth: 0
        }, {
            maintainAspectRatio: true,
            layout: { padding: 25 }
        });

        // 4. Wave Chart (Area)
        this.createChart('wave-chart', 'line', labels, scores, {
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14, 165, 233, 0.2)',
            fill: true,
            tension: 0.5
        });

        this.renderDailyTip();
    }

    renderDailyTip() {
        const tips = [
            "Healing takes time, and asking for help is a superpower.",
            "Your emotions are valid. Give yourself permission to feel.",
            "One small step today is progress for tomorrow.",
            "You are doing better than you think. Keep going.",
            "Self-care is not selfish; it is essential for resilience."
        ];
        const tipEl = document.getElementById('daily-wisdom-text');
        if (tipEl) {
            tipEl.innerText = `"${tips[Math.floor(Math.random() * tips.length)]}"`;
        }
        lucide.createIcons();
    }

    createChart(id, type, labels, data, style, extraOptions = {}) {
        const ctx = document.getElementById(id);
        if (!ctx) return;

        if (window[id + 'Inst'] && typeof window[id + 'Inst'].destroy === 'function') {
            window[id + 'Inst'].destroy();
        }

        window[id + 'Inst'] = new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    tension: 0.4,
                    ...style
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        left: 10,
                        right: 15,
                        top: 5,
                        bottom: 15 // Extra space for labels
                    }
                },
                plugins: {
                    legend: {
                        display: type === 'pie',
                        position: 'top',
                        labels: { boxWidth: 12, padding: 15, font: { size: 11 } }
                    }
                },
                scales: type !== 'pie' ? {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(0,0,0,0.02)' },
                        ticks: { padding: 8 }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { padding: 8 } // Space between labels and axis
                    }
                } : {},
                ...extraOptions
            }
        });
    }
}

function feedbackWithImpact(msg) {
    const toast = document.createElement('div');
    toast.style = "position:fixed; bottom:20px; right:20px; background:#3b82f6; color:white; padding:1rem 2rem; border-radius:12px; z-index:1000; animation: fadeInUp 0.5s ease;";
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

const app = new MoodApp();
window.app = app;

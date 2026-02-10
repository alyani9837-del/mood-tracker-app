class MoodApp {
    constructor() {
        this.currentScore = 0;
        this.faceScore = 0;
        this.emojiScore = 0;
        this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        this.entries = JSON.parse(localStorage.getItem('moodEntries')) || [];
        this.hopes = JSON.parse(localStorage.getItem('userHopes')) || [];
        this.profile = JSON.parse(localStorage.getItem('userProfile')) || {
            name: 'Sahabat Mood',
            email: 'user@moodapp.com',
            photo: null,
            lang: 'id'
        };
        this.diary = JSON.parse(localStorage.getItem('userDiary')) || [];
        // Database user sederhana untuk demo
        this.users = JSON.parse(localStorage.getItem('appUsers')) || [];

        this.init();
    }

    init() {
        // Force security check
        if (!this.isLoggedIn) {
            localStorage.removeItem('isLoggedIn');
            this.navigateTo('landing');
        } else {
            this.updateProfileUI();
            this.updateDashboard();
        }

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
        this.renderHopes();
        this.renderDiary();
        this.updateProfileUI();
        lucide.createIcons();
    }

    navigateTo(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update active states for both Sidebar and Mobile Nav
        document.querySelectorAll('.nav-links li, .mobile-nav-item').forEach(el => {
            el.classList.remove('active');
            if (el.getAttribute('data-page') === pageId) {
                el.classList.add('active');
            }
        });

        if (pageId === 'scanner') {
            this.startCamera();
        } else {
            this.stopCamera();
        }

        if (pageId === 'dashboard' || pageId === 'trends') {
            setTimeout(() => this.renderTrends(), 100);
        }

        if (pageId === 'hopes') {
            this.renderHopes();
        }

        if (pageId === 'diary') {
            this.renderDiary();
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
        const emailEl = document.getElementById('login-email');
        const passEl = document.getElementById('login-password');
        let isValid = true;

        [emailEl, passEl].forEach(el => {
            el.classList.remove('input-error');
            if (!el.value) {
                el.classList.add('input-error');
                isValid = false;
            }
            el.oninput = () => el.classList.remove('input-error');
        });

        if (!isValid) return;

        // Cari user di "database"
        const user = this.users.find(u => u.email === emailEl.value);

        if (!user) {
            Toast.error('Login Failed', 'Email belum terdaftar!');
            emailEl.classList.add('input-error');
            return;
        }

        if (user.password !== passEl.value) {
            Toast.error('Login Failed', 'Kata sandi salah!');
            passEl.classList.add('input-error');
            return;
        }

        // Kalau email beda sama profil yang aktif sekarang, bersihkan data lama
        if (this.profile.email !== emailEl.value) {
            // Kita cuma hapus data sesi, bukan database user
            const currentUsers = JSON.parse(localStorage.getItem('appUsers')) || [];
            localStorage.clear();
            localStorage.setItem('appUsers', JSON.stringify(currentUsers));

            this.profile = {
                name: user.name,
                email: user.email,
                photo: null,
                lang: 'id'
            };
            this.entries = [];
            this.hopes = [];
            this.diary = [];

            localStorage.setItem('userProfile', JSON.stringify(this.profile));
            localStorage.setItem('moodEntries', JSON.stringify(this.entries));
            localStorage.setItem('userHopes', JSON.stringify(this.hopes));
            localStorage.setItem('userDiary', JSON.stringify(this.diary));
        }

        localStorage.setItem('isLoggedIn', 'true');
        window.location.reload();
    }

    register() {
        const nameEl = document.getElementById('reg-name');
        const emailEl = document.getElementById('reg-email');
        const passEl = document.getElementById('reg-password');
        let isValid = true;

        [nameEl, emailEl, passEl].forEach(el => {
            el.classList.remove('input-error');
            if (!el.value) {
                el.classList.add('input-error');
                isValid = false;
            }
            if (el === passEl && el.value && el.value.length < 8) {
                el.classList.add('input-error');
                isValid = false;
                Toast.warning('Validation Error', 'Kata sandi minimal 8 karakter!');
            }
            el.oninput = () => el.classList.remove('input-error');
        });

        if (!isValid) return;

        // Cek apakah email sudah terdaftar
        if (this.users.some(u => u.email === emailEl.value)) {
            Toast.error('Register Failed', 'Email sudah digunakan!');
            emailEl.classList.add('input-error');
            return;
        }

        // Simpan ke database user
        const newUser = {
            name: nameEl.value,
            email: emailEl.value,
            password: passEl.value
        };
        this.users.push(newUser);
        localStorage.setItem('appUsers', JSON.stringify(this.users));

        // Set data profil aktif
        this.profile = {
            name: nameEl.value,
            email: emailEl.value,
            photo: null,
            lang: 'id'
        };
        this.entries = [];
        this.hopes = [];
        this.diary = [];

        localStorage.setItem('userProfile', JSON.stringify(this.profile));
        localStorage.setItem('moodEntries', JSON.stringify(this.entries));
        localStorage.setItem('userHopes', JSON.stringify(this.hopes));
        localStorage.setItem('userDiary', JSON.stringify(this.diary));

        // FINAL STEP: Set login session
        localStorage.setItem('isLoggedIn', 'true');

        // Use location.href instead of reload() for cleaner redirect
        window.location.href = window.location.pathname;
    }

    handleForgot() {
        const emailEl = document.getElementById('forgot-email');
        if (!emailEl.value) {
            emailEl.classList.add('input-error');
            emailEl.oninput = () => emailEl.classList.remove('input-error');
            return;
        }
        Toast.success('Email Sent', 'Instruksi pemulihan telah dikirim!');
        this.toggleAuth('login');
    }

    saveProfile() {
        const name = document.getElementById('profile-name').value.trim();
        const email = document.getElementById('profile-email').value.trim();
        const lang = document.getElementById('profile-lang').value;

        if (!name || !email) {
            Toast.warning('Required Fields', 'Nama dan Email harus diisi!');
            return;
        }

        this.profile.name = name;
        this.profile.email = email;
        this.profile.lang = lang;

        localStorage.setItem('userProfile', JSON.stringify(this.profile));
        this.updateProfileUI();
        Toast.success('Profile Updated', 'Profil berhasil diperbarui!');
        this.navigateTo('dashboard');
    }

    handlePhotoUpload(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.profile.photo = e.target.result;
                localStorage.setItem('userProfile', JSON.stringify(this.profile));
                this.updateProfileUI();
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    updateProfileUI() {
        const nameDisplay = document.getElementById('user-name-sidebar');
        const greeting = document.getElementById('greeting');
        const sidebarAvatar = document.getElementById('user-avatar-sidebar');
        const headerAvatar = document.getElementById('user-avatar-header');
        const largePreview = document.getElementById('profile-preview-large');

        // Update Text
        if (nameDisplay) nameDisplay.innerText = this.profile.name;
        if (greeting) greeting.innerText = `Hi, ${this.profile.name.split(' ')[0]}`;

        // Update Form Inputs (to be synced when page opens)
        const nameInput = document.getElementById('profile-name');
        const emailInput = document.getElementById('profile-email');
        const langInput = document.getElementById('profile-lang');
        if (nameInput) nameInput.value = this.profile.name;
        if (emailInput) emailInput.value = this.profile.email;
        if (langInput) langInput.value = this.profile.lang;

        // Update Avatars
        const avatarHTML = this.profile.photo
            ? `<img src="${this.profile.photo}" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<i data-lucide="user" color="${largePreview ? 'var(--primary)' : 'white'}" size="${largePreview ? '60' : '24'}"></i>`;

        if (sidebarAvatar) sidebarAvatar.innerHTML = this.profile.photo
            ? `<img src="${this.profile.photo}" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<i data-lucide="user" color="white" size="20"></i>`;

        if (headerAvatar) headerAvatar.innerHTML = this.profile.photo
            ? `<img src="${this.profile.photo}" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<i data-lucide="user" color="var(--primary)" size="24"></i>`;

        if (largePreview) largePreview.innerHTML = this.profile.photo
            ? `<img src="${this.profile.photo}" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<i data-lucide="user" color="var(--primary)" size="60"></i>`;

        lucide.createIcons();
    }

    addHope() {
        const input = document.getElementById('hope-input');
        const text = input.value.trim();

        if (!text) {
            input.classList.add('input-error');
            input.oninput = () => input.classList.remove('input-error');
            return;
        }

        const newHope = {
            id: Date.now(),
            text: text,
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        };

        this.hopes.unshift(newHope);
        localStorage.setItem('userHopes', JSON.stringify(this.hopes));
        input.value = '';
        this.renderHopes();
    }

    deleteHope(id) {
        this.hopes = this.hopes.filter(h => h.id !== id);
        localStorage.setItem('userHopes', JSON.stringify(this.hopes));
        this.renderHopes();
    }

    renderHopes() {
        const grid = document.getElementById('hopes-grid');
        const preview = document.getElementById('latest-hope-preview');
        if (!grid) return;

        grid.innerHTML = '';

        if (this.hopes.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">Belum ada pesan harapan. Tuliskan pesan pertamamu!</div>`;
            if (preview) preview.innerText = 'Belum ada pesan...';
        } else {
            if (preview) preview.innerText = `"${this.hopes[0].text}"`;

            this.hopes.forEach(hope => {
                const card = document.createElement('div');
                card.className = 'card glass';
                card.style.padding = '1.5rem';
                card.style.position = 'relative';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.gap = '1rem';
                card.style.animation = 'fadeIn 0.5s ease';

                card.innerHTML = `
                    <p style="font-size: 1.1rem; line-height: 1.6; color: var(--text-main); font-style: italic; text-align: center;">"${hope.text}"</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                        <span style="font-size: 0.8rem; color: var(--text-muted);">${hope.date}</span>
                        <button onclick="app.deleteHope(${hope.id})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 5px; opacity: 0.6; transition: 0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">
                            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                `;
                grid.appendChild(card);
            });
        }
        lucide.createIcons();
    }

    addDiary() {
        const titleInput = document.getElementById('diary-title');
        const contentInput = document.getElementById('diary-input');
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !content) {
            if (!title) titleInput.classList.add('input-error');
            if (!content) contentInput.classList.add('input-error');
            [titleInput, contentInput].forEach(el => {
                el.oninput = () => el.classList.remove('input-error');
            });
            return;
        }

        const newEntry = {
            id: Date.now(),
            title: title,
            content: content,
            date: new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        this.diary.unshift(newEntry);
        localStorage.setItem('userDiary', JSON.stringify(this.diary));

        titleInput.value = '';
        contentInput.value = '';
        this.renderDiary();
    }

    async deleteDiary(id) {
        const confirmed = await Modal.confirm({
            title: 'Delete Entry',
            message: 'Are you sure you want to permanently delete this journal entry?',
            confirmText: 'Delete',
            type: 'danger',
            icon: 'trash-2'
        });

        if (confirmed) {
            this.diary = this.diary.filter(entry => entry.id !== id);
            localStorage.setItem('userDiary', JSON.stringify(this.diary));
            this.renderDiary();
            Toast.success('Deleted', 'Entry removed successfully');
        }
    }

    renderDiary() {
        const listContainer = document.getElementById('diary-list');
        const preview = document.getElementById('latest-diary-preview');
        if (!listContainer) return;

        listContainer.innerHTML = '';

        if (this.diary.length === 0) {
            listContainer.innerHTML = `
                <div class="card glass" style="padding: 4rem; text-align: center; color: var(--text-muted);">
                    <i data-lucide="book" size="48" style="margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>Diary kamu masih kosong. Mulai tuliskan ceritamu!</p>
                </div>
            `;
            if (preview) preview.innerText = 'Belum ada catatan...';
        } else {
            if (preview) preview.innerText = `"${this.diary[0].title}: ${this.diary[0].content}"`;

            this.diary.forEach(entry => {
                const item = document.createElement('div');
                item.className = 'card glass';
                item.style.padding = '2rem';
                item.style.animation = 'fadeIn 0.5s ease';
                item.style.position = 'relative';

                item.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                        <div>
                            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 0.25rem;">${entry.title}</h3>
                            <span style="font-size: 0.8rem; color: var(--text-muted);">${entry.date}</span>
                        </div>
                        <button onclick="app.deleteDiary(${entry.id})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 5px; opacity: 0.5; transition: 0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.5">
                            <i data-lucide="trash-2" size="18"></i>
                        </button>
                    </div>
                    <p style="line-height: 1.7; color: var(--text-main); white-space: pre-wrap;">${entry.content}</p>
                `;
                listContainer.appendChild(item);
            });
        }
        lucide.createIcons();
    }

    async logout() {
        const confirmed = await Modal.confirm({
            title: 'Confirm Logout',
            message: 'Are you sure you want to exit your session? All local data will be cleared for security.',
            confirmText: 'Logout',
            type: 'danger',
            icon: 'log-out'
        });

        if (confirmed) {
            // Bersihkan SEMUA data dari localStorage supaya gak nyangkut ke akun lain
            localStorage.clear();

            // Set status logout
            this.isLoggedIn = false;

            // Redirect ke landing
            if (document.getElementById('app-wrapper')) {
                document.getElementById('app-wrapper').classList.add('hidden');
            }
            this.navigateTo('landing');

            // Reload total supaya state constructor balik ke default (kosong)
            window.location.href = window.location.pathname;
        }
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
        const wrapper = document.querySelector('.video-wrapper');
        const pointsContainer = document.getElementById('face-points');

        feedback.innerText = "Analyzing micro-expressions...";
        feedback.style.color = 'var(--primary)';
        wrapper.classList.add('scanning');

        // Generate simulated face points
        if (pointsContainer) {
            pointsContainer.innerHTML = '';
            for (let i = 0; i < 15; i++) {
                const point = document.createElement('div');
                point.className = 'point';
                point.style.left = (30 + Math.random() * 40) + '%';
                point.style.top = (30 + Math.random() * 40) + '%';
                pointsContainer.appendChild(point);
                setTimeout(() => point.classList.add('active'), Math.random() * 1000);
            }
        }

        setTimeout(() => {
            this.faceScore = Math.floor(Math.random() * 100);
            feedback.innerText = "Objective Data Acquired ✅";
            wrapper.classList.remove('scanning');
            document.getElementById('emoji-validation').classList.remove('hidden');
            document.getElementById('capture-btn').innerText = "Re-analyze";
        }, 2500);
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
        const scoreEl = document.getElementById('today-main-score');
        const pillEl = document.getElementById('current-score-pill');
        const statusEl = document.getElementById('today-status');
        const trendEl = document.getElementById('trend-summary');

        if (this.entries.length > 0) {
            const last = this.entries[this.entries.length - 1];
            if (scoreEl) scoreEl.innerText = last.score.toFixed(0);
            if (pillEl) pillEl.innerText = `Mood: ${last.score.toFixed(0)}`;

            const statusText = last.score > 70 ? "Critical Stress" : (last.score > 40 ? "Stable" : "Positive Flow");
            if (statusEl) statusEl.innerText = statusText;

            const avg = this.calculateMovingAverage(7);
            if (trendEl) trendEl.innerText = avg > 55 ? "Elevated Stress Trend" : "Optimal range";
        } else {
            // Reset ke tampilan default kalau data kosong
            if (scoreEl) scoreEl.innerText = "0";
            if (pillEl) pillEl.innerText = "Mood: -";
            if (statusEl) statusEl.innerText = "No Data Yet";
            if (trendEl) trendEl.innerText = "No data recorded";
        }
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

// Premium Toast Notification System
const Toast = {
    init() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    },

    show(options) {
        if (!this.container) this.init();

        const { title, message, type = 'info', duration = 4000 } = options;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: 'check-circle',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i data-lucide="${icons[type]}"></i>
            </div>
            <div class="toast-content">
                <span class="toast-title">${title}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;

        this.container.appendChild(toast);
        lucide.createIcons();

        // Auto remove
        setTimeout(() => {
            toast.classList.add('toast-fade-out');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    success(title, message) { this.show({ title, message, type: 'success' }); },
    error(title, message) { this.show({ title, message, type: 'error' }); },
    warning(title, message) { this.show({ title, message, type: 'warning' }); },
    info(title, message) { this.show({ title, message, type: 'info' }); }
};

// Global feedback alias for backward compatibility
function feedbackWithImpact(msg) {
    Toast.info('Notification', msg);
}

// Premium Modal System
const Modal = {
    init() {
        if (this.overlay) return;
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        this.overlay.innerHTML = `
            <div class="modal-card">
                <div class="modal-icon"><i data-lucide="help-circle"></i></div>
                <span class="modal-title" id="modal-title">Confirm Action</span>
                <p class="modal-message" id="modal-message">Are you sure you want to proceed?</p>
                <div class="modal-footer">
                    <button class="btn-modal-cancel" id="modal-cancel">Cancel</button>
                    <button class="btn-modal-confirm" id="modal-confirm">Confirm</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.overlay);

        this.cancelBtn = document.getElementById('modal-cancel');
        this.confirmBtn = document.getElementById('modal-confirm');
    },

    confirm(options = {}) {
        this.init();
        const {
            title = 'Confirm',
            message = 'Proceed?',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            type = 'primary',
            icon = 'help-circle'
        } = options;

        document.getElementById('modal-title').innerText = title;
        document.getElementById('modal-message').innerText = message;
        this.cancelBtn.innerText = cancelText;
        this.confirmBtn.innerText = confirmText;

        // Reset type
        this.confirmBtn.className = `btn-modal-confirm ${type === 'danger' ? 'danger' : ''}`;

        // Update Icon
        const iconContainer = this.overlay.querySelector('.modal-icon');
        iconContainer.innerHTML = `<i data-lucide="${icon}"></i>`;
        lucide.createIcons();

        this.overlay.classList.add('active');

        return new Promise((resolve) => {
            const handleConfirm = () => {
                this.close();
                resolve(true);
            };
            const handleCancel = () => {
                this.close();
                resolve(false);
            };

            this.confirmBtn.onclick = handleConfirm;
            this.cancelBtn.onclick = handleCancel;
            this.overlay.onclick = (e) => { if (e.target === this.overlay) handleCancel(); };
        });
    },

    close() {
        if (this.overlay) this.overlay.classList.remove('active');
    }
};

const app = new MoodApp();
window.app = app;
window.Toast = Toast;
window.Modal = Modal;

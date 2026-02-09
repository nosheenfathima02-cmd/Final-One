// ═══════════════════════════════════════════════════════════
// Nousheen's Life Tracker - Complete Working Version
// NO GOOGLE DRIVE - Pure localStorage only
// ═══════════════════════════════════════════════════════════

// Complete list of all 114 Surahs
const SURAHS = [
    "Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nisa", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal",
    "At-Tawbah", "Yunus", "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahf",
    "Maryam", "Ta-Ha", "Al-Anbya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Ash-Shu'ara", "An-Naml",
    "Al-Qasas", "Al-'Ankabut", "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", "Saba", "Fatir", "Ya-Sin",
    "As-Saffat", "Sad", "Az-Zumar", "Ghafir", "Fussilat", "Ash-Shuraa", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah",
    "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf", "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar",
    "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadila", "Al-Hashr", "Al-Mumtahanah", "As-Saf", "Al-Jumu'ah",
    "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij",
    "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba",
    "An-Nazi'at", "Abasa", "'Adiyat", "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj",
    "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad", "Ash-Shams", "Al-Layl", "Ad-Duhaa",
    "Ash-Sharh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat", "Al-Qari'ah",
    "At-Takathur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraysh", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun",
    "An-Nasr", "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

// Data structure
let appData = {
    personal: { education: [], visa: [], license: [] },
    health: { habits: {}, notes: [] },
    religious: { prayers: {}, quran: [], ramadan: {}, meals: [] },
    professional: { school: [], video: [], lessons: [], reminders: [] }
};

let currentModal = null;

// ═══════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Nousheen\'s Life Tracker starting...');
    loadData();
    renderAll();
    checkDailyReset();
    setInterval(checkReminders, 60000);
    checkReminders();
    
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .catch(err => console.log('SW registration failed:', err));
    }
    
    console.log('✅ App ready!');
});

// ═══════════════════════════════════════════════════════════
// TAB SWITCHING
// ═══════════════════════════════════════════════════════════

function switchTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// ═══════════════════════════════════════════════════════════
// MODAL MANAGEMENT
// ═══════════════════════════════════════════════════════════

function openModal(type) {
    currentModal = type;
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    const today = new Date().toISOString().split('T')[0];
    
    const templates = {
        education: {
            title: 'Add Education Item',
            html: `
                <input type="text" id="input-title" placeholder="Title" required>
                <textarea id="input-details" placeholder="Details..." rows="3"></textarea>
                <input type="date" id="input-deadline">
                <button class="btn-primary" onclick="submitModal('education')">Add</button>
            `
        },
        visa: {
            title: 'Add Visa Item',
            html: `
                <input type="text" id="input-title" placeholder="Title" required>
                <textarea id="input-details" placeholder="Details..." rows="3"></textarea>
                <input type="date" id="input-deadline">
                <button class="btn-primary" onclick="submitModal('visa')">Add</button>
            `
        },
        license: {
            title: 'Add License Item',
            html: `
                <input type="text" id="input-title" placeholder="Title" required>
                <textarea id="input-details" placeholder="Details..." rows="3"></textarea>
                <input type="date" id="input-deadline">
                <button class="btn-primary" onclick="submitModal('license')">Add</button>
            `
        },
        healthNote: {
            title: 'Add Health Note',
            html: `
                <textarea id="input-note" placeholder="Health note..." rows="4" required></textarea>
                <input type="date" id="input-date" value="${today}">
                <button class="btn-primary" onclick="submitModal('healthNote')">Add</button>
            `
        },
        quran: {
            title: 'Add Surah to Memorize',
            html: `
                <label style="font-weight:600; display:block; margin-bottom:5px;">Select Surah:</label>
                <select id="input-surah" required>
                    <option value="">-- Choose a Surah --</option>
                    ${SURAHS.map((surah, i) => `<option value="${surah}">${i + 1}. ${surah}</option>`).join('')}
                </select>
                <label style="font-weight:600; display:block; margin-top:15px; margin-bottom:5px;">Progress Notes:</label>
                <textarea id="input-details" placeholder="How many verses memorized, notes..." rows="3"></textarea>
                <button class="btn-primary" onclick="submitModal('quran')">Add</button>
            `
        },
        mealPrep: {
            title: 'Add Meal Prep / Food Log',
            html: `
                <input type="text" id="input-meal" placeholder="Meal name (e.g., Chicken Biryani)" required>
                <textarea id="input-details" placeholder="Ingredients, what you ate..." rows="3"></textarea>
                <input type="date" id="input-date" value="${today}">
                <button class="btn-primary" onclick="submitModal('mealPrep')">Add</button>
            `
        },
        school: {
            title: 'Add School Task',
            html: `
                <input type="text" id="input-title" placeholder="Task title" required>
                <textarea id="input-details" placeholder="Details..." rows="3"></textarea>
                <input type="date" id="input-deadline">
                <button class="btn-primary" onclick="submitModal('school')">Add</button>
            `
        },
        video: {
            title: 'Add Video Task',
            html: `
                <input type="text" id="input-title" placeholder="Video title" required>
                <textarea id="input-details" placeholder="Description..." rows="3"></textarea>
                <input type="date" id="input-deadline">
                <button class="btn-primary" onclick="submitModal('video')">Add</button>
            `
        },
        lesson: {
            title: 'Add Lesson Plan',
            html: `
                <label style="font-weight:600;">Grade & Subject:</label>
                <input type="text" id="input-title" placeholder="e.g., Grade 9 - Algebra" required>
                <label style="font-weight:600; display:block; margin-top:10px;">Date:</label>
                <input type="date" id="input-date" value="${today}" required>
                <label style="font-weight:600; display:block; margin-top:10px;">Lesson Plan:</label>
                <textarea id="input-details" placeholder="Objectives, activities, materials..." rows="4"></textarea>
                <button class="btn-primary" onclick="submitModal('lesson')">Add</button>
            `
        },
        reminder: {
            title: 'Add Reminder',
            html: `
                <input type="text" id="input-title" placeholder="Reminder title" required>
                <textarea id="input-details" placeholder="Details..." rows="2"></textarea>
                <label style="font-weight:600; display:block; margin-top:10px;">Date & Time:</label>
                <input type="datetime-local" id="input-datetime" required>
                <label style="font-weight:600; display:block; margin-top:10px;">Repeat:</label>
                <select id="input-repeat">
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                </select>
                <button class="btn-primary" onclick="submitModal('reminder')">Add</button>
            `
        }
    };
    
    const template = templates[type];
    if (template) {
        title.textContent = template.title;
        body.innerHTML = template.html;
        modal.classList.add('active');
    }
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    currentModal = null;
}

function submitModal(type) {
    const getVal = (id) => document.getElementById(id)?.value.trim() || '';
    
    const item = { id: Date.now(), completed: false, createdAt: new Date().toISOString() };
    
    try {
        switch(type) {
            case 'education':
            case 'visa':
            case 'license':
                item.title = getVal('input-title');
                item.details = getVal('input-details');
                item.deadline = getVal('input-deadline');
                if (!item.title) return alert('Please enter a title');
                appData.personal[type].push(item);
                break;
                
            case 'healthNote':
                item.note = getVal('input-note');
                item.date = getVal('input-date');
                if (!item.note) return alert('Please enter a note');
                appData.health.notes.push(item);
                break;
                
            case 'quran':
                item.surah = getVal('input-surah');
                item.details = getVal('input-details');
                if (!item.surah) return alert('Please select a Surah');
                appData.religious.quran.push(item);
                break;
                
            case 'mealPrep':
                item.meal = getVal('input-meal');
                item.details = getVal('input-details');
                item.date = getVal('input-date');
                if (!item.meal) return alert('Please enter meal name');
                appData.religious.meals.push(item);
                break;
                
            case 'school':
            case 'video':
                item.title = getVal('input-title');
                item.details = getVal('input-details');
                item.deadline = getVal('input-deadline');
                if (!item.title) return alert('Please enter a title');
                appData.professional[type].push(item);
                break;
                
            case 'lesson':
                item.title = getVal('input-title');
                item.date = getVal('input-date');
                item.details = getVal('input-details');
                if (!item.title || !item.date) return alert('Please enter title and date');
                appData.professional.lessons.push(item);
                break;
                
            case 'reminder':
                item.title = getVal('input-title');
                item.details = getVal('input-details');
                item.datetime = getVal('input-datetime');
                item.repeat = getVal('input-repeat');
                item.active = true;
                if (!item.title || !item.datetime) return alert('Please enter title and time');
                appData.professional.reminders.push(item);
                scheduleNotification(item);
                break;
        }
        
        saveData();
        renderAll();
        closeModal();
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving. Please try again.');
    }
}

// ═══════════════════════════════════════════════════════════
// RENDERING
// ═══════════════════════════════════════════════════════════

function renderAll() {
    renderList('education-list', appData.personal.education, 'education');
    renderList('visa-list', appData.personal.visa, 'visa');
    renderList('license-list', appData.personal.license, 'license');
    renderList('school-list', appData.professional.school, 'school');
    renderList('video-list', appData.professional.video, 'video');
    renderList('lesson-list', appData.professional.lessons, 'lesson');
    renderList('reminders-list', appData.professional.reminders, 'reminder');
    renderHealthNotes();
    renderQuranList();
    renderMealsList();
    loadHabits();
    loadPrayers();
    loadRamadan();
}

function renderList(containerId, items, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!items || items.length === 0) {
        container.innerHTML = '<p class="empty-state">No items yet.</p>';
        return;
    }
    
    container.innerHTML = items.map(item => {
        let details = '';
        if (item.details) details += `<div class="item-details">${escapeHtml(item.details)}</div>`;
        if (item.deadline) details += `<div class="item-details">📅 ${item.deadline}</div>`;
        if (item.datetime) details += `<div class="item-details">⏰ ${new Date(item.datetime).toLocaleString()}</div>`;
        if (item.date && type === 'lesson') details += `<div class="item-details">📅 ${item.date}</div>`;
        
        return `
            <div class="item ${item.completed ? 'completed' : ''}">
                <input type="checkbox" class="item-checkbox" ${item.completed ? 'checked' : ''} onchange="toggleComplete('${type}', ${item.id})">
                <div class="item-content">
                    <div class="item-title">${escapeHtml(item.title || 'Untitled')}</div>
                    ${details}
                </div>
                <button class="btn-delete" onclick='deleteItem("${type}", ${item.id})'>🗑️</button>
            </div>
        `;
    }).join('');
}

function renderHealthNotes() {
    const container = document.getElementById('health-notes-list');
    if (!container) return;
    
    const notes = appData.health.notes || [];
    if (notes.length === 0) {
        container.innerHTML = '<p class="empty-state">No notes yet.</p>';
        return;
    }
    
    container.innerHTML = notes.map(note => `
        <div class="item">
            <div class="item-content">
                <div class="item-title">${note.date || 'No date'}</div>
                <div class="item-details">${escapeHtml(note.note)}</div>
            </div>
            <button class="btn-delete" onclick='deleteHealthNote(${note.id})'>🗑️</button>
        </div>
    `).join('');
}

function renderQuranList() {
    const container = document.getElementById('quran-list');
    if (!container) return;
    
    const surahs = appData.religious.quran || [];
    if (surahs.length === 0) {
        container.innerHTML = '<p class="empty-state">No surahs tracked yet.</p>';
        return;
    }
    
    container.innerHTML = surahs.map(surah => `
        <div class="item">
            <div class="item-content">
                <div class="item-title">📖 ${escapeHtml(surah.surah)}</div>
                ${surah.details ? `<div class="item-details">${escapeHtml(surah.details)}</div>` : ''}
            </div>
            <button class="btn-delete" onclick='deleteQuran(${surah.id})'>🗑️</button>
        </div>
    `).join('');
}

function renderMealsList() {
    const container = document.getElementById('ramadan-meals-list');
    if (!container) return;
    
    const meals = appData.religious.meals || [];
    if (meals.length === 0) {
        container.innerHTML = '<p class="empty-state">No meals logged yet.</p>';
        return;
    }
    
    container.innerHTML = meals.map(meal => `
        <div class="item">
            <div class="item-content">
                <div class="item-title">🍽️ ${escapeHtml(meal.meal)}</div>
                ${meal.details ? `<div class="item-details">${escapeHtml(meal.details)}</div>` : ''}
                <div class="item-details">📅 ${meal.date}</div>
            </div>
            <button class="btn-delete" onclick='deleteMeal(${meal.id})'>🗑️</button>
        </div>
    `).join('');
}

// ═══════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════

function toggleComplete(type, id) {
    const category = ['school', 'video', 'lesson', 'reminder'].includes(type) ? 'professional' : 'personal';
    const items = appData[category][type];
    const item = items.find(i => i.id === id);
    if (item) {
        item.completed = !item.completed;
        saveData();
        renderAll();
    }
}

function deleteItem(type, id) {
    if (!confirm('Delete this item?')) return;
    const category = ['school', 'video', 'lesson', 'reminder'].includes(type) ? 'professional' : 'personal';
    appData[category][type] = appData[category][type].filter(i => i.id !== id);
    saveData();
    renderAll();
}

function deleteHealthNote(id) {
    if (!confirm('Delete this note?')) return;
    appData.health.notes = appData.health.notes.filter(n => n.id !== id);
    saveData();
    renderHealthNotes();
}

function deleteQuran(id) {
    if (!confirm('Delete this surah?')) return;
    appData.religious.quran = appData.religious.quran.filter(s => s.id !== id);
    saveData();
    renderQuranList();
}

function deleteMeal(id) {
    if (!confirm('Delete this meal?')) return;
    appData.religious.meals = appData.religious.meals.filter(m => m.id !== id);
    saveData();
    renderMealsList();
}

// ═══════════════════════════════════════════════════════════
// HABITS & PRAYERS
// ═══════════════════════════════════════════════════════════

function saveHabit(type) {
    const today = new Date().toDateString();
    if (!appData.health.habits[today]) appData.health.habits[today] = {};
    const checked = document.getElementById(`habit-${type}`).checked;
    appData.health.habits[today][type] = checked;
    const item = document.getElementById(`habit-${type}-item`);
    if (item) {
        if (checked) item.classList.add('completed');
        else item.classList.remove('completed');
    }
    saveData();
}

function loadHabits() {
    const today = new Date().toDateString();
    const habits = appData.health.habits[today] || {};
    ['wakeup', 'water', 'veg'].forEach(habit => {
        const checkbox = document.getElementById(`habit-${habit}`);
        const item = document.getElementById(`habit-${habit}-item`);
        if (checkbox) {
            checkbox.checked = habits[habit] || false;
            if (item && habits[habit]) item.classList.add('completed');
            else if (item) item.classList.remove('completed');
        }
    });
}

function savePrayer(type) {
    const today = new Date().toDateString();
    if (!appData.religious.prayers[today]) appData.religious.prayers[today] = {};
    const checked = document.getElementById(`check-${type}`).checked;
    appData.religious.prayers[today][type] = checked;
    const box = document.getElementById(`prayer-${type}`);
    if (box) {
        if (checked) box.classList.add('prayed');
        else box.classList.remove('prayed');
    }
    saveData();
}

function loadPrayers() {
    const today = new Date().toDateString();
    const prayers = appData.religious.prayers[today] || {};
    ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'taraweeh'].forEach(prayer => {
        const checkbox = document.getElementById(`check-${prayer}`);
        const box = document.getElementById(`prayer-${prayer}`);
        if (checkbox) {
            checkbox.checked = prayers[prayer] || false;
            if (box && prayers[prayer]) box.classList.add('prayed');
            else if (box) box.classList.remove('prayed');
        }
    });
}

function saveRamadan(type) {
    const today = new Date().toDateString();
    if (!appData.religious.ramadan[today]) appData.religious.ramadan[today] = {};
    appData.religious.ramadan[today][type] = document.getElementById(`ramadan-${type}`).checked;
    saveData();
}

function loadRamadan() {
    const today = new Date().toDateString();
    const ramadan = appData.religious.ramadan[today] || {};
    ['fasting', 'suhoor', 'iftar'].forEach(item => {
        const checkbox = document.getElementById(`ramadan-${item}`);
        if (checkbox) checkbox.checked = ramadan[item] || false;
    });
}

function checkDailyReset() {
    // Auto-resets by using today's date as key
}

// ═══════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════

function enableNotifications() {
    if (!('Notification' in window)) {
        return alert('❌ This browser does not support notifications');
    }
    
    if (Notification.permission === 'granted') {
        new Notification('✅ Test Notification', {
            body: 'Notifications are working!',
            icon: 'icon-192.png'
        });
        alert('✅ Notifications already enabled! You just got a test notification.');
        return;
    }
    
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            new Notification('🎉 Success!', {
                body: 'Notifications are now enabled. You will receive reminders.',
                icon: 'icon-192.png'
            });
            alert('✅ Notifications enabled! You just got a test notification.');
        } else {
            alert('❌ Please enable notifications in browser settings.');
        }
    });
}

function scheduleNotification(reminder) {
    if (Notification.permission !== 'granted') return;
    
    const reminderTime = new Date(reminder.datetime).getTime();
    const now = Date.now();
    const timeUntil = reminderTime - now;
    
    if (timeUntil > 0 && timeUntil < 86400000) {
        setTimeout(() => {
            new Notification(`⏰ ${reminder.title}`, {
                body: reminder.details || 'Reminder!',
                icon: 'icon-192.png',
                requireInteraction: true
            });
        }, timeUntil);
    }
}

function checkReminders() {
    const now = Date.now();
    (appData.professional.reminders || []).forEach(r => {
        if (!r.active) return;
        const rTime = new Date(r.datetime).getTime();
        if (rTime <= now && rTime > (now - 60000)) {
            if (Notification.permission === 'granted') {
                new Notification(`⏰ ${r.title}`, {
                    body: r.details || 'Reminder!',
                    icon: 'icon-192.png',
                    requireInteraction: true
                });
            }
            if (r.repeat === 'once') r.active = false;
            else if (r.repeat === 'daily') {
                const date = new Date(r.datetime);
                date.setDate(date.getDate() + 1);
                r.datetime = date.toISOString().slice(0, 16);
            } else if (r.repeat === 'weekly') {
                const date = new Date(r.datetime);
                date.setDate(date.getDate() + 7);
                r.datetime = date.toISOString().slice(0, 16);
            }
            saveData();
        }
    });
}

// ═══════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════

function saveData() {
    try {
        localStorage.setItem('nousheenLifeTracker', JSON.stringify(appData));
        console.log('✅ Data saved');
    } catch (e) {
        console.error('❌ Error saving:', e);
    }
}

function loadData() {
    try {
        const data = localStorage.getItem('nousheenLifeTracker');
        if (data) appData = JSON.parse(data);
        console.log('✅ Data loaded');
    } catch (e) {
        console.error('❌ Error loading:', e);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('✅ Nousheen\'s Life Tracker ready!');

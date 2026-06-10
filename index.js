const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}
const historyFilePath = path.join(dataDir, 'histori.txt');

function saveFocusHistory(durationMinutes) {
    const now = new Date().toLocaleString();
    const logMessage = `[${now}] Durasi: ${durationMinutes} Menit\n`;

    fs.appendFile(historyFilePath, logMessage, (err) => {
        if (err) {
            console.error("Gagal simpan histori:", err);
        } else {
            console.log("Histori tersimpan via JS!");
        }
    });
}

let timeLeft = 0;
let currentTimeMode = 0;
let timerID = null;
let isRunning = false;
let currentMode = 'focus'; // 'focus', 'short', 'long'
let cycleCount = 0;        // Hitungan siklus fokus (0-3)

const timerDisplay = document.getElementById("timer");
const statusDisplay = document.getElementById("status");
const btnStart = document.getElementById("start");
const btnPause = document.getElementById("pause");
const btnReset = document.getElementById("reset");
const btnContinue = document.getElementById("continue");
const btnQuit = document.getElementById("quit");
const longBreakBanner = document.getElementById("longBreakBanner");
const yesLongBreak = document.getElementById("yesLongBreak");
const noLongBreak = document.getElementById("noLongBreak");

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
}

function startTimer() {
    if (isRunning) return;

    if (timeLeft === 0) {
        setTimeFromInput();
    }

    isRunning = true;
    updateStatusText();
    updateButtonVisibility();
    updateDisplay();

    timerID = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            clearInterval(timerID); 
            timerID = null;
            handleTimerComplete();
        }
    }, 1000); 
}

function pauseTimer() {
    clearInterval(timerID);
    timerID = null;
    isRunning = false;
    statusDisplay.textContent = "Dijeda ⏸️";
    updateButtonVisibility();
}

function continueTimer() {
    if (!isRunning && timeLeft > 0) {
        isRunning = true;
        updateStatusText();
        updateButtonVisibility();

        timerID = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            } else {
                clearInterval(timerID); 
                timerID = null;
                handleTimerComplete();
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timerID);
    timerID = null;
    isRunning = false;
    timeLeft = currentTimeMode;
    updateDisplay();
    startTimer();
}

// --- LOGIKA INTERNAL ---

function setTimeFromInput() {
    let minutes = 0;
    if (currentMode === 'focus') {
        minutes = document.getElementById("focus_duration").value;
    } else if (currentMode === 'short') {
        minutes = document.getElementById("short_duration").value;
    } else if (currentMode === 'long') {
        minutes = document.getElementById("long_duration").value;
    }

    // Validasi dasar: jika input kosong/error, pakai default 25
    timeLeft = (parseInt(minutes) || 25) * 60;
    currentTimeMode = timeLeft;
}

function updateStatusText() {
    if (currentMode === 'focus') statusDisplay.textContent = "Sedang FOKUS...🔥";
    else if (currentMode === 'short') statusDisplay.textContent = "Istirahat Pendek ☕";
    else if (currentMode === 'long') statusDisplay.textContent = "Istirahat Panjang 🏖️";
}

function handleTimerComplete() {
    isRunning = false;

    if (currentMode === 'focus') {
        cycleCount++;

        const durationVal = document.getElementById("focus_duration").value;
        saveFocusHistory(durationVal);

        // Cek apakah sudah 4 siklus
        if (cycleCount >= 4) {
            let confirmRepeat = confirm("Satu sesi pomodoro selesai! Apakah ingin lanjut belajar?");

            if (confirmRepeat) {
                cycleCount = 0;
                switchMode('long');
                startTimer();
            } else {
                alert("Sesi belajar dihentikan👋");
                cycleCount = 0;
                currentMode = 'focus';
                timeLeft = 0;
                updateStatusText();
                updateDisplay();
                updateButtonVisibility();
            }
        } else {
            // Short break biasa
            switchMode('short');
            startTimer();
        }
    }
    else if (currentMode === 'short') {
        switchMode('focus');
        startTimer();
    }
    else if (currentMode === 'long') {
        switchMode('focus');
        startTimer();
    }
}

function switchMode(newMode) {
    currentMode = newMode;
    timeLeft = 0; 
    updateStatusText();
}

function updateButtonVisibility() {
    if (!btnStart || !btnPause || !btnContinue || !btnQuit) return;

    if (isRunning) {
        // KONDISI 1: Timer Sedang Jalan
        btnStart.classList.add('hidden');
        btnPause.classList.remove('hidden');
        btnContinue.classList.add('hidden');
        btnQuit.classList.remove('hidden');

    } else {
        // KONDISI 2: Timer Berhenti (Pause, Reset, atau Belum Mulai)
        btnPause.classList.add('hidden');
        btnQuit.classList.add('hidden');

        if (timeLeft > 0) {
            // KONDISI 2a: Waktu Masih Ada (Artinya baru saja di-Pause)
            btnStart.classList.add('hidden');
            btnContinue.classList.remove('hidden');
        } else {
            // KONDISI 2b: Waktu Habis/Reset (Artinya siap mulai baru)
            btnStart.classList.remove('hidden');
            btnContinue.classList.add('hidden');
        }
    }
}

function clampInput(inputElement, min, max) {
    let val = parseFloat(inputElement.value);

    // Jika bukan angka
    if (isNaN(val)) {
        inputElement.value = min;
        return;
    }

    // Jika kurang dari 1
    if (val < 1) {
        alert("Tidak bisa menginput waktu terlalu sedikit, silakan masukan waktu lebih dari 1 menit.");
        inputElement.value = min;
        return;
    }

    // Ubah float menjadi integer
    val = Math.floor(val);

    // Clamp min/max
    if (val < min) {
        val = min;
    }

    if (val > max) {
        val = max;
    }

    inputElement.value = val;
}

function quitSession() {
    let confirmQuit = confirm("Yakin ingin berhenti belajar? Progress siklus akan direset.");

    if (confirmQuit) {
        clearInterval(timerID);
        timerID = null;
        isRunning = false;

        cycleCount = 0;
        currentMode = 'focus';
        timeLeft = 0;

        updateStatusText();
        updateDisplay();
        updateButtonVisibility();

        alert("Sesi belajar dihentikan👋");
    }
}

const focusInput = document.getElementById("focus_duration");
const shortInput = document.getElementById("short_duration");
const longInput = document.getElementById("long_duration");

if (focusInput) {
    focusInput.addEventListener('blur', () => clampInput(focusInput, 1, 60));
}
if (shortInput) {
    shortInput.addEventListener('blur', () => clampInput(shortInput, 1, 15));
}
if (longInput) {
    longInput.addEventListener('blur', () => clampInput(longInput, 1, 25));
}

if(btnStart) btnStart.addEventListener('click', startTimer);
if(btnPause) btnPause.addEventListener('click', pauseTimer);
if(btnContinue) btnContinue.addEventListener('click', continueTimer);
if(btnReset) btnReset.addEventListener('click', resetTimer);
if(btnQuit) btnQuit.addEventListener('click', quitSession);

updateDisplay();
updateButtonVisibility();
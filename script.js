let timeLeft = 0;
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
const longBreakBanner = document.getElementById("longBreakBanner");
const yesLongBreak = document.getElementById("yesLongBreak");
const noLongBreak = document.getElementById("noLongBreak");

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    if(timerDisplay) {
        timerDisplay.textContent = `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
    }
}

function showLongBreakBanner() {

    longBreakBanner.classList.remove('hidden');

    yesLongBreak.onclick = () => {

        longBreakBanner.classList.add('hidden');

        switchMode('long');
        startTimer();
    };

    noLongBreak.onclick = () => {

        longBreakBanner.classList.add('hidden');

        alert("Sesi belajar selesai 👋");

        resetTimer();
    };
}

function startTimer() {
    if (isRunning) return;

    // Jika waktu 0, berarti ini start baru. Ambil nilai dari input TERBARU.
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
            handleTimerComplete();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerID);
    isRunning = false;
    if(statusDisplay) statusDisplay.textContent = "Dijeda ⏸️";
    updateButtonVisibility(); // Munculkan tombol Continue
}

function continueTimer() {
    // Lanjutkan timer yang sedang dipause
    if (!isRunning && timeLeft > 0) {
        isRunning = true;
        updateStatusText();
        updateButtonVisibility(); // Sembunyikan Continue, munculkan Pause
        
        timerID = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            } else {
                handleTimerComplete();
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timerID);
    isRunning = false;
    timeLeft = 0; 
    currentMode = 'focus';
    cycleCount = 0;
    
    // Kembalikan display ke durasi default Focus
    let defaultMin = document.getElementById("focus_duration").value;
    if(timerDisplay) timerDisplay.textContent = `${defaultMin}:00`;
    
    if(statusDisplay) statusDisplay.textContent = "Siap Fokus";
    updateButtonVisibility(); // Pastikan tombol Start muncul
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
}

function updateStatusText() {
    if (!statusDisplay) return;
    if (currentMode === 'focus') statusDisplay.textContent = "Sedang FOKUS...🔥";
    else if (currentMode === 'short') statusDisplay.textContent = "Istirahat Pendek ☕";
    else if (currentMode === 'long') statusDisplay.textContent = "Istirahat Panjang 🏖️";
}

function handleTimerComplete() {
    clearInterval(timerID);
    isRunning = false;
    
    if (currentMode === 'focus') {
        cycleCount++;
        
        // Cek apakah sudah 4 siklus?
        if (cycleCount >= 4) {
            showLongBreakBanner();
        }else {
            // Short break biasa
            switchMode('short');
            startTimer(); // Auto-start
        }
    } 
    else if (currentMode === 'short') {
        switchMode('focus');
        startTimer(); // Kembali fokus
    } 
    else if (currentMode === 'long') {
        alert("Long Break Selesai! Siklus di-reset.");
        resetTimer(); // Reset total
    }
}

function switchMode(newMode) {
    currentMode = newMode;
    timeLeft = 0; // Paksa ambil nilai baru dari input saat start berikutnya
    updateStatusText();
}

function updateButtonVisibility() {
    if (!btnStart || !btnPause || !btnContinue) return;

    if (isRunning) {
        // KONDISI 1: Timer Sedang Jalan
        btnStart.classList.add('hidden');    // Start sembunyi
        btnPause.classList.remove('hidden'); // Pause keluar
        btnContinue.classList.add('hidden'); // Continue sembunyi
        
    } else {
        // KONDISI 2: Timer Berhenti (Pause atau Reset)
        btnPause.classList.add('hidden'); // Pause sembunyi
        
        if (timeLeft > 0) {
            // KONDISI 2a: Waktu Masih Ada (Artinya baru saja di-Pause)
            btnStart.classList.add('hidden');    // Start sembunyi
            btnContinue.classList.remove('hidden'); // Continue keluar
        } else {
            // KONDISI 2b: Waktu Habis/Reset (Artisi siap mulai baru)
            btnStart.classList.remove('hidden'); // Start keluar
            btnContinue.classList.add('hidden'); // Continue sembunyi
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
        alert("Tidak bisa menginput waktu terlalu sedikit, silahkan masukan waktu lebih dari 1 menit.");
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

updateDisplay();
updateButtonVisibility();

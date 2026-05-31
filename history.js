// history.js
const fs = require('fs');
const path = require('path');

const historyFilePath = path.join(__dirname, 'data', 'histori.txt');

function loadHistoryData() {
    const emptyMsg = document.getElementById('emptyStateMessage');
    const ctx = document.getElementById('historyChart').getContext('2d');

    // Reset tampilan
    if (!fs.existsSync(historyFilePath)) {
        showEmptyState(true);
        return;
    }

    const content = fs.readFileSync(historyFilePath, 'utf-8');
    const lines = content.trim().split('\n');
    
    // Hitung batas waktu 7 hari yang lalu
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    let dailyMinutes = [0, 0, 0, 0, 0, 0, 0];
    let hasDataInLast7Days = false;

    lines.forEach(line => {
        const dateMatch = line.match(/\[(.*?)\]/);
        if (!dateMatch) return;

        const dateObj = new Date(dateMatch[1]);
        
        // Cek apakah data masuk dalam 7 hari terakhir
        if (!isNaN(dateObj.getTime()) && dateObj >= sevenDaysAgo) {
            hasDataInLast7Days = true;
            const dayIndex = dateObj.getDay();
            
            const durationMatch = line.match(/Durasi:\s*(\d+)\s*Menit/);
            if (durationMatch) {
                dailyMinutes[dayIndex] += parseInt(durationMatch[1]);
            }
        }
    });

    if (!hasDataInLast7Days) {
        showEmptyState(true);
    } else {
        showEmptyState(false);
        renderChart(dailyMinutes);
    }
}

function showEmptyState(show) {
    const emptyMsg = document.getElementById('emptyStateMessage');
    const canvas = document.getElementById('historyChart');
    
    if (show) {
        emptyMsg.style.display = 'block';
        canvas.style.opacity = '0.3'; // Redupkan grafik latar belakang
    } else {
        emptyMsg.style.display = 'none';
        canvas.style.opacity = '1';
    }
}

function renderChart(dataValues) {
    const ctx = document.getElementById('historyChart').getContext('2d');
    
    // Hancurkan chart lama jika ada agar tidak tumpang tindih saat refresh
    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
            datasets: [{
                label: 'Menit Fokus',
                data: dataValues,
                backgroundColor: '#3b82f6', 
                borderColor: '#2563eb',
                borderWidth: 1,
                borderRadius: 4,
                barThickness: 50
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { 
                    display: true, 
                    text: 'Statistik Fokus 7 Hari Terakhir',
                    font: { size: 20, weight: 'bold' },
                    color: '#1e293b'
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    title: { display: true, text: 'Total Menit', color: '#475569' },
                    grid: { color: '#e2e8f0' }
                },
                x: { 
                    grid: { display: false },
                    ticks: { color: '#475569', font: { weight: 'bold' } }
                }
            }
        }
    });
}

loadHistoryData();
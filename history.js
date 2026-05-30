const fs = require('fs');
const path = require('path');

const historyFilePath = path.join(__dirname, 'data', 'histori.txt');
const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function loadHistoryData() {
    if (!fs.existsSync(historyFilePath)) {
        console.log("File histori belum ada.");
        renderChart([0,0,0,0,0,0,0]);
        return;
    }

    const content = fs.readFileSync(historyFilePath, 'utf-8');
    const lines = content.trim().split('\n');
    
    // Hitung batas waktu 7 hari yang lalu dari sekarang
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Array untuk total menit per hari (Index 0=Minggu, 1=Senin, dst)
    let dailyMinutes = [0, 0, 0, 0, 0, 0, 0];

    lines.forEach(line => {
        const dateMatch = line.match(/\[(.*?)\]/);
        if (!dateMatch) return;

        const dateObj = new Date(dateMatch[1]);
        
        // Diproses jika tanggalnya >= 7 hari yg lalu
        if (!isNaN(dateObj.getTime()) && dateObj >= sevenDaysAgo) {
            const dayIndex = dateObj.getDay(); // 0-6
            
            const durationMatch = line.match(/Durasi:\s*(\d+)\s*Menit/);
            
            if (durationMatch) {
                const minutes = parseInt(durationMatch[1]);
                dailyMinutes[dayIndex] += minutes;
            }
        }
    });

    console.log("Data 7 Hari Terakhir:", dailyMinutes);
    renderChart(dailyMinutes);
}

function renderChart(dataValues) {
    const ctx = document.getElementById('historyChart').getContext('2d');
    
    new Chart(ctx, {
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
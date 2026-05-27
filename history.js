const fs = require('fs');
const path = require('path');
const historyFilePath = path.join(__dirname, 'data', 'histori.txt');

function loadHistoryData() {
    if (!fs.existsSync(historyFilePath)) {
        console.log("File histori belum ada.");
        renderChart([0,0,0,0,0,0,0]);
        return;
    }

    const content = fs.readFileSync(historyFilePath, 'utf-8');
    const lines = content.trim().split('\n');
    
    let dailyMinutes = [0, 0, 0, 0, 0, 0, 0];

    lines.forEach(line => {
        const dateMatch = line.match(/\[(.*?)\]/);
        if (!dateMatch) return;

        const dateObj = new Date(dateMatch[1]);
        
        if (!isNaN(dateObj.getTime())) {
            const dayIndex = dateObj.getDay(); // 0-6 hari
            const durationMatch = line.match(/Durasi:\s*(\d+)\s*Menit/);
            
            if (durationMatch) {
                const minutes = parseInt(durationMatch[1]);
                dailyMinutes[dayIndex] += minutes;
            }
        }
    });

    console.log("Data Terproses:", dailyMinutes);
    renderChart(dailyMinutes);
}

function renderChart(dataValues) {
    const ctx = document.getElementById('historyChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
            datasets: [{
                label: 'Menit',
                data: dataValues,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { 
                    display: true, 
                    text: 'Statistik Fokus Mingguan',
                    font: { size: 18, weight: 'bold' }
                }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Menit' } },
                x: { grid: { display: false } }
            }
        }
    });
}

loadHistoryData();
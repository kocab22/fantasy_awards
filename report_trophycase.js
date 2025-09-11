// report_trophycase.js - načte a zobrazí awards_trophycase.json

async function loadTrophycase() {
    const trophyDiv = document.getElementById('trophycase');
    try {
        const response = await fetch('awards_trophycase.json');
        if (!response.ok) throw new Error('Soubor nenalezen nebo nelze načíst');
        const data = await response.json();
        renderTrophycase(data);
    } catch (err) {
        trophyDiv.innerHTML = `<div class='error-message'>Trofeje se nepodařilo načíst. (${err.message})</div>`;
    }
}

function renderTrophycase(data) {
    const trophyDiv = document.getElementById('trophycase');
    if (!data || Object.keys(data).length === 0) {
        trophyDiv.innerHTML = '<em>Žádné trofeje zatím nebyly uděleny.</em>';
        return;
    }
    // Mapování typů na emoji a popisek
    const awardMeta = [
        { type: 'king', label: '👑', name: 'KING' },
        { type: 'rocketeer', label: '🚀', name: 'RAKEŤÁK' },
        { type: 'drevak', label: '🥾', name: 'DŘEVÁK' },
        { type: 'most_goals', label: '⚽️', name: 'STŘELEC' },
    { type: 'down_the_toilet', label: '🪂', name: 'PADÁK' },
        { type: 'smooth_brain', label: '🪑', name: 'LAVIČKA' },
        { type: 'karbanik', label: '🃏', name: 'KARBANÍK' },
    ];
    // Manažeři abecedně
        const managers = Object.keys(data).sort((a,b)=>a.localeCompare(b,'cs'));
        let rangeStart = 1;
        let rangeEnd = managers.length;
        // Vytvořit slidery jednou
        let html = `<h2 id="trophycase-title">Polička trofejí 🏆</h2>`;
        html += `<div class="trophycase-slider-container" style="text-align:center; margin-bottom:1em;">
            <input type="range" id="trophy-range-start" min="1" max="${managers.length}" value="1" style="width:120px; margin-bottom:8px;">
            <input type="range" id="trophy-range-end" min="1" max="${managers.length}" value="${managers.length}" style="width:120px; margin-bottom:8px; margin-left:16px;">
        </div>`;
        html += `<div id="trophycase-table-container"></div>`;
        trophyDiv.innerHTML = html;

        function renderTable(start, end) {
            let tableHtml = `<div class="trophycase-table-wrap"><table class="trophycase-table"><thead><tr><th>Manažer</th>`;
            awardMeta.forEach(meta => {
                tableHtml += `<th>${meta.label}<br><span class='trophycase-award-name'>${meta.name}</span></th>`;
            });
            tableHtml += `</tr></thead><tbody>`;
            for (let i = start - 1; i < end && i < managers.length; i++) {
                const manager = managers[i];
                tableHtml += `<tr><td class="trophycase-manager">${manager}</td>`;
                awardMeta.forEach(meta => {
                    const count = (data[manager] && data[manager][meta.type]) ? data[manager][meta.type].length : 0;
                    tableHtml += `<td class="trophycase-cell">${count > 0 ? meta.label.repeat(count) : ''}</td>`;
                });
                tableHtml += `</tr>`;
            }
            tableHtml += `</tbody></table></div>`;
            return tableHtml;
        }
        function updateTable() {
            const startInput = document.getElementById('trophy-range-start');
            const endInput = document.getElementById('trophy-range-end');
            rangeStart = parseInt(startInput.value, 10);
            rangeEnd = parseInt(endInput.value, 10);
            if (rangeStart > rangeEnd) {
                if (this === startInput) {
                    rangeEnd = rangeStart;
                    endInput.value = rangeEnd;
                } else {
                    rangeStart = rangeEnd;
                    startInput.value = rangeStart;
                }
            }
            document.getElementById('trophycase-table-container').innerHTML = renderTable(rangeStart, rangeEnd);
        }
        // První render tabulky
        document.getElementById('trophycase-table-container').innerHTML = renderTable(rangeStart, rangeEnd);
        // Event listenery na slidery
        document.getElementById('trophy-range-start').addEventListener('input', updateTable);
        document.getElementById('trophy-range-end').addEventListener('input', updateTable);
}

// Načti poličku trofejí po načtení stránky
window.addEventListener('DOMContentLoaded', () => {
    loadTrophycase();
});

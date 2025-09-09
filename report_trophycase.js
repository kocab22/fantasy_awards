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
        { type: 'down_the_toilet', label: '🚽', name: 'SPLACHOVADLO' },
        { type: 'smooth_brain', label: '🪑', name: 'LAVIČKA' },
        { type: 'karbanik', label: '🃏', name: 'KARBANÍK' },
    ];
    // Manažeři abecedně
    const managers = Object.keys(data).sort((a,b)=>a.localeCompare(b,'cs'));
    let html = `<h2 id="trophycase-title">Polička trofejí 🏆</h2>`;
    html += `<div class="trophycase-table-wrap"><table class="trophycase-table"><thead><tr><th>Manažer</th>`;
    awardMeta.forEach(meta => {
        html += `<th>${meta.label}<br><span class='trophycase-award-name'>${meta.name}</span></th>`;
    });
    html += `</tr></thead><tbody>`;
    managers.forEach(manager => {
        html += `<tr><td class="trophycase-manager">${manager}</td>`;
        awardMeta.forEach(meta => {
            const count = (data[manager] && data[manager][meta.type]) ? data[manager][meta.type].length : 0;
            html += `<td class="trophycase-cell">${count > 0 ? meta.label.repeat(count) : ''}</td>`;
        });
        html += `</tr>`;
    });
    html += `</tbody></table></div>`;
    trophyDiv.innerHTML = html;
}

// Načti poličku trofejí po načtení stránky
window.addEventListener('DOMContentLoaded', () => {
    loadTrophycase();
});

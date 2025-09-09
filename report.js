// report.js - načte a zobrazí league_analysis_gw2.json (nebo jiné GW)

async function loadReport(gw = 3) {
    // Oprava cesty: načítat přímo ze složky web/
    const awardsGrid = document.getElementById('awards-grid');
    const leagueTable = document.getElementById('league-table');
    const eoDiv = document.getElementById('eo');
    const awardsTitle = document.getElementById('awards-title');
    try {
        // Načti hlavní report
        const response = await fetch(`league_analysis_gw${gw}.json`);
        if (!response.ok) throw new Error('Soubor nenalezen nebo nelze načíst');
        const data = await response.json();

        // Načti event_live_gwX.json
        let eventLiveResp = await fetch(`event_live_gw${gw}.json`);
        if (eventLiveResp.ok) {
            window.lastEventLiveData = await eventLiveResp.json();
        } else {
            window.lastEventLiveData = null;
        }
        // Načti players_data_gwX.json
        let playerDataResp = await fetch(`players_data_gw${gw}.json`);
        if (playerDataResp.ok) {
            window.lastPlayerData = await playerDataResp.json();
        } else {
            window.lastPlayerData = null;
        }

        window.lastReportData = data;
        window.lastLeagueTable = data.league_table;
    // awardsTitle nastavuje titulek trofejí
    if (awardsTitle) awardsTitle.textContent = `GW${data.gameweek} – trofeje 🏆`;
        renderAwards(data.awards);
        renderTable(data.league_table);
        renderEO(data.effective_ownership);
    } catch (err) {
        // Vymaž starý obsah a zobraz error hlášku
    // odstraněno: meta
        if (awardsTitle) awardsTitle.textContent = '';
        if (awardsGrid) awardsGrid.innerHTML = '';
        if (leagueTable) leagueTable.innerHTML = '';
        if (eoDiv) eoDiv.innerHTML = '';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = `Data pro GW${gw} se nepodařilo načíst. (${err.message})`;
        if (awardsGrid) awardsGrid.appendChild(errorDiv);
    }
}


function renderAwards(awards) {
    const awardsGrid = document.getElementById('awards-grid');
    awardsGrid.innerHTML = '';
    if (!awards || awards.length === 0) return;
    // Překlady a popisky
    const meta = {
        king:    { icon: '👑', header: 'KING', desc: 'Nejlepší GW', color: 'award-king', value: a => `${a.points} pts` },
        drevak:    { icon: '🥾', header: 'DŘEVÁK', desc: 'Nejhorší GW', color: 'award-drevak', value: a => `${a.points} pts` },
        most_goals: { icon: '⚽️', header: 'STŘELEC', desc: 'Nejvíc gólů', color: 'award-most_goals', value: a => `${a.goals}×⚽️` },
        rocketeer: { icon: '🚀', header: 'RAKEŤÁK', desc: 'Největší posun', color: 'award-rocketeer', value: a => `${a.rank_movement > 0 ? '+' : ''}${a.rank_movement} míst` },
    down_the_toilet: { icon: '🚽', header: 'SPLACHOVAČ', desc: 'Největší propad', color: 'award-down_the_toilet', value: a => `${a.rank_movement} míst` },
        smooth_brain: { icon: '🪑', header: 'LAVIČKA', desc: 'Nejvíc bodů na lavičce', color: 'award-bench', value: a => `${a.bench_points} pts` },
        karbanik: { icon: '🃏', header: 'KARBANÍK', desc: 'Nejvíc karet v GW', color: 'award-karbanik', value: a => '' },
    };
    awards.forEach(a => {
        const m = meta[a.type] || { icon: '', header: a.type, desc: '', color: 'award-default', value: () => '' };
        const box = document.createElement('div');
        box.className = `award-box ${m.color}`;
        let managers = '';
        let valueHtml = m.value(a);
    if (a.type === 'karbanik' && Array.isArray(a.manager_names) && Array.isArray(a.yellow) && Array.isArray(a.red)) {
            if (a.manager_names.length === 1) {
                // Pokud je jen jeden vítěz, emoji karet nahoru
                valueHtml = '';
                if (a.yellow[0] > 0) valueHtml += '🟨'.repeat(a.yellow[0]);
                if (a.red[0] > 0) valueHtml += '🟥'.repeat(a.red[0]);
                managers = a.manager_names[0];
            } else {
                // Pokud je více vítězů, zobrazit jména a emoji dole
                valueHtml = '';
                managers = a.manager_names.map((name, i) => {
                    let emoji = '';
                    if (a.yellow[i] > 0) emoji += '🟨'.repeat(a.yellow[i]);
                    if (a.red[i] > 0) emoji += '🟥'.repeat(a.red[i]);
                    return `${name} ${emoji}`;
                }).join('<br>');
            }
        } else if (Array.isArray(a.manager_names)) {
            managers = a.manager_names.join(', ');
        } else if (a.manager_name) {
            managers = a.manager_name;
        }
        let managerHtml = '';
        // Pokud je managers pole, zobraz každého pod sebou
        if (Array.isArray(managers)) {
            managerHtml = `<div class=\"award-manager\">${managers.map(name => `<div>${name}</div>`).join('')}</div>`;
        } else if (typeof managers === 'string' && managers.includes(',')) {
            // Pokud je to string s čárkami, rozděl na pole
            managerHtml = `<div class=\"award-manager\">${managers.split(',').map(name => `<div>${name.trim()}</div>`).join('')}</div>`;
        } else {
            managerHtml = `<div class=\"award-manager\">${managers}</div>`;
        }
        box.innerHTML = `
            <div class=\"award-header\"><span class='emoji'>${m.icon}</span> <span>${m.header}</span></div>
            ${valueHtml ? `<div class=\"award-value\">${valueHtml}</div>` : ''}
            <div class=\"award-desc\">${m.desc}</div>
            ${managerHtml}
        `;
        awardsGrid.appendChild(box);
    });
}

function renderTable(table) {
    const div = document.getElementById('league-table');
    if (!table || table.length === 0) { div.innerHTML = '<em>Žádná data</em>'; return; }
    // Seřadit podle celkových bodů
    table.sort((a,b)=>b['Total Points']-a['Total Points']);
    // Přidat input pro počet zobrazených manažerů do manager-count-container
    const managerCountContainer = document.getElementById('manager-count-container');
    managerCountContainer.innerHTML = `<label for="manager-count">Počet manažerů: </label><input type="number" id="manager-count" min="1" max="${table.length}" value="${Math.min(10, table.length)}" style="width:60px; margin-bottom:8px;">`;
    let html = `<table class="custom-league-table"><thead><tr>
        <th>Pořadí</th>
        <th>Tým</th>
        <th>Manažer</th>
        <th>Body (celkem)</th>
        <th>Body (GW) + chip</th>
        <th>Kapitán (body)</th>
        <th>Transf. (body)</th>
    </tr></thead><tbody>`;
    // Výchozí počet zobrazených manažerů
    let managerCount = Math.min(10, table.length);
    function renderRows(count) {
        let rows = '';
        for (let i = 0; i < Math.min(count, table.length); i++) {
            const row = table[i];
            let posun = row['Rank Movement'] || 0;
            let posunStr = '';
            if (posun > 0) posunStr = ` <span style='color: #3bb54a;'>(+${posun})</span>`;
            else if (posun < 0) posunStr = ` <span style='color: #e53935;'>(-${Math.abs(posun)})</span>`;
            let chip = row['Chip Used'] && row['Chip Used'] !== 'No Chip Used' ? `<span class='chip-label'>${row['Chip Used']}</span>` : '';
            let cap = row['Captain'] ? `${row['Captain']} (${row['Captain Points']})` : '';
            // Transfery: barevné zvýraznění
            let trans = '';
            if (row['Transfers'] !== undefined) {
                const match = row['Transfers'].match(/\(([-+][0-9]+)\)/);
                if (match) {
                    const val = parseInt(match[1], 10);
                    const color = val > 0 ? '#3bb54a' : (val < 0 ? '#e53935' : 'inherit');
                    trans = row['Transfers'].replace(/\(([-+][0-9]+)\)/, `<span style='color:${color};'>($1)</span>`);
                } else {
                    trans = row['Transfers'];
                }
            }
            rows += `<tr>
                <td>${i+1}${posunStr}</td>
                <td>${row['Team Name']}</td>
                <td>${row['Manager']}</td>
                <td>${row['Total Points']}</td>
                <td>${row['GW Points']}${chip ? ' ' + chip : ''}</td>
                <td>${cap}</td>
                <td>${trans}</td>
            </tr>`;
        }
        return rows;
    }
    html += renderRows(managerCount);
    html += '</tbody></table>';
    div.innerHTML = html;
    // Event listener pro input
    const input = document.getElementById('manager-count');
    input.addEventListener('input', function() {
        let val = parseInt(this.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val > table.length) val = table.length;
        this.value = val;
        // Přegeneruj řádky tabulky
        const tbody = div.querySelector('tbody');
        tbody.innerHTML = renderRows(val);
    });
}

function renderEO(eo) {
    const div = document.getElementById('eo');
    const topDiv = document.getElementById('top-captain');
    if (!eo || eo.length === 0) { div.innerHTML = '<em>Žádná data</em>'; if (topDiv) topDiv.innerHTML = ''; return; }
    // Získat body hráčů z event_live_gwX.json (window.lastEventLiveData)
    let eventLive = window.lastEventLiveData || null;
    // Mapování hráč -> body za GW (vynásobeno dvěma)
    const playerPoints = {};
    if (eventLive && eventLive.elements) {
        eventLive.elements.forEach(el => {
            if (el && el.id && el.stats && typeof el.stats.total_points === 'number') {
                playerPoints[el.id] = el.stats.total_points * 2;
            }
        });
    }
    // Získat mapping jméno hráče -> id a id -> jméno
    let playerNameToId = {};
    let playerIdToName = {};
    if (window.lastPlayerData && window.lastPlayerData.elements) {
        window.lastPlayerData.elements.forEach(el => {
            playerNameToId[el.web_name] = el.id;
            playerIdToName[el.id] = el.web_name;
        });
    }
    // Najít všechny kapitány z league_table
    let leagueTable = window.lastLeagueTable || [];
    let usedCaptains = new Set();
    leagueTable.forEach(row => {
        if (row['Captain']) usedCaptains.add(row['Captain']);
    });
    // Najít TOP kapitána (zvoleného někým v mini lize)
    let topCaptainPoints = -Infinity;
    let topCaptains = [];
    usedCaptains.forEach(name => {
        let id = playerNameToId[name];
        let pts = id && playerPoints[id] !== undefined ? playerPoints[id] : null;
        if (pts !== null) {
            if (pts > topCaptainPoints) {
                topCaptainPoints = pts;
                topCaptains = [name];
            } else if (pts === topCaptainPoints) {
                topCaptains.push(name);
            }
        }
    });
    if (topDiv) {
        if (topCaptains.length > 0 && topCaptainPoints !== -Infinity) {
            const names = topCaptains.map(name => `<b>${name}</b>`).join(', ');
            topDiv.innerHTML = `<div class="top-captain-box">TOP kapitán(i) kola: ${names} (${topCaptainPoints} bodů)</div>`;
        } else {
            topDiv.innerHTML = '';
        }
    }
    let html = `<table class="custom-league-table eo-table"><thead><tr>
        <th>Hráč</th>
        <th>EO (%)</th>
        <th>Body (GW)</th>
    </tr></thead><tbody>`;
    eo.forEach(row => {
        let playerId = playerNameToId[row.player];
        let pts = playerId && playerPoints[playerId] !== undefined ? playerPoints[playerId] : '';
        html += `<tr><td>${row.player}</td><td>${row.percent.toFixed(1)}</td><td>${pts}</td></tr>`;
    });
    html += '</tbody></table>';
    div.innerHTML = html;
}

// Načti report po načtení stránky
window.addEventListener('DOMContentLoaded', () => {
    // Find available GW files (assume GW1-38, or you can scan directory in Python and output available GWs)
    const maxGW = 38;
    const selector = document.getElementById('gw-selector');
    if (selector) {
        // Populate selector with GW options
        for (let gw = 1; gw <= maxGW; gw++) {
            const opt = document.createElement('option');
            opt.value = gw;
            opt.textContent = `GW${gw}`;
            selector.appendChild(opt);
        }
        // Default to GW3 (or latest available)
        selector.value = 3;
        selector.addEventListener('change', () => {
            loadReport(Number(selector.value));
        });
        loadReport(Number(selector.value));
    } else {
        // Fallback: just load GW3
        loadReport(3);
    }
});

/* ----------------------------------------------------
   MOTOR DE LÓGICA E BANCO DE DADOS - WOLFSIDE RP
   Estilo AAA Premium - Roxo Neon & Google Sheets Database
   ---------------------------------------------------- */

// Configurações Globais do Banco de Dados no Firebase
const SYSTEM_CONFIG = {
    firebase: {
        apiKey: "AIzaSyBM8kxJItghuuZ5DCgEzZW9ih145Bfdkhg",
        databaseURL: "https://wolfside-rp-dashboard-default-rtdb.firebaseio.com",
        projectId: "wolfside-rp-dashboard"
    }
};

// Configuração Padrão de Fábrica com as 13 Coordenadas e Controle de Segurança (Banco Limpo)
const DEFAULT_STATE = {
    mainTitle: "WOLFSIDE ROLEPLAY",
    mainSubtitle: "PAINEL INFORMATIVO DO SERVIDOR &bull; GERENCIADOR DE FACÇÕES",
    footerText: "&copy; 2026 WOLFSIDE RP - TODOS OS DIREITOS RESERVADOS. PROMPT E TEMPLATE EDITÁVEIS.",
    
    // Lista de Administradores e Membros Autorizados por Padrão (Discord IDs ou City IDs)
    authorizedIds: ["1085341634914418708", "321658631672168455", "267818860332318720"],
    
    selectedFaction: "",
    factions: [],
    qgs: [],
    sheetsData: {}
};

// Gerenciamento de Estado de Runtime (Banco de Dados Centralizado estritamente na nuvem)
let state = JSON.parse(JSON.stringify(DEFAULT_STATE));
let isAuthenticated = false; // Controle de bloqueio de escrita

// Elementos da DOM
const syncIndicator = document.getElementById('sync-indicator');
const activeModeTag = document.getElementById('active-mode-tag');
const btnOpenSettings = document.getElementById('btn-open-settings');
const btnCloseModal = document.getElementById('btn-close-modal');
const settingsModal = document.getElementById('settings-modal');
const btnSaveSettings = document.getElementById('btn-save-settings');

const btnAuthStatus = document.getElementById('btn-auth-status');
const authLockIcon = document.getElementById('auth-lock-icon');
const authStatusText = document.getElementById('auth-status-text');

// Modais adicionais
const createFactionModal = document.getElementById('create-faction-modal');
const btnCloseCreateModal = document.getElementById('btn-close-create-modal');
const btnCancelCreate = document.getElementById('btn-cancel-create');
const btnConfirmCreate = document.getElementById('btn-confirm-create');

const authModal = document.getElementById('auth-modal');
const btnCloseAuthModal = document.getElementById('btn-close-auth-modal');
const btnSubmitAuth = document.getElementById('btn-submit-auth');
const btnLogout = document.getElementById('btn-logout');
const authInputId = document.getElementById('auth-input-id');

const mainTitle = document.getElementById('main-title');
const mainSubtitle = document.getElementById('main-subtitle');
const footerText = document.getElementById('footer-text');
const footerTime = document.getElementById('footer-time');

// Elementos da Estrutura Split-Panel
const factionListContainer = document.getElementById('faction-list-container');
const consoleWorkspaceArea = document.getElementById('console-workspace-area');
const factionSearchInput = document.getElementById('faction-search');
const btnOpenCreateFaction = document.getElementById('btn-open-create-faction');

const excelDropZone = document.getElementById('excel-drop-zone');
const excelFileInput = document.getElementById('excel-file-input');
const excelFileStatus = document.getElementById('excel-file-status');

// Inputs Firebase
const firebaseApiKeyInput = document.getElementById('firebase-api-key');
const firebaseDbUrlInput = document.getElementById('firebase-db-url');
const firebaseProjectIdInput = document.getElementById('firebase-project-id');
const btnConnectSheets = document.getElementById('btn-connect-sheets');

const btnExportData = document.getElementById('btn-export-data');
const btnResetData = document.getElementById('btn-reset-data');

// Estado das abas e pesquisas
let factionSearchQuery = '';
let factionFilterActive = 'all'; // 'all' | 'livres' | 'entregues' | 'comerciais'
let syncTimeout = null;

// Helper de Configuração do Firebase
function getFirebaseConfig() {
    return {
        apiKey: localStorage.getItem('wolfside_firebase_api_key') || SYSTEM_CONFIG.firebase.apiKey || '',
        databaseURL: localStorage.getItem('wolfside_firebase_db_url') || SYSTEM_CONFIG.firebase.databaseURL || '',
        projectId: localStorage.getItem('wolfside_firebase_project_id') || SYSTEM_CONFIG.firebase.projectId || '',
        enabled: true
    };
}

function saveFirebaseConfig(apiKey, dbUrl, projectId) {
    localStorage.setItem('wolfside_firebase_api_key', apiKey);
    localStorage.setItem('wolfside_firebase_db_url', dbUrl);
    localStorage.setItem('wolfside_firebase_project_id', projectId);
}

// ----------------------------------------------------
// 1. MOTOR DE SEGURANÇA & CONTROLE DE ACESSO (Decentralized ID Flow)
// ----------------------------------------------------

async function checkAuthStatus() {
    const savedUserId = localStorage.getItem('wolfside_user_id');
    
    if (savedUserId && state.authorizedIds.includes(savedUserId)) {
        isAuthenticated = true;
        updateAuthUI(true, `MEMBRO AUTORIZADO (${savedUserId})`);
        return true;
    } else {
        isAuthenticated = false;
        updateAuthUI(false, "LEITURA (BLOQUEADO)");
        return false;
    }
}

function updateAuthUI(isAuth, label) {
    if (isAuth) {
        btnAuthStatus.className = "system-mode-tag btn-auth-unlocked";
        authLockIcon.setAttribute('data-lucide', 'unlock');
        authLockIcon.style.color = "#00ffaa";
        authStatusText.innerText = label;
        btnLogout.style.display = "inline-block";
        if (btnOpenCreateFaction) btnOpenCreateFaction.classList.remove('locked-hud-el');
    } else {
        btnAuthStatus.className = "system-mode-tag btn-auth-locked";
        authLockIcon.setAttribute('data-lucide', 'lock');
        authLockIcon.style.color = "var(--purple-neon)";
        authStatusText.innerText = label;
        btnLogout.style.display = "none";
        if (btnOpenCreateFaction) btnOpenCreateFaction.classList.add('locked-hud-el');
    }
    lucide.createIcons();
}

// ----------------------------------------------------
// 2. MOTOR DE PARTÍCULAS EM CANVAS (EFEITOS NEON 2D)
// ----------------------------------------------------
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 70;
let mouse = { x: null, y: null, radius: 140 };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 50;
        this.size = Math.random() * 3.2 + 0.6;
        this.speedY = -(Math.random() * 0.8 + 0.3);
        this.speedX = (Math.random() * 0.4 - 0.2);
        this.alpha = Math.random() * 0.5 + 0.2;
        this.color = Math.random() > 0.2 ? '186, 85, 211' : '255, 255, 255';
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        
        if (mouse.x !== null && mouse.y !== null) {
            let dx = this.x - mouse.x;
            let dy = this.y - mouse.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
                let force = (mouse.radius - distance) / mouse.radius;
                let angle = Math.atan2(dy, dx);
                this.x += Math.cos(angle) * force * 3;
                this.y += Math.sin(angle) * force * 3;
            }
        }

        if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.shadowBlur = this.size * 2;
        ctx.shadowColor = `rgba(${this.color}, 0.8)`;
        ctx.fill();
        ctx.restore();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    requestAnimationFrame(animateParticles);
}

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

initParticles();
animateParticles();

// ----------------------------------------------------
// 3. CONTROLE DO BANCO DE DADOS (GOOGLE SHEETS API)
// ----------------------------------------------------

function setSyncStatus(status) {
    const indicator = document.getElementById('sync-indicator');
    const textEl = document.getElementById('sync-text');
    if (!indicator) return;
    
    indicator.className = 'status-indicator';
    indicator.style.backgroundColor = '';
    indicator.style.boxShadow = '';
    
    if (status === 'connecting') {
        indicator.classList.add('syncing');
        if (textEl) textEl.innerText = " CONECTANDO...";
    } else if (status === 'syncing') {
        indicator.classList.add('syncing');
        if (textEl) textEl.innerText = " EXECUTANDO SYNC...";
    } else if (status === 'online') {
        indicator.classList.add('online');
        if (textEl) textEl.innerText = " CONECTADO FIREBASE";
    } else if (status === 'error') {
        indicator.style.backgroundColor = '#ff3366';
        indicator.style.boxShadow = '0 0 10px #ff3366';
        if (textEl) textEl.innerText = " ERRO DE CONEXÃO";
    }
}

let db = null;
let firebaseInitialized = false;
let fbRef = null;

async function initFirebase() {
    const config = getFirebaseConfig();
    
    if (!config.apiKey || !config.databaseURL) {
        setSyncStatus('error');
        return false;
    }

    setSyncStatus('connecting');

    try {
        const firebaseConfig = {
            apiKey: config.apiKey,
            databaseURL: config.databaseURL,
            projectId: config.projectId
        };

        // Se já houver um app ativo, deleta para aplicar as novas configurações
        if (firebase.apps.length > 0) {
            await firebase.app().delete();
        }
        
        firebase.initializeApp(firebaseConfig);
        
        db = firebase.database();
        fbRef = db.ref("wolfside_state");
        firebaseInitialized = true;
        setSyncStatus('online');
        
        // Escuta atualizações do banco de dados em tempo real
        fbRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Preservar a facção selecionada pelo usuário localmente para não atrapalhar navegação
                const currentSelected = state.selectedFaction;
                
                // Comparar ignorando a facção selecionada
                const compareData = { ...data, selectedFaction: null };
                const compareState = { ...state, selectedFaction: null };
                
                if (JSON.stringify(compareData) !== JSON.stringify(compareState)) {
                    console.log("Atualização recebida em tempo real!");
                    // CORREÇÃO: Firebase omite arrays vazios. Garantir que todos os campos
                    // obrigatórios existam mesclando com o DEFAULT_STATE.
                    state = {
                        ...JSON.parse(JSON.stringify(DEFAULT_STATE)),
                        ...data,
                        factions: Array.isArray(data.factions) ? data.factions : [],
                        qgs: Array.isArray(data.qgs) ? data.qgs : [],
                        sheetsData: (data.sheetsData && typeof data.sheetsData === 'object') ? data.sheetsData : {},
                        authorizedIds: Array.isArray(data.authorizedIds) ? data.authorizedIds : DEFAULT_STATE.authorizedIds
                    };
                    state.selectedFaction = currentSelected || data.selectedFaction || "";
                    checkAuthStatus().then(() => {
                        renderAll();
                    });
                    showToast("Dados atualizados em tempo real!");
                }
            } else {
                // Se o Firebase estiver vazio (ex: nova instalação ou reset),
                // inicializa com o estado padrão centralizado
                console.log("Banco de dados vazio no Firebase. Inicializando com padrão...");
                state = JSON.parse(JSON.stringify(DEFAULT_STATE));
                writeSheetsData(true);
                checkAuthStatus().then(() => {
                    renderAll();
                });
            }
        }, (error) => {
            console.error("Erro na escuta do Firebase:", error);
            setSyncStatus('error');
            showErrorState("Erro ao ler do Firebase. Verifique se as Regras da Base de Dados estão públicas (.read: true, .write: true).");
        });

        return true;
    } catch (err) {
        console.error("Falha ao inicializar o Firebase:", err);
        setSyncStatus('error');
        firebaseInitialized = false;
        return false;
    }
}

async function readSheetsData() {
    const config = getFirebaseConfig();
    if (!firebaseInitialized || !fbRef) return null;

    try {
        const snapshot = await fbRef.once('value');
        return snapshot.val();
    } catch (err) {
        console.error("Erro ao ler do Firebase:", err);
        setSyncStatus('error');
        throw err;
    }
}

async function writeSheetsData(force = false) {
    const config = getFirebaseConfig();
    if ((!isAuthenticated && !force) || !firebaseInitialized || !fbRef) return;

    setSyncStatus('syncing');
    
    try {
        await fbRef.set(state);
        setSyncStatus('online');
        showToast("Sincronizado com Firebase!");
    } catch (err) {
        console.error("Erro ao escrever no Firebase:", err);
        setSyncStatus('error');
        showToast("Erro ao sincronizar com o Firebase!", "error");
    }
}

async function startSheetsPolling() {
    await initFirebase();
}

// ----------------------------------------------------
// 4. PERSISTÊNCIA LOCAL
// ----------------------------------------------------

function saveState(immediate = false) {
    if (syncTimeout) clearTimeout(syncTimeout);
    
    if (immediate) {
        writeSheetsData();
    } else {
        syncTimeout = setTimeout(() => {
            writeSheetsData();
        }, 1000);
    }
}

// ----------------------------------------------------
// 5. PARSER DE EXCEL DINÂMICO COM AS 13 COORDENADAS
// ----------------------------------------------------

function handleExcelFile(file) {
    if (!file) return;
    
    excelFileStatus.innerText = "Lendo arquivo...";
    excelFileStatus.className = "file-loaded-status loaded";
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            
            let faccoesSheet = workbook.Sheets['FACÇÕES'] || workbook.Sheets[workbook.SheetNames[0]];
            let qgSheet = workbook.Sheets['SETFAC+LIDER+ID'] || workbook.Sheets['QGs'] || workbook.Sheets[workbook.SheetNames[1]];
            
            if (faccoesSheet) {
                const rows = XLSX.utils.sheet_to_json(faccoesSheet, {header: 2});
                const parsedFactions = [];
                
                rows.forEach((r) => {
                    let fac = r['FACÇÃO'] || r['FACAO'] || '';
                    if (fac && fac !== 'FACÇÃO' && fac !== 'FACAO') {
                        parsedFactions.push({
                            setor: r['SETOR'] || '',
                            faccao: fac,
                            set: r['NOME DO SET'] || '',
                            lider: r['NOME DO 00'] || '',
                            idDiscord: r['ID DISCORD'] || '',
                            entregue: r['FAC ENTREGUE'] || '',
                            id: r['ID'] || '',
                            status: r['STATUS'] || 'LIVRE',
                            cds: r['CDS'] || '',
                            inicial: r['KIT INICIAL'] || '0'
                        });
                    }
                });
                
                if (parsedFactions.length > 0) {
                    state.factions = parsedFactions;
                }
            }
            
            if (qgSheet) {
                const rows = XLSX.utils.sheet_to_json(qgSheet, {header: 5});
                const parsedQGs = [];
                
                rows.forEach((r) => {
                    let fac = r['FACÇÃO'] || r['FACAO'] || '';
                    if (fac) {
                        parsedQGs.push({
                            prod: r['PRODUÇÃO'] || r['PRODUO'] || 'RECURSOS',
                            faccao: fac,
                            qg: r['QG'] || '',
                            lider: r['NOME DO 00'] || '',
                            id: r['ID'] || '',
                            radio: r['RÁDIO'] || r['RDIO'] || '',
                            status: r['STATUS'] || 'LIVRE',
                            local: r[' Local do QG'] || r['LOCAL'] || '',
                            initial: r['KIT INICIAL'] || '0'
                        });
                    }
                });
                
                if (parsedQGs.length > 0) {
                    state.qgs = parsedQGs;
                }
            }

            state.sheetsData = state.sheetsData || {};
            workbook.SheetNames.forEach(sheetName => {
                const sheet = workbook.Sheets[sheetName];
                const range = XLSX.utils.sheet_to_json(sheet, {header: 1, defval: ''});
                
                if (range.length > 5) {
                    const firstCell = (range[0][0] || '').toString().toUpperCase();
                    if (firstCell.includes("QG") || firstCell.includes("PRODUÇÃO") || firstCell.includes("PRODUÇAO")) {
                        const keyName = sheetName.trim().toUpperCase();
                        
                        const parsedMembers = [];
                        for (let r = 10; r < Math.min(range.length, 30); r++) {
                            const rankVal = (range[r] && range[r][3]) ? range[r][3].toString().trim() : '';
                            if (rankVal && (rankVal === '00' || rankVal === '01' || rankVal === '02' || rankVal === '03' || rankVal.match(/^\d+$/))) {
                                const nameVal = (range[r+1] && range[r+1][3]) ? range[r+1][3].toString().trim() : '';
                                const discordIdVal = (range[r+1] && range[r+1][4]) ? range[r+1][4].toString().trim() : '';
                                const cityIdVal = (range[r+1] && range[r+1][5]) ? range[r+1][5].toString().trim() : '';
                                
                                if (nameVal || discordIdVal || cityIdVal) {
                                    parsedMembers.push({
                                        rank: rankVal,
                                        name: nameVal,
                                        discordId: discordIdVal,
                                        cityId: cityIdVal
                                    });
                                }
                            }
                        }
                        
                        state.sheetsData[keyName] = {
                            title: range[0][0] || sheetName,
                            discord: range[1][1] || '',
                            coords: range[2][1] || '',
                            craft: range[4][1] || '',
                            chestLeader: range[6][1] || '',
                            chestSupervisor: range[7][1] || '',
                            chestMember: range[8][1] || '',
                            farm: range[10][1] || '',
                            delivery: range[11] ? range[11][1] : '',
                            garagePersonal: range[12] ? range[12][1] : '',
                            garageFaction: range[13] ? range[13][1] : '',
                            utilities: range[14] ? range[14][1] : '',
                            farmCow: range[15] ? range[15][1] : '',
                            farmFishing: range[16] ? range[16][1] : '',
                            farmAfk: range[17] ? range[17][1] : '',
                            tacticalRadio: range[5][3] || '',
                            operationalRadio: range[5][4] || '',
                            generalRadio: range[5][5] || '',
                            members: parsedMembers
                        };
                    }
                }
            });
            
            if (state.factions.length > 0) {
                state.selectedFaction = state.factions[0].faccao;
            }
            saveState();
            renderAll();
            
            excelFileStatus.innerText = file.name + " carregado com sucesso!";
            showToast("Planilha e abas de facção importadas com sucesso!");
            
            setTimeout(() => {
                settingsModal.classList.remove('active');
            }, 800);
            
        } catch (err) {
            console.error(err);
            excelFileStatus.innerText = "Erro ao processar arquivo!";
            excelFileStatus.className = "file-loaded-status";
            showToast("Erro ao processar a planilha Excel!");
        }
    };
    reader.readAsArrayBuffer(file);
}

// Drag & Drop Listeners
excelDropZone.addEventListener('dragover', (e) => { e.preventDefault(); excelDropZone.classList.add('drag-over'); });
excelDropZone.addEventListener('dragleave', () => { excelDropZone.classList.remove('drag-over'); });
excelDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    excelDropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    handleExcelFile(file);
});
excelDropZone.addEventListener('click', () => { excelFileInput.click(); });
excelFileInput.addEventListener('change', (e) => { handleExcelFile(e.target.files[0]); });

// ----------------------------------------------------
// 6. MOTOR DE RENDERIZAÇÃO
// ----------------------------------------------------

// Garante integridade de todos os arrays/objetos do state antes de qualquer renderização
function normalizeState() {
    if (!Array.isArray(state.factions))   state.factions   = [];
    if (!Array.isArray(state.qgs))        state.qgs        = [];
    if (!Array.isArray(state.authorizedIds)) state.authorizedIds = DEFAULT_STATE.authorizedIds;
    if (!state.sheetsData || typeof state.sheetsData !== 'object') state.sheetsData = {};
    // Garante que cada entrada de sheetsData tenha members e customCoords como arrays
    Object.keys(state.sheetsData).forEach(key => {
        const d = state.sheetsData[key];
        if (!d) { state.sheetsData[key] = {}; return; }
        if (!Array.isArray(d.members))      d.members      = [];
        if (!Array.isArray(d.customCoords)) d.customCoords = [];
    });
}

function renderTitles() {
    normalizeState();
    mainTitle.innerText = state.mainTitle || '';
    mainSubtitle.innerHTML = state.mainSubtitle || '';
    footerText.innerHTML = state.footerText || '';
    activeModeTag.innerText = `FACÇÕES: ${state.factions.length}`;
}

function renderFactionList() {
    const query = factionSearchQuery.toLowerCase();
    const facs = Array.isArray(state.factions) ? state.factions : [];

    // Contadores por status real do campo f.status
    const countAll       = facs.length;
    const countLivres    = facs.filter(f => (f.status || 'LIVRE').toUpperCase() === 'LIVRE').length;
    const countEntregues = facs.filter(f => (f.status || '').toUpperCase() === 'ENTREGUE').length;
    const countComerc    = facs.filter(f => {
        const prod = (f.cds || '').toLowerCase();
        const qgInfo = Array.isArray(state.qgs) ? state.qgs.find(q => (q.faccao||'').trim().toUpperCase() === (f.faccao||'').trim().toUpperCase()) : null;
        const prodQg = qgInfo ? (qgInfo.prod || '').toLowerCase() : '';
        const combined = prod + ' ' + prodQg;
        return combined.includes('lavagem') || combined.includes('comér') || combined.includes('comerci') || combined.includes('drogas') || combined.includes('armas') || combined.includes('munição') || combined.includes('munições');
    }).length;

    const elAll  = document.getElementById('count-all');       if (elAll)  elAll.innerText  = countAll;
    const elLiv  = document.getElementById('count-livres');    if (elLiv)  elLiv.innerText  = countLivres;
    const elEnt  = document.getElementById('count-entregues'); if (elEnt)  elEnt.innerText  = countEntregues;
    const elCom  = document.getElementById('count-comerciais'); if (elCom) elCom.innerText  = countComerc;

    // Aplica filtro de aba + pesquisa de texto
    const filteredFactions = facs.filter(f => {
        const matchText = (
            (f.faccao || '').toLowerCase().includes(query) ||
            (f.lider  || '').toLowerCase().includes(query) ||
            (f.setor  || '').toLowerCase().includes(query)
        );
        if (!matchText) return false;

        if (factionFilterActive === 'livres') {
            return (f.status || 'LIVRE').toUpperCase() === 'LIVRE';
        }
        if (factionFilterActive === 'entregues') {
            return (f.status || '').toUpperCase() === 'ENTREGUE';
        }
        if (factionFilterActive === 'comerciais') {
            const prod = (f.cds || '').toLowerCase();
            const qgInfo = Array.isArray(state.qgs) ? state.qgs.find(q => (q.faccao||'').trim().toUpperCase() === (f.faccao||'').trim().toUpperCase()) : null;
            const prodQg = qgInfo ? (qgInfo.prod || '').toLowerCase() : '';
            const combined = prod + ' ' + prodQg;
            return combined.includes('lavagem') || combined.includes('comér') || combined.includes('comerci') || combined.includes('drogas') || combined.includes('armas') || combined.includes('munição') || combined.includes('munições');
        }
        return true;
    });

    let html = '';
    if (filteredFactions.length === 0) {
        html = `
            <div class="members-empty-state" style="padding: 20px; text-align: center;">
                <i data-lucide="alert-triangle" style="width: 20px; height: 20px; color: var(--purple-neon); margin-bottom: 8px;"></i>
                <p style="font-size: 13px;">Nenhuma facção encontrada.</p>
            </div>`;
    } else {
        filteredFactions.forEach(f => {
            const isSelected = state.selectedFaction && f.faccao.trim().toUpperCase() === state.selectedFaction.trim().toUpperCase();
            const status = (f.status || 'LIVRE').toUpperCase();
            let badgeClass = 'badge-livre';
            if (status === 'ENTREGUE')  badgeClass = 'badge-entregue';
            if (status === 'AGUARDANDO') badgeClass = 'badge-aguardando';

            const qgInfo = Array.isArray(state.qgs) ? state.qgs.find(q => q.faccao.trim().toUpperCase() === f.faccao.trim().toUpperCase()) : null;
            const resource = qgInfo ? qgInfo.prod : f.cds || 'RECURSOS';

            // Líder: prefere sheetsData rank 00, depois f.lider
            const sheetKey = f.faccao.trim().toUpperCase();
            const sheetData = state.sheetsData && state.sheetsData[sheetKey];
            const liderFromSheet = sheetData && Array.isArray(sheetData.members)
                ? (sheetData.members.find(m => m.rank === '00') || {}).name || ''
                : '';
            const liderName = liderFromSheet || f.lider || '';
            const hasLider = liderName && liderName.toUpperCase() !== 'LIVRE' && liderName.trim() !== '';

            // Toggle: LIVRE ↔ ENTREGUE
            const nextStatus  = status === 'ENTREGUE' ? 'LIVRE' : 'ENTREGUE';
            const toggleIcon  = status === 'ENTREGUE' ? 'unlock' : 'check-circle';
            const toggleTitle = status === 'ENTREGUE' ? 'Marcar como LIVRE' : 'Marcar como ENTREGUE';
            const toggleColor = status === 'ENTREGUE' ? '#00ffaa' : '#ff3366';

            html += `
                <div class="faction-card ${isSelected ? 'active' : ''}" data-fac="${f.faccao}">
                    <div class="faction-card-header">
                        <span class="faction-card-name">${f.faccao}</span>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span class="badge ${badgeClass}">${status}</span>
                            ${isAuthenticated ? `
                            <button class="panel-btn btn-toggle-status" data-fac="${f.faccao}" data-next="${nextStatus}" style="border:none; background:transparent; width:20px; height:20px; cursor:pointer; display:flex; align-items:center; justify-content:center;" title="${toggleTitle}">
                                <i data-lucide="${toggleIcon}" style="width:12px; height:12px; color: ${toggleColor};"></i>
                            </button>
                            <button class="panel-btn btn-edit-faction" data-fac="${f.faccao}" style="border:none; background:transparent; width:20px; height:20px; cursor:pointer; display:flex; align-items:center; justify-content:center;" title="Editar Facção">
                                <i data-lucide="pencil" style="width:12px; height:12px; color: var(--purple-neon);"></i>
                            </button>
                            <button class="panel-btn btn-delete-faction" data-fac="${f.faccao}" style="border:none; background:transparent; width:20px; height:20px; cursor:pointer;" title="Excluir Organização">
                                <i data-lucide="trash-2" style="width:12px; height:12px; color: #ff3366;"></i>
                            </button>` : ''}
                        </div>
                    </div>
                    <div class="faction-card-meta">
                        <span style="display:flex; align-items:center; gap:5px;">
                            <i data-lucide="user" style="width:10px;height:10px; color:${hasLider ? '#00ffaa' : '#ff3366'};"></i>
                            <span style="color:${hasLider ? 'var(--white-muted)' : '#ff3366'}; font-weight:${hasLider ? '700' : '600'}">${hasLider ? liderName : 'LIVRE'}</span>
                        </span>
                        <span>Tipo: <strong style="color: var(--purple-neon)">${resource}</strong></span>
                    </div>
                </div>`;
        });
    }

    factionListContainer.innerHTML = html;
    lucide.createIcons();

    // Ouvinte para selecionar facção (Puramente visual local em memória)
    document.querySelectorAll('.faction-card').forEach(card => {
        card.addEventListener('click', () => {
            state.selectedFaction = card.dataset.fac;
            renderAll();
        });
    });

    // Ouvinte para excluir facção
    if (isAuthenticated) {
        // Editar facção (abre modal pré-preenchido)
        document.querySelectorAll('.btn-edit-faction').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const facName = e.currentTarget.dataset.fac;
                const fac = state.factions.find(f => f.faccao.trim().toUpperCase() === facName.trim().toUpperCase());
                const qgData = Array.isArray(state.qgs) ? state.qgs.find(q => q.faccao.trim().toUpperCase() === facName.trim().toUpperCase()) : null;
                const sheetData = state.sheetsData && state.sheetsData[facName.trim().toUpperCase()] || {};
                if (!fac) return;

                // Preenche o modal de cadastro com os dados existentes
                document.getElementById('new-fac-name').value         = fac.faccao || '';
                document.getElementById('new-fac-product').value      = fac.cds || (qgData ? qgData.prod : '') || '';
                document.getElementById('new-fac-discord').value      = sheetData.discord || '';
                document.getElementById('new-fac-qg').value           = sheetData.coords || (qgData ? qgData.local : '') || '';
                document.getElementById('new-fac-craft').value        = sheetData.craft || '';
                document.getElementById('new-fac-utilities').value    = sheetData.utilities || '';
                document.getElementById('new-fac-garage-personal').value = sheetData.garagePersonal || '';
                document.getElementById('new-fac-garage-fac').value   = sheetData.garageFaction || '';
                document.getElementById('new-fac-chest-leader').value = sheetData.chestLeader || '';
                document.getElementById('new-fac-chest-super').value  = sheetData.chestSupervisor || '';
                document.getElementById('new-fac-chest-member').value = sheetData.chestMember || '';
                document.getElementById('new-fac-route-farm').value   = sheetData.farm || '';
                document.getElementById('new-fac-route-delivery').value = sheetData.delivery || '';
                document.getElementById('new-fac-farm-cow').value     = sheetData.farmCow || '';
                document.getElementById('new-fac-farm-fishing').value = sheetData.farmFishing || '';
                document.getElementById('new-fac-farm-afk').value     = sheetData.farmAfk || '';

                // Muda título do modal para indicar edição
                document.querySelector('#create-faction-modal .modal-header h3').innerHTML =
                    '<i data-lucide="pencil" style="color:var(--purple-neon)"></i> EDITAR FACÇÃO: ' + facName.toUpperCase();
                // Guarda nome original para sobrescrever ao confirmar
                document.getElementById('btn-confirm-create').dataset.editingFac = facName.toUpperCase();
                lucide.createIcons();
                createFactionModal.classList.add('active');
            });
        });

        document.querySelectorAll('.btn-delete-faction').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const facName = e.currentTarget.dataset.fac;
                
                if (confirm(`ATENÇÃO: Deseja realmente excluir permanentemente a organização "${facName}" e todos os seus dados?`)) {
                    state.factions = state.factions.filter(f => f.faccao.trim().toUpperCase() !== facName.trim().toUpperCase());
                    state.qgs = state.qgs.filter(q => q.faccao.trim().toUpperCase() !== facName.trim().toUpperCase());
                    
                    if (state.sheetsData && state.sheetsData[facName.trim().toUpperCase()]) {
                        delete state.sheetsData[facName.trim().toUpperCase()];
                    }
                    
                    if (state.selectedFaction && state.selectedFaction.trim().toUpperCase() === facName.trim().toUpperCase()) {
                        state.selectedFaction = state.factions.length > 0 ? state.factions[0].faccao : '';
                    }
                    
                    saveState(true);
                    renderAll();
                    showToast("Organização excluída com sucesso!");
                }
            });
        });

        // Ouvinte para alternar status LIVRE <-> ENTREGUE
        document.querySelectorAll('.btn-toggle-status').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const facName  = e.currentTarget.dataset.fac;
                const nextSt   = e.currentTarget.dataset.next;
                const facIndex = state.factions.findIndex(f => f.faccao.trim().toUpperCase() === facName.trim().toUpperCase());
                if (facIndex !== -1) {
                    state.factions[facIndex].status = nextSt;
                    // Sincroniza também no qgs se existir
                    const qgIndex = state.qgs.findIndex(q => q.faccao.trim().toUpperCase() === facName.trim().toUpperCase());
                    if (qgIndex !== -1) state.qgs[qgIndex].status = nextSt;
                    saveState(true);
                    renderAll();
                    showToast(`${facName} marcada como ${nextSt}!`);
                }
            });
        });
    }
}

function renderCustomCoordCards(details, category) {
    if (!details.customCoords) details.customCoords = [];
    const filtered = details.customCoords.filter(c => c.category === category);
    
    let html = '';
    filtered.forEach(c => {
        html += `
            <div class="coord-card" style="position: relative;">
                <div class="coord-info" style="flex-grow: 1;">
                    <input type="text" class="coord-custom-label-inp" data-id="${c.id}" value="${c.label}" placeholder="NOME DO PONTO" style="background:transparent; border:none; border-bottom:1px dashed rgba(255,255,255,0.15); color:var(--purple-neon); font-family:var(--font-tech); font-size:10px; font-weight:bold; width:100%; margin-bottom:4px; padding-bottom:2px;" ${!isAuthenticated ? 'disabled' : ''}>
                    <input type="text" class="coord-val detail-custom-val-inp" data-id="${c.id}" value="${c.value || ''}" placeholder="x, y, z" ${!isAuthenticated ? 'disabled' : ''}>
                </div>
                <div style="display:flex; flex-direction:column; justify-content:center; gap:6px; padding:0 2px;">
                    <button class="btn-copy-coord" data-copy="${c.value || ''}" style="height:20px; width:20px; border:none; background:transparent; cursor:pointer;" title="Copiar"><i data-lucide="copy" style="width:11px; height:11px;"></i></button>
                    ${isAuthenticated ? `
                    <button class="btn-delete-custom-coord" data-id="${c.id}" style="height:20px; width:20px; border:none; background:transparent; cursor:pointer;" title="Deletar"><i data-lucide="trash-2" style="width:11px; height:11px; color:#ff3366;"></i></button>
                    ` : ''}
                </div>
            </div>`;
    });
    return html;
}

function renderFactionWorkspace() {
    if (!state.selectedFaction) {
        consoleWorkspaceArea.innerHTML = `
            <div class="empty-state-notice" style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                <i data-lucide="shield" class="notice-icon" style="width:48px;height:48px;margin-bottom:20px;color:var(--purple-neon);"></i>
                <p style="font-family:var(--font-tech);font-size:18px;font-weight:600;color:var(--white-muted);margin-bottom:10px;">NENHUMA FACÇÃO SELECIONADA</p>
                <span style="font-size:13px;max-width:320px;color:var(--white-dim);">Escolha uma facção no diretório lateral para exibir as coordenadas e membros operacionais.</span>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    let details = state.sheetsData[state.selectedFaction.trim().toUpperCase()];
    if (!details) {
        const facInfo = state.factions.find(f => f.faccao.trim().toUpperCase() === state.selectedFaction.trim().toUpperCase());
        const qgInfo = state.qgs.find(q => q.faccao.trim().toUpperCase() === state.selectedFaction.trim().toUpperCase());
        
        details = {
            title: `QG | ${state.selectedFaction.toUpperCase()} | ${qgInfo ? qgInfo.prod : 'GERENCIAMENTO'}`,
            discord: facInfo ? facInfo.idDiscord : 'https://discord.gg/invite',
            coords: qgInfo && qgInfo.local ? qgInfo.local : '-2033.18, -137.57, 27.68',
            craft: '-2213.96, -270.22, 42.51',
            chestLeader: '-2211.19, -270.22, 42.51',
            chestSupervisor: '-2240.91, -261.89, 46.42',
            chestMember: '-2232.21, -261.27, 46.42',
            farm: '-2049.75, -126.05, 32.99',
            delivery: '-2055.20, -128.45, 32.99',
            garagePersonal: '-2016.87, -156.47, 28.32',
            garageFaction: '-2020.15, -158.00, 28.32',
            utilities: '-2215.50, -268.00, 42.51',
            farmCow: '-1200.50, 450.32, 15.4',
            farmFishing: '-1850.22, -900.50, 0.5',
            farmAfk: '-2210.00, -265.00, 42.51',
            tacticalRadio: qgInfo ? (qgInfo.radio.split(',')[0] || '100') : '100',
            operationalRadio: qgInfo ? (qgInfo.radio.split(',')[1] || '101') : '101',
            generalRadio: qgInfo ? (qgInfo.radio.split(',')[2] || '102') : '102',
            members: facInfo && facInfo.lider ? [
                { rank: "00", name: facInfo.lider, discordId: facInfo.idDiscord || "900303877260320788", cityId: facInfo.id || "104" }
            ] : []
        };
        state.sheetsData[state.selectedFaction.trim().toUpperCase()] = details;
    }

    let html = `
        <div class="faction-detail-view" style="display: flex; flex-direction: column; gap: 20px; height: 100%; overflow: hidden;">
            
            <!-- Cabeçalho do Workspace -->
            <div class="detail-header-block" style="flex-shrink: 0; padding-bottom: 12px; margin-bottom: 0;">
                <div class="detail-title-area">
                    <h3>${details.title}</h3>
                    <p>// DETALHES DE SEGURANÇA E OPERAÇÃO</p>
                </div>
                ${details.discord ? `<a href="${details.discord.startsWith('http') ? details.discord : 'https://' + details.discord}" target="_blank" class="detail-discord-link"><i data-lucide="external-link"></i> DISCORD QG</a>` : ''}
            </div>

            <!-- Conteúdo em Duas Colunas -->
            <div class="faction-detail-grid" style="display: grid; grid-template-columns: 1.25fr 1fr; gap: 20px; flex-grow: 1; min-height: 0; overflow: hidden;">
                
                <!-- Coluna Esquerda: Coordenadas e Rádios -->
                <div class="detail-left-col" style="overflow-y: auto; height: 100%; padding-right: 8px;">
                    <!-- Rádios -->
                    <div class="radio-widgets-grid" style="margin-bottom: 15px;">
                        <div class="radio-widget" style="padding: 10px;">
                            <span class="radio-widget-label" style="font-size: 10px;"><i data-lucide="radio" style="width:10px;height:10px;margin-bottom:-1px;"></i> CANAL TÁTICO</span>
                            <input type="text" class="radio-widget-frequency detail-inp" data-field="tacticalRadio" value="${details.tacticalRadio}" placeholder="---.-" style="font-size: 18px;" ${!isAuthenticated ? 'disabled' : ''}>
                        </div>
                        <div class="radio-widget" style="padding: 10px;">
                            <span class="radio-widget-label" style="font-size: 10px;"><i data-lucide="radio" style="width:10px;height:10px;margin-bottom:-1px;"></i> OPERACIONAL</span>
                            <input type="text" class="radio-widget-frequency detail-inp" data-field="operationalRadio" value="${details.operationalRadio}" placeholder="---.-" style="font-size: 18px;" ${!isAuthenticated ? 'disabled' : ''}>
                        </div>
                        <div class="radio-widget" style="padding: 10px;">
                            <span class="radio-widget-label" style="font-size: 10px;"><i data-lucide="radio" style="width:10px;height:10px;margin-bottom:-1px;"></i> DIRETORIA / GERAL</span>
                            <input type="text" class="radio-widget-frequency detail-inp" data-field="generalRadio" value="${details.generalRadio}" placeholder="---.-" style="font-size: 18px;" ${!isAuthenticated ? 'disabled' : ''}>
                        </div>
                    </div>

                    <!-- 13 Coordenadas -->
                    <div class="coords-block">
                        
                        <!-- 1. Acesso & QG -->
                        <div class="coords-group-title" style="margin-top: 0; display: flex; align-items: center; width: 100%;">
                            <span style="display: flex; align-items: center; gap: 8px;"><i data-lucide="map-pin"></i> 1. Acesso & QG</span>
                            ${isAuthenticated ? `<button class="btn-add-custom-coord" data-category="acesso" style="border:none; background:transparent; color:var(--purple-neon); cursor:pointer; font-family:var(--font-tech); font-size:10px; display:inline-flex; align-items:center; gap:4px; margin-left:auto; text-shadow:none;"><i data-lucide="plus-circle" style="width:12px; height:12px;"></i> ADICIONAR</button>` : ''}
                        </div>
                        <div class="coords-widgets-grid">
                            <div class="coord-card">
                                <div class="coord-info">
                                    <span class="coord-label">CDS QG</span>
                                    <input type="text" class="coord-val detail-inp" data-field="coords" value="${details.coords || ''}" ${!isAuthenticated ? 'disabled' : ''}>
                                </div>
                                <button class="btn-copy-coord" data-copy="${details.coords || ''}" title="Copiar Coordenadas"><i data-lucide="copy"></i></button>
                            </div>
                            <div class="coord-card">
                                <div class="coord-info">
                                    <span class="coord-label">PONTO DE CRAFT</span>
                                    <input type="text" class="coord-val detail-inp" data-field="craft" value="${details.craft || ''}" ${!isAuthenticated ? 'disabled' : ''}>
                                </div>
                                <button class="btn-copy-coord" data-copy="${details.craft || ''}" title="Copiar Craft"><i data-lucide="copy"></i></button>
                            </div>
                            <div class="coord-card" style="grid-column: span 2;">
                                <div class="coord-info">
                                    <span class="coord-label">UTILIDADES DO QG</span>
                                    <input type="text" class="coord-val detail-inp" data-field="utilities" value="${details.utilities || ''}" ${!isAuthenticated ? 'disabled' : ''}>
                                </div>
                                <button class="btn-copy-coord" data-copy="${details.utilities || ''}" title="Copiar Utilidades"><i data-lucide="copy"></i></button>
                            </div>
                            ${renderCustomCoordCards(details, 'acesso')}
                        </div>

                        <!-- 2. Baús do QG -->
                        <div class="coords-group-title" style="display: flex; align-items: center; width: 100%;">
                            <span style="display: flex; align-items: center; gap: 8px;"><i data-lucide="archive"></i> 2. BAUS: Baús do QG</span>
                            ${isAuthenticated ? `<button class="btn-add-custom-coord" data-category="baus" style="border:none; background:transparent; color:var(--purple-neon); cursor:pointer; font-family:var(--font-tech); font-size:10px; display:inline-flex; align-items:center; gap:4px; margin-left:auto; text-shadow:none;"><i data-lucide="plus-circle" style="width:12px; height:12px;"></i> ADICIONAR</button>` : ''}
                        </div>
                        <div class="coords-widgets-grid">
                            <div class="coord-card">
                                <div class="coord-info">
                                    <span class="coord-label">BAÚ LÍDER (00)</span>
                                    <input type="text" class="coord-val detail-inp" data-field="chestLeader" value="${details.chestLeader || ''}" ${!isAuthenticated ? 'disabled' : ''}>
                                </div>
                                <button class="btn-copy-coord" data-copy="${details.chestLeader || ''}" title="Copiar Baú Líder"><i data-lucide="copy"></i></button>
                            </div>
                            <div class="coord-card">
                                <div class="coord-info">
                                    <span class="coord-label">BAÚ SUPERVISOR (01)</span>
                                    <input type="text" class="coord-val detail-inp" data-field="chestSupervisor" value="${details.chestSupervisor || ''}" ${!isAuthenticated ? 'disabled' : ''}>
                                </div>
                                <button class="btn-copy-coord" data-copy="${details.chestSupervisor || ''}" title="Copiar Baú Supervisor"><i data-lucide="copy"></i></button>
                            </div>
                            <div class="coord-card" style="grid-column: span 2;">
                                <div class="coord-info">
                                    <span class="coord-label">BAÚ DE MEMBROS</span>
                                    <input type="text" class="coord-val detail-inp" data-field="chestMember" value="${details.chestMember || ''}" ${!isAuthenticated ? 'disabled' : ''}>
                                </div>
                                <button class="btn-copy-coord" data-copy="${details.chestMember || ''}" title="Copiar Baú Membros"><i data-lucide="copy"></i></button>
                            </div>
                            ${renderCustomCoordCards(details, 'baus')}
                        </div>

                        <!-- 3. Garagens -->
                        <div class="coords-group-title" style="display: flex; align-items: center; width: 100%;">
                            <span style="display: flex; align-items: center; gap: 8px;"><i data-lucide="car"></i> 3. Garagens do QG</span>
                            ${isAuthenticated ? `<button class="btn-add-custom-coord" data-category="garagens" style="border:none; background:transparent; color:var(--purple-neon); cursor:pointer; font-family:var(--font-tech); font-size:10px; display:inline-flex; align-items:center; gap:4px; margin-left:auto; text-shadow:none;"><i data-lucide="plus-circle" style="width:12px; height:12px;"></i> ADICIONAR</button>` : ''}
                        </div>
                        <div class="coords-widgets-grid">
                            <div class="coord-card">
                                <div class="coord-info">
                                    <span class="coord-label">GARAGEM PESSOAL</span>
                                    <input type="text" class="coord-val detail-inp" data-field="garagePersonal" value="${details.garagePersonal || ''}" ${!isAuthenticated ? 'disabled' : ''}>
                                </div>
                                <button class="btn-copy-coord" data-copy="${details.garagePersonal || ''}" title="Copiar Garagem Pessoal"><i data-lucide="copy"></i></button>
                            </div>
                            <div class="coord-card">
                                <div class="coord-info">
                                    <span class="coord-label">GARAGEM DA FACÇÃO</span>
                                    <input type="text" class="coord-val detail-inp" data-field="garageFaction" value="${details.garageFaction || ''}" ${!isAuthenticated ? 'disabled' : ''}>
                                </div>
                                <button class="btn-copy-coord" data-copy="${details.garageFaction || ''}" title="Copiar Garagem Facção"><i data-lucide="copy"></i></button>
                            </div>
                            ${renderCustomCoordCards(details, 'garagens')}
                        </div>

                        <!-- 4. Rotas -->
                        <div class="coords-group-title" style="display: flex; align-items: center; width: 100%;">
                            <span style="display: flex; align-items: center; gap: 8px;"><i data-lucide="navigation"></i> 4. Rotas Operacionais</span>
                            ${isAuthenticated ? `<button class="btn-add-custom-coord" data-category="rotas" style="border:none; background:transparent; color:var(--purple-neon); cursor:pointer; font-family:var(--font-tech); font-size:10px; display:inline-flex; align-items:center; gap:4px; margin-left:auto; text-shadow:none;"><i data-lucide="plus-circle" style="width:12px; height:12px;"></i> ADICIONAR</button>` : ''}
                        </div>
                        <div class="coords-widgets-grid">
                            <div class="coord-card">
                                <div class="coord-info">
                                    <span class="coord-label">ROTA DE FARM</span>
                                    <input type="text" class="coord-val detail-inp" data-field="farm" value="${details.farm || ''}" ${!isAuthenticated ? 'disabled' : ''}>
                                </div>
                                <button class="btn-copy-coord" data-copy="${details.farm || ''}" title="Copiar Rota Farm"><i data-lucide="copy"></i></button>
                            </div>
                            <div class="coord-card">
                                <div class="coord-info">
                                    <span class="coord-label">ROTA DE ENTREGA</span>
                                    <input type="text" class="coord-val detail-inp" data-field="delivery" value="${details.delivery || ''}" ${!isAuthenticated ? 'disabled' : ''}>
                                </div>
                                <button class="btn-copy-coord" data-copy="${details.delivery || ''}" title="Copiar Rota Entrega"><i data-lucide="copy"></i></button>
                            </div>
                            ${renderCustomCoordCards(details, 'rotas')}
                        </div>

                        <!-- 5. Farms Comerciais -->
                        <div class="coords-group-title" style="display: flex; align-items: center; width: 100%;">
                            <span style="display: flex; align-items: center; gap: 8px;"><i data-lucide="coins"></i> 5. Farms Comerciais & AFK</span>
                            ${isAuthenticated ? `<button class="btn-add-custom-coord" data-category="farms" style="border:none; background:transparent; color:var(--purple-neon); cursor:pointer; font-family:var(--font-tech); font-size:10px; display:inline-flex; align-items:center; gap:4px; margin-left:auto; text-shadow:none;"><i data-lucide="plus-circle" style="width:12px; height:12px;"></i> ADICIONAR</button>` : ''}
                        </div>
                        <div class="coords-widgets-grid" style="padding-bottom: 20px;">
                            <div class="coord-card">
                                <div class="coord-info">
                                    <span class="coord-label">FARM VAQUINHA</span>
                                    <input type="text" class="coord-val detail-inp" data-field="farmCow" value="${details.farmCow || ''}" ${!isAuthenticated ? 'disabled' : ''}>
                                </div>
                                <button class="btn-copy-coord" data-copy="${details.farmCow || ''}" title="Copiar Farm Vaquinha"><i data-lucide="copy"></i></button>
                            </div>
                            <div class="coord-card">
                                <div class="coord-info">
                                    <span class="coord-label">PESCARIA</span>
                                    <input type="text" class="coord-val detail-inp" data-field="farmFishing" value="${details.farmFishing || ''}" ${!isAuthenticated ? 'disabled' : ''}>
                                </div>
                                <button class="btn-copy-coord" data-copy="${details.farmFishing || ''}" title="Copiar Pescaria"><i data-lucide="copy"></i></button>
                            </div>
                            <div class="coord-card" style="grid-column: span 2;">
                                <div class="coord-info">
                                    <span class="coord-label">FARM AFK</span>
                                    <input type="text" class="coord-val detail-inp" data-field="farmAfk" value="${details.farmAfk || ''}" ${!isAuthenticated ? 'disabled' : ''}>
                                </div>
                                <button class="btn-copy-coord" data-copy="${details.farmAfk || ''}" title="Copiar Farm AFK"><i data-lucide="copy"></i></button>
                            </div>
                            ${renderCustomCoordCards(details, 'farms')}
                        </div>

                    </div>
                </div>

                <!-- Coluna Direita: Membros & Autenticações -->
                <div class="detail-right-col" style="overflow-y: auto; height: 100%; padding-right: 8px; display: flex; flex-direction: column; gap: 20px;">
                    
                    <!-- Quadro de Membros -->
                    <div class="members-block">
                        <div class="members-title-row">
                            <h4 style="font-size: 11px;"><i data-lucide="users"></i> MEMBROS OPERACIONAIS (ZEROS)</h4>
                            <button class="btn-add-member ${!isAuthenticated ? 'locked-hud-el' : ''}" id="btn-add-faction-member" ${!isAuthenticated ? 'disabled' : ''}><i data-lucide="user-plus"></i> ADD MEMBRO</button>
                        </div>
                        
                        <div class="hud-table-wrapper" style="margin-bottom:0; max-height:220px; overflow-y:auto;">
                            <table class="hud-table">
                                <thead>
                                    <tr>
                                        <th style="width: 70px; font-size: 10px; padding: 8px 10px;">RANK</th>
                                        <th style="font-size: 10px; padding: 8px 10px;">NOME</th>
                                        <th style="font-size: 10px; padding: 8px 10px;">DISCORD ID</th>
                                        <th style="width: 80px; font-size: 10px; padding: 8px 10px;">CIDADE</th>
                                        <th style="width: 35px; padding: 8px 10px;"></th>
                                    </tr>
                                </thead>
                                <tbody>`;

    if (!details.members || details.members.length === 0) {
        html += `
                                    <tr>
                                        <td colspan="5" class="members-empty-state" style="padding: 15px;">
                                            Nenhum membro registrado.
                                        </td>
                                    </tr>`;
    } else {
        details.members.forEach((m, mIdx) => {
            html += `
                                    <tr>
                                        <td class="member-rank-cell" style="padding: 3px;">
                                            <input type="text" class="editable-cell member-inp" data-index="${mIdx}" data-field="rank" value="${m.rank}" ${!isAuthenticated ? 'disabled' : ''}>
                                        </td>
                                        <td style="padding: 3px;">
                                            <input type="text" class="editable-cell member-inp" data-index="${mIdx}" data-field="name" value="${m.name}" style="font-weight:700;" ${!isAuthenticated ? 'disabled' : ''}>
                                        </td>
                                        <td style="padding: 3px;">
                                            <input type="text" class="editable-cell member-inp" data-index="${mIdx}" data-field="discordId" value="${m.discordId}" ${!isAuthenticated ? 'disabled' : ''}>
                                        </td>
                                        <td style="font-family: var(--font-tech); padding: 3px;">
                                            <input type="text" class="editable-cell member-inp" data-index="${mIdx}" data-field="cityId" value="${m.cityId}" ${!isAuthenticated ? 'disabled' : ''}>
                                        </td>
                                        <td style="padding: 3px; text-align: center;">
                                            <button class="panel-btn btn-delete-member ${!isAuthenticated ? 'locked-hud-el' : ''}" data-index="${mIdx}" style="border:none;background:transparent;color:rgba(255,255,255,0.4);width:22px;height:22px;" title="Remover" ${!isAuthenticated ? 'disabled' : ''}><i data-lucide="trash" style="width:12px;height:12px;"></i></button>
                                        </td>
                                    </tr>`;
        });
    }

    html += `
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Quadro de Segurança: Membros Autorizados a Editar -->
                    <div class="members-block" style="border-top:1px solid rgba(255,255,255,0.06); padding-top:15px; padding-bottom: 15px;">
                        <div class="members-title-row">
                            <h4 style="font-size: 11px;"><i data-lucide="shield-alert"></i> IDS AUTORIZADOS A EDITAR</h4>
                        </div>
                        
                        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;" id="auth-tags-container">`;
                        
    state.authorizedIds.forEach(id => {
        html += `
                            <span class="system-mode-tag" style="background:rgba(186,85,211,0.08); border-color:var(--purple-border); padding:4px 8px; display:inline-flex; align-items:center; gap:6px; font-size: 10px;">
                                ${id} 
                                ${isAuthenticated ? `<i data-lucide="x" class="btn-remove-auth-id" data-id="${id}" style="width:10px; height:10px; cursor:pointer; color:var(--purple-neon)"></i>` : ''}
                            </span>`;
    });
                        
    html += `
                        </div>
                        
                        ${isAuthenticated ? `
                        <div style="display:flex; gap:8px;">
                            <input type="text" id="new-auth-id-input" class="hud-input" placeholder="Adicionar Discord ou City ID..." style="font-size:11px; padding: 8px 12px;">
                            <button class="hud-btn success-btn" id="btn-add-auth-id" style="font-size:10px; padding:6px 12px;"><i data-lucide="plus"></i> AUTORIZAR</button>
                        </div>` : ''}
                    </div>

                </div>
            </div>
        </div>`;

    consoleWorkspaceArea.innerHTML = html;
    lucide.createIcons();

    // 1. Edição de dados do QG
    document.querySelectorAll('.detail-inp').forEach(inp => {
        inp.addEventListener('input', (e) => {
            if (!isAuthenticated) return;
            const field = e.target.dataset.field;
            const activeKey = state.selectedFaction.trim().toUpperCase();
            state.sheetsData[activeKey][field] = e.target.value;
            saveState();
        });
    });

    // 2. Edição de Membros
    document.querySelectorAll('.member-inp').forEach(inp => {
        inp.addEventListener('input', (e) => {
            if (!isAuthenticated) return;
            const mIdx = parseInt(e.target.dataset.index);
            const field = e.target.dataset.field;
            const activeKey = state.selectedFaction.trim().toUpperCase();
            if (!state.sheetsData[activeKey] || !Array.isArray(state.sheetsData[activeKey].members)) return;
            if (!state.sheetsData[activeKey].members[mIdx]) return;
            state.sheetsData[activeKey].members[mIdx][field] = e.target.value;
            saveState();
        });
    });

    // 3. Cópia de Coordenadas
    document.querySelectorAll('.btn-copy-coord').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetBtn = e.target.closest('.btn-copy-coord');
            const coordText = targetBtn.dataset.copy;
            if (!coordText) return;
            
            navigator.clipboard.writeText(coordText).then(() => {
                showToast("Coordenada copiada!");
            }).catch(err => {
                console.error("Falha ao copiar:", err);
            });
        });
    });

    // 3.1. Edição de Título/Label de Coordenadas Customizadas
    document.querySelectorAll('.coord-custom-label-inp').forEach(inp => {
        inp.addEventListener('input', (e) => {
            if (!isAuthenticated) return;
            const id = e.target.dataset.id;
            const activeKey = state.selectedFaction.trim().toUpperCase();
            if (!state.sheetsData[activeKey].customCoords) state.sheetsData[activeKey].customCoords = [];
            const coord = state.sheetsData[activeKey].customCoords.find(c => c.id === id);
            if (coord) {
                coord.label = e.target.value;
                saveState();
            }
        });
    });

    // 3.2. Edição de Valor de Coordenadas Customizadas
    document.querySelectorAll('.detail-custom-val-inp').forEach(inp => {
        inp.addEventListener('input', (e) => {
            if (!isAuthenticated) return;
            const id = e.target.dataset.id;
            const activeKey = state.selectedFaction.trim().toUpperCase();
            if (!state.sheetsData[activeKey].customCoords) state.sheetsData[activeKey].customCoords = [];
            const coord = state.sheetsData[activeKey].customCoords.find(c => c.id === id);
            if (coord) {
                coord.value = e.target.value;
                saveState();
            }
        });
    });

    // 3.3. Adicionar Coordenada Customizada
    document.querySelectorAll('.btn-add-custom-coord').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!isAuthenticated) return;
            const category = e.currentTarget.dataset.category;
            const activeKey = state.selectedFaction.trim().toUpperCase();
            
            if (!state.sheetsData[activeKey].customCoords) {
                state.sheetsData[activeKey].customCoords = [];
            }
            
            const nextIndex = state.sheetsData[activeKey].customCoords.filter(c => c.category === category).length + 1;
            let defaultLabel = "";
            if (category === 'acesso') defaultLabel = `PONTO EXTRA ${nextIndex}`;
            else if (category === 'baus') defaultLabel = `BAÚ EXTRA ${nextIndex}`;
            else if (category === 'garagens') defaultLabel = `GARAGEM EXTRA ${nextIndex}`;
            else if (category === 'rotas') defaultLabel = `ROTA EXTRA ${nextIndex}`;
            else if (category === 'farms') defaultLabel = `FARM EXTRA ${nextIndex}`;
            else defaultLabel = `NOVA COORDENADA ${nextIndex}`;
            
            state.sheetsData[activeKey].customCoords.push({
                id: "c_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
                label: defaultLabel,
                value: "",
                category: category
            });
            
            saveState(true);
            renderAll();
            showToast("Coordenada adicional criada!");
        });
    });

    // 3.4. Deletar Coordenada Customizada
    document.querySelectorAll('.btn-delete-custom-coord').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!isAuthenticated) return;
            const id = e.currentTarget.dataset.id;
            const activeKey = state.selectedFaction.trim().toUpperCase();
            
            if (confirm("Deseja realmente excluir esta coordenada adicional?")) {
                state.sheetsData[activeKey].customCoords = state.sheetsData[activeKey].customCoords.filter(c => c.id !== id);
                saveState(true);
                renderAll();
                showToast("Coordenada excluída!");
            }
        });
    });

    // 4. Adicionar Membro
    const btnAddMember = document.getElementById('btn-add-faction-member');
    if (btnAddMember) {
        btnAddMember.addEventListener('click', () => {
            if (!isAuthenticated) return;
            const activeKey = state.selectedFaction.trim().toUpperCase();

            // Verifica se a facção existe no objeto de dados
            if (!state.sheetsData[activeKey]) {
                console.error(`Facção "${activeKey}" não encontrada em sheetsData. Criando entrada...`);
                state.sheetsData[activeKey] = { members: [], customCoords: [] };
            }
            if (!Array.isArray(state.sheetsData[activeKey].members)) {
                state.sheetsData[activeKey].members = [];
            }

            const nextRank = String(state.sheetsData[activeKey].members.length).padStart(2, '0');

            state.sheetsData[activeKey].members.push({
                rank: nextRank,
                name: "Novo Membro",
                discordId: "ID Discord",
                cityId: "ID"
            });

            saveState();
            renderAll();
            showToast("Slot de membro adicionado!");
        });
    }

    // 5. Deletar Membro
    document.querySelectorAll('.btn-delete-member').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!isAuthenticated) return;
            const targetBtn = e.target.closest('.btn-delete-member');
            const mIdx = parseInt(targetBtn.dataset.index);
            const activeKey = state.selectedFaction.trim().toUpperCase();
            if (!state.sheetsData[activeKey] || !Array.isArray(state.sheetsData[activeKey].members)) return;
            
            if (confirm("Remover este membro do QG?")) {
                state.sheetsData[activeKey].members.splice(mIdx, 1);
                saveState();
                renderAll();
                showToast("Membro removido!");
            }
        });
    });

    // 6. Adicionar ID Autorizado de Segurança
    const btnAddAuthId = document.getElementById('btn-add-auth-id');
    if (btnAddAuthId) {
        btnAddAuthId.addEventListener('click', () => {
            if (!isAuthenticated) return;
            const inp = document.getElementById('new-auth-id-input');
            const idVal = inp.value.trim();
            if (!idVal) return;
            if (!Array.isArray(state.authorizedIds)) state.authorizedIds = [];
            
            if (!state.authorizedIds.includes(idVal)) {
                state.authorizedIds.push(idVal);
                saveState();
                renderAll();
                showToast("ID adicionado à lista de segurança!");
            } else {
                alert("Este ID já está autorizado!");
            }
        });
    }

    // 7. Remover ID Autorizado
    document.querySelectorAll('.btn-remove-auth-id').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!isAuthenticated) return;
            const id = e.target.dataset.id;
            if (!Array.isArray(state.authorizedIds)) return;
            
            if (confirm(`Remover autorização do ID ${id}?`)) {
                state.authorizedIds = state.authorizedIds.filter(x => x !== id);
                saveState();
                checkAuthStatus().then(() => {
                    renderAll();
                    showToast("Autorização removida!");
                });
            }
        });
    });
}

function renderAll() {
    renderTitles();
    renderFactionList();
    renderFactionWorkspace();
}

// ----------------------------------------------------
// 7. LOGICA DOS MODAIS (Criação de Facções e Autenticação)
// ----------------------------------------------------

function resetCreateModal() {
    delete btnConfirmCreate.dataset.editingFac;
    document.querySelectorAll('#create-faction-modal input').forEach(i => i.value = '');
    const modalTitle = document.querySelector('#create-faction-modal .modal-header h3');
    if (modalTitle) {
        modalTitle.innerHTML = '<i data-lucide="plus-circle" style="color:var(--purple-neon)"></i> CADASTRAR NOVA FACÇÃO';
        lucide.createIcons();
    }
    createFactionModal.classList.remove('active');
}

btnCloseCreateModal.addEventListener('click', resetCreateModal);
btnCancelCreate.addEventListener('click', resetCreateModal);

btnConfirmCreate.addEventListener('click', () => {
    if (!isAuthenticated) return;
    
    const name = document.getElementById('new-fac-name').value.trim();
    const product = document.getElementById('new-fac-product').value.trim() || 'RECURSO';
    const discord = document.getElementById('new-fac-discord').value.trim();
    
    const qg = document.getElementById('new-fac-qg').value.trim();
    const craft = document.getElementById('new-fac-craft').value.trim();
    const utils = document.getElementById('new-fac-utilities').value.trim();
    
    const garPersonal = document.getElementById('new-fac-garage-personal').value.trim();
    const garFac = document.getElementById('new-fac-garage-fac').value.trim();
    
    const chestLider = document.getElementById('new-fac-chest-leader').value.trim();
    const chestSuper = document.getElementById('new-fac-chest-super').value.trim();
    const chestMembro = document.getElementById('new-fac-chest-member').value.trim();
    
    const routeFarm = document.getElementById('new-fac-route-farm').value.trim();
    const routeDeliv = document.getElementById('new-fac-route-delivery').value.trim();
    
    const farmCow = document.getElementById('new-fac-farm-cow').value.trim();
    const farmFish = document.getElementById('new-fac-farm-fishing').value.trim();
    const farmAfk = document.getElementById('new-fac-farm-afk').value.trim();

    if (!name) {
        alert("Por favor, insira o nome da facção!");
        return;
    }

    const keyName = name.toUpperCase();
    const editingFac = btnConfirmCreate.dataset.editingFac || null; // Nome original se editando

    // Garantia: se o Firebase ainda não devolveu os arrays, inicializa localmente
    if (!Array.isArray(state.factions))  state.factions  = [];
    if (!Array.isArray(state.qgs))       state.qgs       = [];
    if (!state.sheetsData || typeof state.sheetsData !== 'object') state.sheetsData = {};

    if (editingFac) {
        // ── MODO EDIÇÃO: sobrescreve dados da fac existente ──
        const facIdx = state.factions.findIndex(f => f.faccao.trim().toUpperCase() === editingFac);
        if (facIdx !== -1) {
            state.factions[facIdx].cds = product;
        }
        const qgIdx = state.qgs.findIndex(q => q.faccao.trim().toUpperCase() === editingFac);
        if (qgIdx !== -1) {
            state.qgs[qgIdx].prod  = product;
            state.qgs[qgIdx].local = qg;
        }
        // Preserva membros e customCoords existentes
        const existingSheet = state.sheetsData[editingFac] || {};
        state.sheetsData[editingFac] = {
            ...existingSheet,
            title: `QG | ${editingFac} | PRODUÇÃO DE ${product.toUpperCase()}`,
            discord: discord,
            coords: qg,
            craft: craft,
            chestLeader: chestLider,
            chestSupervisor: chestSuper,
            chestMember: chestMembro,
            farm: routeFarm,
            delivery: routeDeliv,
            garagePersonal: garPersonal,
            garageFaction: garFac,
            utilities: utils,
            farmCow: farmCow,
            farmFishing: farmFish,
            farmAfk: farmAfk,
        };
        // Reset título e botão para modo criação
        document.querySelector('#create-faction-modal .modal-header h3').innerHTML =
            '<i data-lucide="plus-circle" style="color:var(--purple-neon)"></i> CADASTRAR NOVA FACÇÃO';
        delete btnConfirmCreate.dataset.editingFac;
        lucide.createIcons();
        showToast(`Facção ${editingFac} atualizada com sucesso!`);
    } else {
        // ── MODO CRIAÇÃO: adiciona nova fac ──
        state.factions.push({
            setor: "LAVAGEM",
            faccao: name,
            set: "Setor",
            lider: "LIVRE",
            idDiscord: "",
            entregue: "",
            id: "",
            status: "LIVRE",
            cds: product,
            inicial: "0"
        });

        state.qgs.push({
            prod: product,
            faccao: name,
            qg: "QG Novo",
            lider: "",
            id: "",
            radio: "100,101,102",
            status: "LIVRE",
            local: qg,
            initial: "0"
        });

        state.sheetsData[keyName] = {
            title: `QG | ${keyName} | PRODUÇÃO DE ${product.toUpperCase()}`,
            discord: discord,
            coords: qg,
            craft: craft,
            chestLeader: chestLider,
            chestSupervisor: chestSuper,
            chestMember: chestMembro,
            farm: routeFarm,
            delivery: routeDeliv,
            garagePersonal: garPersonal,
            garageFaction: garFac,
            utilities: utils,
            farmCow: farmCow,
            farmFishing: farmFish,
            farmAfk: farmAfk,
            tacticalRadio: "100",
            operationalRadio: "101",
            generalRadio: "102",
            members: []
        };
        state.selectedFaction = name;
    }

    saveState(true);
    
    document.querySelectorAll('#create-faction-modal input').forEach(i => i.value = '');
    createFactionModal.classList.remove('active');
    
    renderAll();
});

btnAuthStatus.addEventListener('click', () => {
    authModal.classList.add('active');
    authInputId.value = localStorage.getItem('wolfside_user_id') || '';
});

btnCloseAuthModal.addEventListener('click', () => authModal.classList.remove('active'));

btnSubmitAuth.addEventListener('click', () => {
    const idVal = authInputId.value.trim();
    if (!idVal) {
        alert("Por favor, digite seu ID!");
        return;
    }
    
    if (state.authorizedIds.includes(idVal)) {
        localStorage.setItem('wolfside_user_id', idVal);
        checkAuthStatus().then(() => {
            authModal.classList.remove('active');
            renderAll();
            showToast("Permissão de escrita liberada!");
        });
    } else {
        alert("Acesso Negado! Esse ID não consta na lista de membros autorizados. Solicite permissão a um Administrador.");
    }
});

btnLogout.addEventListener('click', () => {
    if (confirm("Bloquear permissões de edição deste navegador?")) {
        localStorage.removeItem('wolfside_user_id');
        checkAuthStatus().then(() => {
            authModal.classList.remove('active');
            renderAll();
            showToast("Painel bloqueado para Modo Leitura.");
        });
    }
});

// Título, subtítulo e rodapé travados (não editáveis)

// Ouvinte de pesquisa da Sidebar
factionSearchInput.addEventListener('input', (e) => {
    factionSearchQuery = e.target.value;
    renderFactionList();
});

// Ouvintes das abas de filtro
document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        factionFilterActive = tab.dataset.filter;
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderFactionList();
    });
});

// Botão Adicionar Facção na Sidebar
if (btnOpenCreateFaction) {
    btnOpenCreateFaction.addEventListener('click', () => {
        if (!isAuthenticated) return;
        createFactionModal.classList.add('active');
    });
}

// ----------------------------------------------------
// 8. OUVINTES DE CONFIGURAÇÕES GLOBAIS
// ----------------------------------------------------

btnOpenSettings.addEventListener('click', () => {
    settingsModal.classList.add('active');
    const config = getFirebaseConfig();
    firebaseApiKeyInput.value = config.apiKey;
    firebaseDbUrlInput.value = config.databaseURL;
    firebaseProjectIdInput.value = config.projectId;
    
    btnConnectSheets.innerHTML = `<i data-lucide="link"></i> Salvar & Conectar`;
    lucide.createIcons();
});

btnCloseModal.addEventListener('click', () => settingsModal.classList.remove('active'));
btnSaveSettings.addEventListener('click', async () => {
    const apiKey = firebaseApiKeyInput.value.trim();
    const dbUrl = firebaseDbUrlInput.value.trim();
    const projectId = firebaseProjectIdInput.value.trim();
    const config = getFirebaseConfig();
    
    if (apiKey !== config.apiKey || dbUrl !== config.databaseURL || projectId !== config.projectId) {
        if (apiKey && dbUrl) {
            saveFirebaseConfig(apiKey, dbUrl, projectId);
            showToast("Nova configuração do Firebase salva!");
            await initFirebase();
        } else {
            alert("API Key e Database URL são obrigatórios para o funcionamento do painel!");
            return;
        }
    }
    
    settingsModal.classList.remove('active');
});
settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) settingsModal.classList.remove('active'); });

btnConnectSheets.addEventListener('click', async () => {
    const apiKey = firebaseApiKeyInput.value.trim();
    const dbUrl = firebaseDbUrlInput.value.trim();
    const projectId = firebaseProjectIdInput.value.trim();
    
    if (!apiKey || !dbUrl) {
        alert("Preencha a API Key e a Database URL do seu Firebase!");
        return;
    }
    
    btnConnectSheets.innerHTML = `Conectando...`;
    saveFirebaseConfig(apiKey, dbUrl, projectId);
    
    const initialized = await initFirebase();
    if (initialized) {
        btnConnectSheets.innerHTML = `<i data-lucide="link"></i> Salvar & Conectar`;
        lucide.createIcons();
        showToast("Firebase conectado com sucesso!");
        settingsModal.classList.remove('active');
    } else {
        btnConnectSheets.innerHTML = `<i data-lucide="link"></i> Salvar & Conectar`;
        lucide.createIcons();
        alert("Falha na inicialização do Firebase. Verifique as credenciais inseridas.");
    }
});

btnExportData.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href",     dataStr);
    downloadAnchor.setAttribute("download", `tabela_wolfside_rp_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
});

btnResetData.addEventListener('click', () => {
    if (!isAuthenticated) {
        alert("Acesso Negado! Você precisa estar autenticado para redefinir o banco de dados remoto.");
        return;
    }
    if (confirm("ATENÇÃO: Redefinir todos os dados remotos aos padrões de fábrica? Isso limpará permanentemente o banco do Firebase.")) {
        state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        saveState(true);
        checkAuthStatus().then(() => {
            renderAll();
            showToast("Banco de dados redefinido no Firebase!");
            settingsModal.classList.remove('active');
        });
    }
});

// Relógio UTC
function updateHUDTime() {
    const now = new Date();
    footerTime.innerText = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
}
setInterval(updateHUDTime, 1000);
updateHUDTime();

// ----------------------------------------------------
// 9. INICIALIZAÇÃO DO SISTEMA
// ----------------------------------------------------
function showLoadingState() {
    factionListContainer.innerHTML = `
        <div class="members-empty-state" style="padding: 20px; text-align: center; border: 1px dashed rgba(186, 85, 211, 0.25);">
            <div class="loading-spinner" style="margin: 0 auto 10px; width: 24px; height: 24px; border: 2px solid rgba(186, 85, 211, 0.2); border-top-color: var(--purple-neon); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="font-size: 11px; font-family: var(--font-tech); color: var(--white-muted);">SINCRONIZANDO...</p>
        </div>`;
    consoleWorkspaceArea.innerHTML = `
        <div class="empty-state-notice" style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
            <div class="loading-spinner" style="margin-bottom: 20px; width: 40px; height: 40px; border: 3px solid rgba(186, 85, 211, 0.2); border-top-color: var(--purple-neon); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="font-family:var(--font-tech);font-size:16px;font-weight:600;color:var(--white-muted);margin-bottom:10px;">CONECTANDO AO BANCO DE DADOS</p>
            <span style="font-size:13px;max-width:320px;color:var(--white-dim);">Sincronizando dados em tempo real com o backend do Firebase...</span>
        </div>`;
}

function showErrorState(message) {
    factionListContainer.innerHTML = `
        <div class="members-empty-state" style="padding: 20px; text-align: center; border: 1px dashed #ff3366;">
            <i data-lucide="alert-triangle" style="width: 20px; height: 20px; color: #ff3366; margin-bottom: 8px;"></i>
            <p style="font-size: 11px; font-family: var(--font-tech); color: #ff3366;">ERRO DE CONEXÃO</p>
        </div>`;
    consoleWorkspaceArea.innerHTML = `
        <div class="empty-state-notice" style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
            <i data-lucide="alert-triangle" style="width:48px;height:48px;margin-bottom:20px;color:#ff3366;"></i>
            <p style="font-family:var(--font-tech);font-size:16px;font-weight:600;color:#ff3366;margin-bottom:10px;">ERRO DE CONEXÃO AO BACKEND</p>
            <span style="font-size:13px;max-width:360px;color:var(--white-muted);margin-bottom:15px;">${message}</span>
            <button class="hud-btn" onclick="initSystem()"><i data-lucide="refresh-cw"></i> TENTAR NOVAMENTE</button>
        </div>`;
    lucide.createIcons();
}

async function initSystem() {
    await checkAuthStatus();
    showLoadingState();
    
    const initialized = await initFirebase();
    if (!initialized) {
        showErrorState("Falha ao inicializar a conexão com o Firebase. Verifique se as credenciais estão corretas nas Configurações.");
    }
}

initSystem();

// ----------------------------------------------------
// 10. COMPONENTE DE NOTIFICAÇÃO (TOAST PREMIUM NEON)
// ----------------------------------------------------
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `hud-toast ${type}`;
    toast.innerHTML = `
        <div class="toast-glow"></div>
        <i data-lucide="info" style="width:16px;height:16px;"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    // Trigger de transição (slide-in)
    setTimeout(() => {
        toast.classList.add('active');
    }, 10);

    // Slide-out e remoção do DOM
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 3500);
}

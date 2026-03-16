import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, onSnapshot, orderBy, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ⚠️ ใส่ Config Firebase ของคุณตรงนี้
const firebaseConfig = {
    apiKey: "AIzaSyDHMRKJovs43b4CWdJOUbUlO5BEekqCmBI",
    authDomain: "servicenow-2b0cd.firebaseapp.com",
    projectId: "servicenow-2b0cd",
    storageBucket: "servicenow-2b0cd.firebasestorage.app",
    messagingSenderId: "1050981111123",
    appId: "1:1050981111123:web:e6adfe818b041d26fbbda6",
    measurementId: "G-YJQS2G1S64"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });

// --- Time Formatter ---
function timeAgo(date) {
    if(!date) return '-';
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
}

// --- 🌐 ระบบภาษาฉบับสมบูรณ์ (Dictionary) ---
const dict = {
    en: {
        page_title: "Factory IT Service Center",
        app_name: "Factory IT Service Center",
        app_name_short: "Factory IT",
        auth_sub: "Enterprise Service Desk",
        email: "Email",
        password: "Password",
        btn_signin: "Sign In",
        no_account: "New here?",
        btn_register: "Create an account",
        auth_or: "OR",
        btn_google: "Continue with Google",
        role_user: "User",
        role_admin: "IT Admin",
        menu_group_1: "Workspace",
        menu_group_2: "Admin",
        menu_dash: "Dashboard",
        menu_incidents: "My Tickets",
        menu_create: "Create Ticket",
        menu_admin: "Command Center",
        btn_logout: "Log Out",
        stat_open: "New Tickets",
        stat_progress: "In Progress",
        stat_resolved: "Resolved",
        stat_total: "Total Volume",
        admin_my_resolved: "My Resolved Tickets",
        th_subject: "Subject",
        th_status: "Status",
        th_date: "Timeline",
        btn_submit: "Submit Request",
        search_placeholder: "Search...",
        btn_new_ticket: "Create",
        form_title: "How can we help?",
        form_sub: "Fill out the details below to open a new support request.",
        form_cat: "Category",
        form_pri: "Priority",
        form_short: "Subject",
        form_desc: "Description",
        btn_export: "Export CSV",
        dash_welcome: "Welcome back,",
        dash_sub: "Here's what's happening with your IT support tickets today.",
        dash_recent: "Recent Activity",
        btn_view_all: "View All",
        dash_status: "System Status",
        dash_status_sub: "All factory IT systems are running smoothly.",
        sys_net: "Network",
        sys_erp: "ERP System",
        cat_hw: "❖ Hardware / PC Issue",
        cat_sw: "❖ Software / Application",
        cat_nw: "❖ Network / Internet",
        filter_all: "All",
        filter_active: "Active",
        filter_resolved: "Resolved",
        status_new: "New",
        status_in_progress: "In Progress",
        status_resolved: "Resolved",
        empty_tickets: "No tickets found",
        empty_recent: "All caught up!"
    },
    th: {
        page_title: "ศูนย์บริการไอทีโรงงาน",
        app_name: "ศูนย์บริการไอทีโรงงาน",
        app_name_short: "ศูนย์บริการไอที",
        auth_sub: "ระบบแจ้งซ่อมไอทีองค์กร",
        email: "อีเมล",
        password: "รหัสผ่าน",
        btn_signin: "เข้าสู่ระบบ",
        no_account: "ยังไม่มีบัญชี?",
        btn_register: "สมัครสมาชิก",
        auth_or: "หรือ",
        btn_google: "ดำเนินการต่อด้วย Google",
        role_user: "ผู้แจ้ง",
        role_admin: "เจ้าหน้าที่ไอที",
        menu_group_1: "พื้นที่ทำงาน",
        menu_group_2: "ผู้ดูแลระบบ",
        menu_dash: "ภาพรวมระบบ",
        menu_incidents: "ตั๋วของฉัน",
        menu_create: "แจ้งปัญหาใหม่",
        menu_admin: "ศูนย์จัดการงาน",
        btn_logout: "ออกจากระบบ",
        stat_open: "รอดำเนินการ",
        stat_progress: "กำลังแก้ไข",
        stat_resolved: "ปิดงานแล้ว",
        stat_total: "จำนวนทั้งหมด",
        admin_my_resolved: "งานที่ฉันปิดแล้ว",
        th_subject: "หัวข้อ",
        th_status: "สถานะ",
        th_date: "อัปเดตล่าสุด",
        btn_submit: "ส่งเรื่องแจ้งซ่อม",
        search_placeholder: "ค้นหา...",
        btn_new_ticket: "สร้างตั๋วใหม่",
        form_title: "มีอะไรให้เราช่วยไหม?",
        form_sub: "ระบุรายละเอียดเพื่อให้ไอทีช่วยเหลือคุณ",
        form_cat: "หมวดหมู่",
        form_pri: "ความเร่งด่วน",
        form_short: "หัวข้อ",
        form_desc: "รายละเอียด",
        btn_export: "ดาวน์โหลด CSV",
        dash_welcome: "ยินดีต้อนรับ,",
        dash_sub: "สรุปภาพรวมการแจ้งซ่อมไอทีของคุณในวันนี้",
        dash_recent: "รายการอัปเดตล่าสุด",
        btn_view_all: "ดูทั้งหมด",
        dash_status: "สถานะระบบโรงงาน",
        dash_status_sub: "ระบบไอทีทั้งหมดทำงานได้อย่างสมบูรณ์",
        sys_net: "ระบบเครือข่าย",
        sys_erp: "ระบบ ERP",
        cat_hw: "❖ ฮาร์ดแวร์ / เครื่องคอมพิวเตอร์",
        cat_sw: "❖ ซอฟต์แวร์ / โปรแกรม",
        cat_nw: "❖ เครือข่าย / อินเทอร์เน็ต",
        filter_all: "ทั้งหมด",
        filter_active: "กำลังดำเนินการ",
        filter_resolved: "ปิดงานแล้ว",
        status_new: "เปิดใหม่",
        status_in_progress: "กำลังดำเนินการ",
        status_resolved: "ปิดงานแล้ว",
        empty_tickets: "ไม่พบตั๋วแจ้งซ่อม",
        empty_recent: "จัดการครบหมดแล้ว!"
    }
};

let currentLang = localStorage.getItem('appLang') || 'en';
let isAdmin = false;
let isLoginMode = true;
let currentAdminFilter = 'All';
window.globalTickets = {};
let currentTicketId = null;
let chatUnsubscribe = null;

// --- Core UI Logic ---
window.toggleMobileMenu = () => {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('open');
};

window.toggleLang = (lang) => {
    currentLang = lang;
    localStorage.setItem('appLang', lang);
    
    // 1. Title Page
    document.getElementById('page-title-tag').innerText = dict[lang].page_title;

    // 2. Text Content (data-i18n)
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.getAttribute('data-i18n');
        if(dict[lang][k]) el.innerText = dict[lang][k];
    });
    
    // 3. Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const k = el.getAttribute('data-i18n-placeholder');
        if(dict[lang][k]) el.placeholder = dict[lang][k];
    });

    // 4. Categories
    const optHw = document.getElementById('opt-hw');
    const optSw = document.getElementById('opt-sw');
    const optNw = document.getElementById('opt-nw');
    if(optHw) optHw.innerText = dict[lang].cat_hw;
    if(optSw) optSw.innerText = dict[lang].cat_sw;
    if(optNw) optNw.innerText = dict[lang].cat_nw;

    // 5. Priority Description Update
    if(typeof window.updatePriorityDesc === 'function') {
        window.updatePriorityDesc(); 
    }

    // 6. Buttons EN/TH active state
    ['auth', 'app'].forEach(view => {
        const btnEn = document.getElementById(`lang-en-${view}`);
        const btnTh = document.getElementById(`lang-th-${view}`);
        if (btnEn && btnTh) {
            if (lang === 'en') {
                btnEn.className = view === 'app' ? "px-4 py-1.5 bg-white text-blue-600 rounded-full text-xs font-bold shadow-sm transition" : "px-4 py-1.5 bg-blue-600 text-white rounded-full text-xs font-bold shadow-lg shadow-blue-500/30 transition transform hover:scale-105";
                btnTh.className = view === 'app' ? "px-4 py-1.5 text-slate-500 hover:text-slate-700 rounded-full text-xs font-bold transition" : "px-4 py-1.5 bg-white/10 text-white backdrop-blur rounded-full border border-white/20 text-xs font-bold hover:bg-white/20 transition transform hover:scale-105";
            } else {
                btnTh.className = view === 'app' ? "px-4 py-1.5 bg-white text-blue-600 rounded-full text-xs font-bold shadow-sm transition" : "px-4 py-1.5 bg-blue-600 text-white rounded-full text-xs font-bold shadow-lg shadow-blue-500/30 transition transform hover:scale-105";
                btnEn.className = view === 'app' ? "px-4 py-1.5 text-slate-500 hover:text-slate-700 rounded-full text-xs font-bold transition" : "px-4 py-1.5 bg-white/10 text-white backdrop-blur rounded-full border border-white/20 text-xs font-bold hover:bg-white/20 transition transform hover:scale-105";
            }
        }
    });

    let activeTab = document.querySelector('.tab-content.active');
    if(activeTab) {
        let tabId = activeTab.id.replace('tab-', '');
        document.getElementById('page-title').innerText = dict[lang][`menu_${tabId}`] || dict[lang].app_name;
    }
};

window.updatePriorityDesc = () => {
    const select = document.getElementById('tk-priority');
    if(!select) return;
    const val = select.value;
    
    const thTexts = {
        "4 - Low": "● กระทบรายบุคคล - SLA: แก้ไขภายใน 3 วัน",
        "3 - Moderate": "● กระทบระดับแผนก - SLA: แก้ไขภายใน 24 ชม.",
        "2 - High": "● กระทบวงกว้าง - SLA: แก้ไขภายใน 4 ชม.",
        "1 - Critical": "● ระบบหลักล่ม - SLA: แก้ไขภายใน 1 ชม."
    };
    const enTexts = {
        "4 - Low": "● Individual impact - SLA: 3 Days",
        "3 - Moderate": "● Department impact - SLA: 24 Hours",
        "2 - High": "● Business degraded - SLA: 4 Hours",
        "1 - Critical": "● Total failure - SLA: 1 Hour"
    };

    const descColors = {
        "4 - Low": "bg-emerald-50/50 border-emerald-100 text-emerald-800",
        "3 - Moderate": "bg-amber-50/50 border-amber-100 text-amber-800",
        "2 - High": "bg-orange-50/50 border-orange-100 text-orange-800",
        "1 - Critical": "bg-rose-50/50 border-rose-100 text-rose-800"
    };
    const iconColors = {
        "4 - Low": "text-emerald-500",
        "3 - Moderate": "text-amber-500",
        "2 - High": "text-orange-500",
        "1 - Critical": "text-rose-500"
    };

    document.getElementById('priority-text').innerText = currentLang === 'th' ? thTexts[val] : enTexts[val];
    document.getElementById('priority-desc').className = `p-4 rounded-xl border text-xs flex gap-3 items-start transition-colors ${descColors[val]}`;
    document.getElementById('priority-icon').className = `fas fa-info-circle mt-0.5 ${iconColors[val]}`;
};

window.switchTab = (tabName) => {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.menu-link').forEach(el => el.classList.remove('active'));
    setTimeout(() => { document.getElementById(`tab-${tabName}`).classList.add('active'); }, 10);
    event.currentTarget?.classList.add('active');
    document.getElementById('page-title').innerText = dict[currentLang][`menu_${tabName}`] || dict[currentLang].app_name;
    if(window.innerWidth <= 768 && document.getElementById('sidebar').classList.contains('open')) toggleMobileMenu();
};

window.toggleAuthMode = () => {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-submit-btn').innerText = isLoginMode ? dict[currentLang].btn_signin : dict[currentLang].btn_register;
    document.getElementById('auth-switch-text').innerText = isLoginMode ? dict[currentLang].no_account : (currentLang === 'th' ? "มีบัญชีอยู่แล้ว?" : "Already have an account?");
    document.getElementById('auth-switch-btn').innerText = isLoginMode ? dict[currentLang].btn_register : dict[currentLang].btn_signin;
};

// --- AI Modal Functions ---
window.openAIModal = () => {
    const modal = document.getElementById('ai-modal');
    const box = document.getElementById('ai-box');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => { modal.style.opacity = '1'; box.classList.remove('scale-95'); box.classList.add('scale-100'); }, 10);
    if(window.innerWidth <= 768 && document.getElementById('sidebar').classList.contains('open')) toggleMobileMenu();
};

window.closeAIModal = () => {
    const modal = document.getElementById('ai-modal');
    const box = document.getElementById('ai-box');
    modal.style.opacity = '0';
    box.classList.remove('scale-100');
    box.classList.add('scale-95');
    setTimeout(() => { modal.classList.add('hidden'); modal.classList.remove('flex'); }, 300);
};

window.sendAIMessage = async () => {
    const input = document.getElementById('ai-input');
    const text = input.value.trim();
    if (!text) return;
    
    const consoleBox = document.getElementById('ai-chat-box');
    consoleBox.innerHTML += `<div class="flex items-start gap-4 mb-6 flex-row-reverse chat-user-bubble"><div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 shadow-sm"><i class="fas fa-user text-[10px]"></i></div><div class="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-sm shadow-md text-sm leading-relaxed max-w-[85%]">${text}</div></div>`;
    input.value = '';
    consoleBox.scrollTop = consoleBox.scrollHeight;

    const thinkingId = 'think-' + Date.now();
    consoleBox.innerHTML += `<div id="${thinkingId}" class="flex items-start gap-4 mb-6 chat-ai-bubble"><div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0"><i class="fas fa-robot text-[10px]"></i></div><div class="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-sm text-sm text-slate-400 flex gap-1"><span class="animate-bounce">●</span><span class="animate-bounce" style="animation-delay: 0.2s">●</span><span class="animate-bounce" style="animation-delay: 0.4s">●</span></div></div>`;
    consoleBox.scrollTop = consoleBox.scrollHeight;

    try {
        // ⚠️ API Key ของ Gemini
        const API_KEY = "AIzaSyAaY8XgpGstda6Q9bJ22sqvupyy222LKsolV2222TA22222222"; 
        const currentData = JSON.stringify(Object.values(window.globalTickets || {}).map(t => ({ Subject: t.subject, Status: t.status, Category: t.category })));
        
        const prompt = `คุณคือ Serviceman ผู้ช่วยส่วนตัวอัจฉริยะ และพนักงานฝ่าย IT ประจำโรงงาน ข้อมูลตั๋วแจ้งซ่อมในระบบปัจจุบัน (JSON): ${currentData}\nกฎการตอบ: 1. ถ้าผู้ใช้ถามเรื่องงาน IT ให้อ่านและวิเคราะห์จากข้อมูล JSON ด้านบน 2. ถ้าผู้ใช้ถามเรื่องทั่วไป ให้ตอบแบบรอบรู้เหมือน AI ทั่วไป โดยใช้ความรู้ที่คุณมี 3. ใช้ภาษาไทย สุภาพ เป็นธรรมชาติ จัดรูปแบบให้อ่านง่าย (ใช้ HTML tags เช่น <br>, <strong> ห้ามใช้ Markdown ** เด็ดขาด)\nคำถามจากผู้ใช้: "${text}"`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        document.getElementById(thinkingId).remove();
        if (data.error) throw new Error(data.error.message);
        
        let rawText = data.candidates[0].content.parts[0].text;
        let formattedText = rawText.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-600">$1</strong>').replace(/\*(.*?)/g, '<li class="ml-4 mt-1">$1</li>').replace(/\n/g, '<br>');
        
        consoleBox.innerHTML += `<div class="flex items-start gap-4 mb-6 chat-ai-bubble"><div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0 shadow-md"><i class="fas fa-robot text-[10px]"></i></div><div class="bg-slate-50 border border-slate-100 p-5 rounded-2xl rounded-tl-sm shadow-sm text-sm text-slate-700 leading-relaxed max-w-[85%]">${formattedText}</div></div>`;
        consoleBox.scrollTop = consoleBox.scrollHeight;
    } catch (error) {
        document.getElementById(thinkingId).remove();
        consoleBox.innerHTML += `<div class="flex items-start gap-4 mb-6"><div class="bg-rose-50 text-rose-600 p-4 rounded-2xl rounded-tl-sm text-sm"><i class="fas fa-exclamation-triangle mr-2"></i> Error: ${error.message}</div></div>`;
    }
};

// --- Auth Forms ---
document.getElementById('auth-form').onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-password').value;
    const action = isLoginMode ? signInWithEmailAndPassword : createUserWithEmailAndPassword;
    action(auth, email, pass).catch(error => {
        Swal.fire({ icon: 'error', text: error.message, confirmButtonColor: '#3b82f6' });
    });
};

window.loginWithGoogle = () => {
    signInWithPopup(auth, googleProvider).catch(error => {
        Swal.fire({ icon: 'error', text: error.message, confirmButtonColor: '#3b82f6' });
    });
};

document.getElementById('btn-logout').onclick = () => {
    Swal.fire({
        title: currentLang === 'th' ? 'ออกจากระบบ?' : 'Sign Out?',
        icon: 'question', showCancelButton: true, confirmButtonColor: '#e11d48',
        confirmButtonText: currentLang === 'th' ? 'ยืนยัน' : 'Yes',
        cancelButtonText: currentLang === 'th' ? 'ยกเลิก' : 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) signOut(auth).then(() => window.location.reload());
    });
};

// --- Core Data Loading ---
function loadDashboardData() {
    const q = query(collection(db, "incidents"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        let userHtml = "";
        let adminHtml = "";
        let recentDashHtml = "";
        let counts = { New: 0, "In Progress": 0, Resolved: 0, Total: 0 };
        let myResolved = 0;
        let recentCount = 0;
        
        const emptyState = `<tr><td colspan="4" class="p-16 text-center text-slate-400"><i class="fas fa-inbox text-5xl mb-4 opacity-20 block"></i><p class="font-medium text-sm" data-i18n="empty_tickets">${dict[currentLang].empty_tickets}</p></td></tr>`;
        const emptyRecent = `<div class="p-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl"><i class="fas fa-check-circle text-4xl mb-3 opacity-20 block"></i><p class="text-xs font-bold uppercase tracking-widest" data-i18n="empty_recent">${dict[currentLang].empty_recent}</p></div>`;
        
        snapshot.forEach((docSnap) => {
            const t = docSnap.data();
            const id = docSnap.id;
            const displayId = "TKT-" + id.substring(0, 4).toUpperCase();
            window.globalTickets[id] = t;
            
            if(t.status === 'Resolved' && t.assignedTo === auth.currentUser.email) myResolved++;
            
            counts[t.status] = (counts[t.status] || 0) + 1;
            counts['Total']++;

            const bgColors = { 'New': 'bg-blue-100 text-blue-700', 'In Progress': 'bg-amber-100 text-amber-700', 'Resolved': 'bg-emerald-100 text-emerald-700' };
            let statusKey = 'status_' + t.status.toLowerCase().replace(' ', '_');
            let displayStatus = dict[currentLang][statusKey] || t.status;
            let statusHtml = `<span class="${bgColors[t.status]} px-3 py-1.5 rounded-md text-[10px] uppercase font-black tracking-widest flex w-fit gap-1 items-center"><span class="w-1.5 h-1.5 rounded-full ${t.status==='New'?'bg-blue-500':(t.status==='In Progress'?'bg-amber-500':'bg-emerald-500')}"></span><span data-i18n="${statusKey}">${displayStatus}</span></span>`;

            let priIndicator = t.priority.includes('1') ? '<i class="fas fa-fire text-rose-500 mr-2"></i>' : (t.priority.includes('2') ? '<i class="fas fa-exclamation-circle text-orange-500 mr-2"></i>' : '');

            if (t.callerEmail === auth.currentUser.email) {
                userHtml += `<tr class="hover:bg-slate-50 transition group border-b border-slate-50">
                    <td class="py-4 px-6 font-bold text-slate-500 text-xs">${displayId}</td>
                    <td class="py-4 px-6"><div class="font-bold text-slate-800 text-sm">${priIndicator}${t.subject}</div></td>
                    <td class="py-4 px-6">${statusHtml}</td>
                    <td class="py-4 px-6 text-right text-xs text-slate-500">${timeAgo(t.createdAt?.toDate())}</td>
                </tr>`;
            }

            if (isAdmin) {
                adminHtml += `<tr class="hover:bg-slate-50 transition group border-b border-slate-50" data-status="${t.status}">
                    <td class="py-4 px-4 font-bold text-slate-500 cursor-pointer text-xs" onclick="openModal('${id}')">${displayId}</td>
                    <td class="py-4 px-4 cursor-pointer" onclick="openModal('${id}')"><div class="font-bold text-slate-800 text-sm">${priIndicator}${t.subject}</div><div class="text-[10px] text-slate-400 mt-0.5">${t.callerEmail}</div></td>
                    <td class="py-4 px-4 text-xs font-bold text-slate-600">${t.assignedTo ? t.assignedTo.split('@')[0].toUpperCase() : '-'}</td>
                    <td class="py-4 px-4">${statusHtml}</td>
                    <td class="py-4 px-4 text-right opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        <button onclick="event.stopPropagation(); editTicket('${id}')" class="w-8 h-8 bg-white border border-blue-200 text-blue-500 rounded-lg hover:bg-blue-50 transition shadow-sm mr-1"><i class="fas fa-edit text-xs"></i></button>
                        <button onclick="event.stopPropagation(); updateTicket('${id}', 'In Progress')" class="w-8 h-8 bg-white border border-amber-200 text-amber-500 rounded-lg hover:bg-amber-50 transition shadow-sm mr-1"><i class="fas fa-play text-xs"></i></button>
                        <button onclick="event.stopPropagation(); updateTicket('${id}', 'Resolved')" class="w-8 h-8 bg-white border border-emerald-200 text-emerald-500 rounded-lg hover:bg-emerald-50 transition shadow-sm mr-2"><i class="fas fa-check text-xs"></i></button>
                        <button onclick="event.stopPropagation(); deleteTicket('${id}')" class="w-8 h-8 bg-white border border-rose-200 text-rose-500 rounded-lg hover:bg-rose-50 transition shadow-sm"><i class="fas fa-trash text-xs"></i></button>
                    </td></tr>`;
            }

            if (recentCount < 5) {
                recentDashHtml += `
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition cursor-pointer" onclick="openModal('${id}')">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500"><i class="fas fa-ticket-alt"></i></div>
                        <div>
                            <p class="text-sm font-bold text-slate-800">${t.subject}</p>
                            <p class="text-[10px] text-slate-400 font-bold uppercase">${displayId} • ${timeAgo(t.createdAt?.toDate())}</p>
                        </div>
                    </div>
                    ${statusHtml}
                </div>`;
                recentCount++;
            }
        });

        document.getElementById('user-ticket-list').innerHTML = userHtml || emptyState;
        if(isAdmin) document.getElementById('admin-ticket-list').innerHTML = adminHtml || emptyState;
        
        document.getElementById('stat-new').innerText = counts['New'];
        document.getElementById('stat-progress').innerText = counts['In Progress'];
        document.getElementById('stat-resolved').innerText = counts['Resolved'];
        document.getElementById('stat-total').innerText = counts['Total'];
        document.getElementById('stat-admin-my-resolved').innerText = myResolved;
        document.getElementById('dash-recent-list').innerHTML = recentDashHtml || emptyRecent;

        const userName = auth.currentUser.displayName ? auth.currentUser.displayName.split(' ')[0] : auth.currentUser.email.split('@')[0];
        document.getElementById('dash-user-name').innerText = userName.charAt(0).toUpperCase() + userName.slice(1);
        
        if(isAdmin) setAdminFilter(currentAdminFilter);
    });
}

// --- Ticket Creation ---
document.getElementById('create-ticket-form').onsubmit = async (e) => {
    e.preventDefault();
    try {
        const docRef = await addDoc(collection(db, "incidents"), {
            callerEmail: auth.currentUser.email,
            category: document.getElementById('tk-category').value,
            priority: document.getElementById('tk-priority').value,
            subject: document.getElementById('tk-subject').value,
            description: document.getElementById('tk-desc').value,
            status: 'New',
            assignedTo: null,
            createdAt: new Date()
        });
        
        await addDoc(collection(db, "incidents", docRef.id, "comments"), {
            senderEmail: "system", text: "Ticket created and sent to IT Queue.", createdAt: new Date()
        });
        
        document.getElementById('create-ticket-form').reset();
        window.updatePriorityDesc();
        Toast.fire({ icon: 'success', title: currentLang === 'th' ? 'สร้างตั๋วสำเร็จ!' : 'Ticket Created!' });
        switchTab('incidents');
    } catch (error) {
        Swal.fire({ icon: 'error', text: error.message, confirmButtonColor: '#3b82f6' });
    }
};

// --- Ticket Updates ---
window.updateTicket = (id, newStatus) => {
    updateDoc(doc(db, "incidents", id), { status: newStatus, assignedTo: auth.currentUser.email }).then(() => {
        addDoc(collection(db, "incidents", id, "comments"), { senderEmail: "system", text: `Status updated to ${newStatus} by ${auth.currentUser.email.split('@')[0]}`, createdAt: new Date() });
        Toast.fire({ icon: 'success', title: currentLang === 'th' ? 'อัปเดตสถานะแล้ว' : 'Status Updated' });
    });
};

window.deleteTicket = (id) => {
    Swal.fire({ title: currentLang === 'th' ? 'ลบตั๋วนี้?' : 'Delete Ticket?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#e11d48', confirmButtonText: currentLang === 'th' ? 'ลบเลย' : 'Delete', cancelButtonText: currentLang === 'th' ? 'ยกเลิก' : 'Cancel' }).then((result) => {
        if (result.isConfirmed) { deleteDoc(doc(db, "incidents", id)); Toast.fire({ icon: 'success', title: currentLang === 'th' ? 'ลบสำเร็จ' : 'Deleted' }); }
    });
};

window.editTicket = (id) => {
    const t = window.globalTickets[id];
    Swal.fire({
        title: currentLang === 'th' ? 'แก้ไขตั๋ว' : 'Edit Ticket Details',
        html: `
        <div class="space-y-4 text-left mt-4">
            <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Subject</label>
                <input id="edit-sub" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" value="${t.subject}">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Category</label>
                    <select id="edit-cat" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none">
                        <option value="Hardware" ${t.category==='Hardware'?'selected':''}>Hardware</option>
                        <option value="Software" ${t.category==='Software'?'selected':''}>Software</option>
                        <option value="Network" ${t.category==='Network'?'selected':''}>Network</option>
                    </select>
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Priority</label>
                    <select id="edit-pri" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none">
                        <option value="4 - Low" ${t.priority==='4 - Low'?'selected':''}>Low</option>
                        <option value="3 - Moderate" ${t.priority==='3 - Moderate'?'selected':''}>Moderate</option>
                        <option value="2 - High" ${t.priority==='2 - High'?'selected':''}>High</option>
                        <option value="1 - Critical" ${t.priority==='1 - Critical'?'selected':''}>Critical</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Description</label>
                <textarea id="edit-desc" rows="4" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-blue-500/20 outline-none">${t.description}</textarea>
            </div>
        </div>`,
        focusConfirm: false, showCancelButton: true, confirmButtonColor: '#3b82f6', 
        confirmButtonText: currentLang === 'th' ? 'บันทึกข้อมูล' : 'Save Changes', cancelButtonText: currentLang === 'th' ? 'ยกเลิก' : 'Cancel',
        preConfirm: () => {
            return {
                subject: document.getElementById('edit-sub').value,
                category: document.getElementById('edit-cat').value,
                priority: document.getElementById('edit-pri').value,
                description: document.getElementById('edit-desc').value
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            updateDoc(doc(db, "incidents", id), result.value);
            Toast.fire({ icon: 'success', title: currentLang === 'th' ? 'อัปเดตข้อมูลสำเร็จ' : 'Updated' });
        }
    });
};

// --- CSV Export ---
window.exportCSV = () => {
    let csv = "ID,Subject,Status,Priority,Category,Caller,AssignedTo,Date\n";
    for(let id in window.globalTickets) {
        let t = window.globalTickets[id];
        let dateStr = t.createdAt ? t.createdAt.toDate().toISOString() : "";
        csv += `${id},"${t.subject}",${t.status},"${t.priority}",${t.category},${t.callerEmail},${t.assignedTo||''},${dateStr}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FactoryIT_Tickets_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
};

// --- Filtering ---
window.filterTickets = (tableId, inputId) => {
    const input = document.getElementById(inputId).value.toUpperCase();
    const trs = document.getElementById(tableId).getElementsByTagName("tr");
    for (let i=1; i<trs.length; i++) { 
        trs[i].style.display = trs[i].innerText.toUpperCase().includes(input) ? "" : "none"; 
    }
};

window.setAdminFilter = (f) => {
    currentAdminFilter = f;
    const act = "px-5 py-2 rounded-lg text-xs font-bold bg-white shadow-sm text-slate-800 transition";
    const inact = "px-5 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 transition";
    ['All', 'Active', 'Resolved'].forEach(btn => { document.getElementById(`btn-filter-${btn}`).className = btn === f ? act : inact; });
    
    let trs = document.getElementById('admin-ticket-list').getElementsByTagName('tr');
    for(let tr of trs) { 
        let s = tr.getAttribute('data-status'); 
        if(f === 'All') tr.style.display = '';
        else if(f === 'Active' && s !== 'Resolved') tr.style.display = '';
        else if(f === 'Resolved' && s === 'Resolved') tr.style.display = ''; 
        else tr.style.display = 'none'; 
    }
};

// --- Ticket Detail Modal (Chat) ---
window.openModal = (id) => {
    currentTicketId = id;
    const t = window.globalTickets[id];
    document.getElementById('modal-id').innerText = "TKT-" + id.substring(0, 4).toUpperCase();
    document.getElementById('modal-subject').innerText = t.subject;
    document.getElementById('modal-category').innerText = t.category;
    document.getElementById('modal-priority').innerText = t.priority;
    document.getElementById('modal-desc').innerText = t.description;
    document.getElementById('modal-caller').innerText = t.callerEmail;
    document.getElementById('modal-assignee').innerText = t.assignedTo || 'Unassigned';
    document.getElementById('modal-date').innerText = t.createdAt ? t.createdAt.toDate().toLocaleString() : '';
    
    if(isAdmin) document.getElementById('btn-modal-edit').classList.remove('hidden');

    const bgColors = { 'New': 'bg-blue-100 text-blue-700', 'In Progress': 'bg-amber-100 text-amber-700', 'Resolved': 'bg-emerald-100 text-emerald-700' };
    let statusKey = 'status_' + t.status.toLowerCase().replace(' ', '_');
    let displayStatus = dict[currentLang][statusKey] || t.status;
    
    document.getElementById('modal-status-badge').innerHTML = `<span class="${bgColors[t.status]} px-4 py-1.5 rounded-lg text-xs uppercase font-black tracking-widest flex items-center gap-2"><span class="w-2 h-2 rounded-full ${t.status==='New'?'bg-blue-500':(t.status==='In Progress'?'bg-amber-500':'bg-emerald-500')}"></span><span data-i18n="${statusKey}">${displayStatus}</span></span>`;

    const modal = document.getElementById('ticket-modal');
    const box = document.getElementById('modal-box');
    modal.classList.remove('hidden');
    setTimeout(() => { modal.style.opacity = '1'; box.classList.remove('scale-95'); box.classList.add('scale-100'); }, 10);

    const q = query(collection(db, "incidents", id, "comments"), orderBy("createdAt", "asc"));
    chatUnsubscribe = onSnapshot(q, (snapshot) => {
        let html = "";
        snapshot.forEach(doc => {
            const d = doc.data();
            const timeStr = d.createdAt ? d.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
            if(d.senderEmail === 'system') {
                html += `<div class="system-msg-container flex justify-center my-4"><span class="system-msg-pill shadow-sm"><i class="fas fa-cog mr-1 opacity-50"></i> ${d.text}</span></div>`;
            } else {
                const isMe = d.senderEmail === auth.currentUser.email;
                const align = isMe ? 'items-end' : 'items-start';
                const style = isMe ? 'chat-bubble-me' : 'chat-bubble-other';
                const senderName = isMe ? (currentLang === 'th'?'คุณ':'You') : d.senderEmail.split('@')[0];
                html += `<div class="flex flex-col ${align}"><div class="${style} chat-bubble"><div class="chat-sender-name">${senderName} • ${timeStr}</div>${d.text}</div></div>`;
            }
        });
        document.getElementById('chat-messages').innerHTML = html;
        document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
    });
};

window.closeModal = () => {
    const modal = document.getElementById('ticket-modal');
    const box = document.getElementById('modal-box');
    modal.style.opacity = '0';
    box.classList.remove('scale-100');
    box.classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
    if(chatUnsubscribe) chatUnsubscribe();
};

document.getElementById('comment-form').onsubmit = (e) => {
    e.preventDefault();
    const text = document.getElementById('comment-text').value;
    addDoc(collection(db, "incidents", currentTicketId, "comments"), {
        senderEmail: auth.currentUser.email, text: text, createdAt: new Date()
    });
    document.getElementById('comment-form').reset();
};

// --- Init Auth State ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-view').classList.remove('active');
        document.getElementById('app-view').classList.add('active');
        document.getElementById('user-email').innerText = user.email;
        
        // เช็คสิทธิ์ Admin
        const safeEmail = user.email ? user.email.toLowerCase().trim() : "";
        isAdmin = safeEmail === "nattezava1996@gmail.com" || safeEmail.includes("admin");
        
        // 🔴 แก้ไขตรงนี้: สั่งเปลี่ยนค่า data-i18n เพื่อไม่ให้ระบบแปลภาษาทับค่าเดิม
        const roleElement = document.getElementById('user-role');
        if (isAdmin) {
            roleElement.setAttribute('data-i18n', 'role_admin');
            roleElement.classList.replace('text-blue-400', 'text-rose-400'); // เปลี่ยนสีให้ Admin (สีแดงกุหลาบ) จะได้ดูแตกต่าง
        } else {
            roleElement.setAttribute('data-i18n', 'role_user');
            roleElement.classList.replace('text-rose-400', 'text-blue-400'); // สีฟ้าสำหรับ User
        }
        
        // แสดง/ซ่อน เมนู Admin
        if(isAdmin) {
            document.getElementById('admin-menu').classList.remove('hidden');
        } else {
            document.getElementById('admin-menu').classList.add('hidden');
        }
        
        loadDashboardData();
        window.updatePriorityDesc();
    } else {
        document.getElementById('app-view').classList.remove('active');
        document.getElementById('auth-view').classList.add('active');
    }
    
    // ฟังก์ชันแปลภาษาจะถูกเรียกตรงนี้ และจะดึงคำว่า IT Admin มาแสดงได้ถูกต้องแล้ว
    toggleLang(currentLang); 
});

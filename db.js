const DB_KEY = 'hk_spa_db';
let db = { users: [], inventory: [], requests: [], reports: [] };
let currentUser = null;

// Setup SweetAlert2 Toast configuration
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

function showToast(msg, type = 'success') {
    Toast.fire({ icon: type, title: msg });
}

function initDB() {
    const stored = localStorage.getItem(DB_KEY);
    if (stored) {
        db = JSON.parse(stored);
    } else {
        // Mock Data
        db.users = [
            { id: 'u1', username: 'admin', password: 'admin', role: 'admin', name: 'มานะ หัวหน้าคลัง', phone: '081-111-1111' },
            { id: 'u2', username: 'user', password: 'user', role: 'user', name: 'สมหญิง แม่บ้าน', phone: '082-222-2222' }
        ];
        db.inventory = [
            { id: 'i1', code: 'LN-001', name: 'ผ้าเช็ดตัว (ผืนใหญ่)', category: 'ผ้าและเครื่องนอน', qty: 250, unit: 'ผืน' },
            { id: 'i2', code: 'CH-001', name: 'น้ำยาล้างห้องน้ำ', category: 'น้ำยาทำความสะอาด', qty: 50, unit: 'แกลลอน' },
            { id: 'i3', code: 'AM-001', name: 'สบู่ก้อน', category: 'ของใช้ในห้องพัก', qty: 500, unit: 'ก้อน' },
            { id: 'i4', code: 'AM-002', name: 'แชมพู', category: 'ของใช้ในห้องพัก', qty: 450, unit: 'ขวด' }
        ];
        saveDB();
    }
}

function saveDB() {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function formatDate(isoStr) {
    const date = new Date(isoStr);
    return date.toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function updateClock() {
    const el = document.getElementById('current-datetime');
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateClock, 60000);

function logout() {
    Swal.fire({
        title: 'ออกจากระบบ?',
        text: "คุณต้องการออกจากระบบใช่หรือไม่?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'ใช่, ออกจากระบบ',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('hk_curr_user');
            window.location.href = 'login.html';
        }
    });
}

function checkAuth(requiredRole = null) {
    initDB();
    const saved = localStorage.getItem('hk_curr_user');
    
    if (!saved) {
        if (window.location.pathname.indexOf('login.html') === -1) {
            window.location.href = 'login.html';
        }
        return;
    }

    currentUser = JSON.parse(saved);
    
    // Redirect rules
    if (requiredRole && currentUser.role !== requiredRole) {
        window.location.href = currentUser.role === 'admin' ? 'admin.html' : 'user.html';
    } else if (window.location.pathname.indexOf('login.html') !== -1) {
        window.location.href = currentUser.role === 'admin' ? 'admin.html' : 'user.html';
    }
}
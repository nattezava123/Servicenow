// จำลอง Database ด้วย LocalStorage
const initDB = () => {
    if (!localStorage.getItem('hk_users')) {
        localStorage.setItem('hk_users', JSON.stringify([
            { id: 1, username: 'admin', password: '123', role: 'admin', name: 'เจ้าหน้าที่คลัง', dept: 'คลังวัสดุ' },
            { id: 2, username: 'user1', password: '123', role: 'user', name: 'สมศรี แม่บ้าน', dept: 'แผนกแม่บ้าน' }
        ]));
    }
    if (!localStorage.getItem('hk_items')) {
        localStorage.setItem('hk_items', JSON.stringify([
            { id: 1, name: 'น้ำยาถูพื้น', category: 'น้ำยาทำความสะอาด', balance: 50 },
            { id: 2, name: 'ผ้าขนหนู', category: 'ผ้า', balance: 100 }
        ]));
    }
    if (!localStorage.getItem('hk_requests')) {
        localStorage.setItem('hk_requests', JSON.stringify([]));
    }
};

// ฟังก์ชันช่วยเหลือ (Helper Functions)
const getDB = (table) => JSON.parse(localStorage.getItem(table)) || [];
const setDB = (table, data) => localStorage.setItem(table, JSON.stringify(data));
const getCurrentUser = () => JSON.parse(localStorage.getItem('hk_currentUser'));

const logout = () => {
    Swal.fire({
        title: 'ออกจากระบบ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ออกจากระบบ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#d33'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('hk_currentUser');
            window.location.href = 'login.html';
        }
    });
};

const checkAuth = (requiredRole) => {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
    } else if (requiredRole && user.role !== requiredRole) {
        window.location.href = user.role === 'admin' ? 'admin.html' : 'user.html';
    }
    return user;
};

// เริ่มต้นฐานข้อมูล
initDB();
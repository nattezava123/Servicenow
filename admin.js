const admin = checkAuth('admin');

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    sidebar.classList.toggle('-translate-x-full');
    backdrop.classList.toggle('hidden');
}

function switchTab(tabId) {
    const titles = {
        'dashboard': 'หน้าหลัก (ภาพรวม)',
        'stock': 'จัดการคลังวัสดุ',
        'approve': 'อนุมัติคำขอเบิก/แจ้งชำรุด',
        'users': 'ลงทะเบียน/จัดการพนักงาน'
    };
    if(document.getElementById('mobile-title')) document.getElementById('mobile-title').innerText = titles[tabId];
    
    // Close sidebar on mobile after click
    if (window.innerWidth < 768 && !document.getElementById('sidebar').classList.contains('-translate-x-full')) {
        toggleSidebar();
    }

    const main = document.getElementById('main-content');
    if (tabId === 'dashboard') renderDashboard(main);
    else if (tabId === 'stock') renderStock(main);
    else if (tabId === 'approve') renderApprove(main);
    else if (tabId === 'users') renderUsers(main);
}

function renderDashboard(container) {
    const items = getDB('hk_items');
    const reqs = getDB('hk_requests');
    const pendingReqs = reqs.filter(r => r.status === 'pending').length;
    const damagedReqs = reqs.filter(r => r.type === 'damage').length;
    const lowStock = items.filter(i => i.balance < 10).length;

    container.innerHTML = `
        <h2 class="text-2xl font-bold mb-6 text-gray-800">ภาพรวมระบบ (Dashboard)</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                <p class="text-sm text-gray-500">คำขอรออนุมัติ</p>
                <p class="text-3xl font-bold text-gray-800">${pendingReqs} <span class="text-base font-normal">รายการ</span></p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                <p class="text-sm text-gray-500">รายงานของชำรุด/สูญหาย</p>
                <p class="text-3xl font-bold text-gray-800">${damagedReqs} <span class="text-base font-normal">รายการ</span></p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
                <p class="text-sm text-gray-500">สินค้าใกล้หมด (< 10)</p>
                <p class="text-3xl font-bold text-gray-800">${lowStock} <span class="text-base font-normal">รายการ</span></p>
            </div>
        </div>
    `;
}

function renderStock(container) {
    const items = getDB('hk_items');
    let html = `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-800">จัดการคลังวัสดุ</h2>
            <button onclick="addStockItem()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 shadow-sm"><i class="fas fa-plus"></i> เพิ่มวัสดุ</button>
        </div>
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <table class="w-full text-left border-collapse mobile-table">
                <thead class="bg-gray-50 text-gray-700">
                    <tr><th class="p-4 font-medium">รหัส</th><th class="p-4 font-medium">ชื่อวัสดุ</th><th class="p-4 font-medium">หมวดหมู่</th><th class="p-4 font-medium text-center">คงเหลือ</th><th class="p-4 font-medium text-center">จัดการ</th></tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
    `;
    items.forEach(i => {
        html += `
            <tr class="hover:bg-gray-50 transition">
                <td class="p-4" data-label="รหัส">#${i.id}</td>
                <td class="p-4 font-medium" data-label="ชื่อวัสดุ">${i.name}</td>
                <td class="p-4 text-gray-500" data-label="หมวดหมู่">${i.category}</td>
                <td class="p-4 text-center font-bold ${i.balance < 10 ? 'text-red-500' : 'text-green-600'}" data-label="คงเหลือ">${i.balance}</td>
                <td class="p-4 text-center" data-label="จัดการ">
                    <button onclick="editStock(${i.id})" class="text-blue-500 hover:bg-blue-50 p-2 rounded"><i class="fas fa-edit"></i> ปรับปรุง</button>
                </td>
            </tr>
        `;
    });
    container.innerHTML = html + `</tbody></table></div>`;
}

async function addStockItem() {
    const { value: formValues } = await Swal.fire({
        title: 'เพิ่มวัสดุใหม่',
        html:
            `<input id="swal-input1" class="swal2-input" placeholder="ชื่อวัสดุ">` +
            `<input id="swal-input2" class="swal2-input" placeholder="หมวดหมู่">` +
            `<input id="swal-input3" class="swal2-input" type="number" placeholder="จำนวนเริ่มต้น">`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'บันทึก',
        preConfirm: () => {
            return [
                document.getElementById('swal-input1').value,
                document.getElementById('swal-input2').value,
                parseInt(document.getElementById('swal-input3').value)
            ]
        }
    });

    if (formValues && formValues[0]) {
        const items = getDB('hk_items');
        items.push({ id: items.length ? Math.max(...items.map(i=>i.id))+1 : 1, name: formValues[0], category: formValues[1], balance: formValues[2] || 0 });
        setDB('hk_items', items);
        switchTab('stock');
        Swal.fire({icon: 'success', title: 'เพิ่มข้อมูลแล้ว', toast: true, position: 'top-end', timer: 1500, showConfirmButton: false});
    }
}

async function editStock(id) {
    let items = getDB('hk_items');
    let item = items.find(i => i.id === id);
    const { value: qty } = await Swal.fire({
        title: `ปรับปรุงสต๊อก: ${item.name}`,
        input: 'number',
        inputValue: item.balance,
        showCancelButton: true,
        confirmButtonText: 'บันทึก'
    });
    if (qty) {
        item.balance = parseInt(qty);
        setDB('hk_items', items);
        switchTab('stock');
        Swal.fire({icon: 'success', title: 'อัปเดตแล้ว', toast: true, position: 'top-end', timer: 1500, showConfirmButton: false});
    }
}

function renderApprove(container) {
    const reqs = getDB('hk_requests').filter(r => r.status === 'pending');
    let html = `<h2 class="text-xl font-bold mb-4 text-gray-800">รายการรออนุมัติ</h2>`;
    
    if(reqs.length === 0) {
        html += `<div class="bg-white p-8 text-center text-gray-500 rounded-xl shadow-sm">ไม่มีรายการรออนุมัติ</div>`;
    } else {
        html += `<div class="space-y-4">`;
        reqs.forEach(r => {
            const userReq = getDB('hk_users').find(u => u.id === r.userId);
            html += `
                <div class="bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center border-l-4 ${r.type === 'request' ? 'border-blue-500' : 'border-red-500'}">
                    <div class="mb-3 md:mb-0">
                        <span class="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-600 mb-2 inline-block">${r.date}</span>
                        <h4 class="font-bold text-lg">${r.itemName} x ${r.qty}</h4>
                        <p class="text-sm text-gray-600"><i class="fas fa-user-circle"></i> ${userReq ? userReq.name : 'Unknown'} | ประเภท: ${r.type === 'request' ? 'เบิกวัสดุ' : 'แจ้งชำรุด'}</p>
                    </div>
                    <div class="flex gap-2 w-full md:w-auto">
                        <button onclick="handleApprove(${r.id}, 'approved')" class="flex-1 md:flex-none bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition"><i class="fas fa-check"></i> อนุมัติ</button>
                        <button onclick="handleApprove(${r.id}, 'rejected')" class="flex-1 md:flex-none bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition"><i class="fas fa-times"></i> ปฏิเสธ</button>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    }
    container.innerHTML = html;
}

function handleApprove(reqId, action) {
    let reqs = getDB('hk_requests');
    let items = getDB('hk_items');
    let req = reqs.find(r => r.id === reqId);
    let item = items.find(i => i.id === req.itemId);

    if (action === 'approved') {
        if (req.type === 'request') {
            if (item.balance < req.qty) return Swal.fire('ผิดพลาด', 'สต๊อกไม่เพียงพอ', 'error');
            item.balance -= req.qty;
        } else if (req.type === 'damage') {
            item.balance -= req.qty; // ตัดออกจากระบบเนื่องจากชำรุด
        }
    }
    
    req.status = action;
    setDB('hk_requests', reqs);
    setDB('hk_items', items);
    
    switchTab('approve');
    Swal.fire({icon: 'success', title: action === 'approved' ? 'อนุมัติเรียบร้อย' : 'ปฏิเสธเรียบร้อย', toast: true, position: 'top-end', timer: 1500, showConfirmButton: false});
}

function renderUsers(container) {
    const users = getDB('hk_users').filter(u => u.role === 'user');
    let html = `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-800">จัดการพนักงาน</h2>
        </div>
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <table class="w-full text-left border-collapse mobile-table">
                <thead class="bg-gray-50 text-gray-700">
                    <tr><th class="p-4">Username</th><th class="p-4">ชื่อ-สกุล</th><th class="p-4">แผนก</th></tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
    `;
    users.forEach(u => {
        html += `
            <tr class="hover:bg-gray-50 transition">
                <td class="p-4 font-medium text-blue-600" data-label="Username">${u.username}</td>
                <td class="p-4" data-label="ชื่อ-สกุล">${u.name}</td>
                <td class="p-4 text-gray-500" data-label="แผนก">${u.dept}</td>
            </tr>
        `;
    });
    container.innerHTML = html + `</tbody></table></div>`;
}

// Initial Load
switchTab('dashboard');
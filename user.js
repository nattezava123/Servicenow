const user = checkAuth('user');

function switchTab(tabId) {
    // Update active state in bottom nav
    document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');

    const main = document.getElementById('main-content');
    if (tabId === 'request') renderRequestPage(main);
    else if (tabId === 'history') renderHistoryPage(main);
    else if (tabId === 'profile') renderProfilePage(main);
}

function renderRequestPage(container) {
    const items = getDB('hk_items');
    let html = `
        <h2 class="text-xl font-bold mb-4 text-gray-800">ส่งคำขอเบิกวัสดุ / แจ้งชำรุด</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    `;
    
    items.forEach(item => {
        html += `
            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                    <h3 class="font-bold text-gray-800">${item.name}</h3>
                    <p class="text-sm text-gray-500">คงเหลือ: <span class="font-semibold ${item.balance > 0 ? 'text-green-600' : 'text-red-500'}">${item.balance}</span></p>
                </div>
                <div class="flex gap-2">
                    <button onclick="makeRequest(${item.id}, 'request')" class="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 active:scale-95"><i class="fas fa-plus"></i> เบิก</button>
                    <button onclick="makeRequest(${item.id}, 'damage')" class="bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-200 active:scale-95"><i class="fas fa-exclamation-triangle"></i> ชำรุด</button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html + `</div>`;
}

async function makeRequest(itemId, type) {
    const items = getDB('hk_items');
    const item = items.find(i => i.id === itemId);
    
    const { value: qty } = await Swal.fire({
        title: type === 'request' ? `เบิก ${item.name}` : `แจ้งชำรุด/สูญหาย ${item.name}`,
        input: 'number',
        inputLabel: 'ระบุจำนวน',
        inputValue: 1,
        inputAttributes: { min: 1, max: type === 'request' ? item.balance : 999 },
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก'
    });

    if (qty) {
        if (type === 'request' && parseInt(qty) > item.balance) {
            return Swal.fire('ผิดพลาด', 'จำนวนเบิกเกินยอดคงเหลือ', 'error');
        }
        
        const reqs = getDB('hk_requests');
        reqs.push({
            id: Date.now(),
            userId: user.id,
            itemId: item.id,
            itemName: item.name,
            qty: parseInt(qty),
            type: type,
            status: 'pending',
            date: new Date().toLocaleString('th-TH')
        });
        setDB('hk_requests', reqs);
        
        Swal.fire({
            icon: 'success', title: 'ส่งคำขอสำเร็จ', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500
        });
    }
}

function renderHistoryPage(container) {
    const reqs = getDB('hk_requests').filter(r => r.userId === user.id).reverse();
    let html = `<h2 class="text-xl font-bold mb-4 text-gray-800">สถานะการเบิก / แจ้งชำรุด</h2>`;
    
    if (reqs.length === 0) {
        html += `<p class="text-center text-gray-500 py-8">ไม่มีประวัติทำรายการ</p>`;
    } else {
        html += `<div class="space-y-3">`;
        reqs.forEach(r => {
            const statusColor = r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : (r.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700');
            const statusText = r.status === 'pending' ? 'รออนุมัติ' : (r.status === 'approved' ? 'อนุมัติแล้ว' : 'ไม่อนุมัติ');
            const typeText = r.type === 'request' ? 'เบิกวัสดุ' : 'แจ้งชำรุด';
            
            html += `
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <span class="text-xs font-bold px-2 py-1 rounded-md ${r.type === 'request' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}">${typeText}</span>
                            <span class="text-xs text-gray-400 ml-2">${r.date}</span>
                        </div>
                        <span class="text-xs font-bold px-2 py-1 rounded-md ${statusColor}">${statusText}</span>
                    </div>
                    <div class="flex justify-between items-center mt-2">
                        <h4 class="font-semibold">${r.itemName} <span class="text-gray-500 font-normal">x ${r.qty}</span></h4>
                        ${r.status === 'pending' ? `<button onclick="cancelRequest(${r.id})" class="text-red-500 text-sm hover:underline"><i class="fas fa-times"></i> ยกเลิก</button>` : ''}
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    }
    container.innerHTML = html;
}

function cancelRequest(reqId) {
    Swal.fire({
        title: 'ยืนยันการยกเลิก?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ใช่, ยกเลิกเลย',
        cancelButtonText: 'ปิด'
    }).then((res) => {
        if (res.isConfirmed) {
            let reqs = getDB('hk_requests');
            reqs = reqs.filter(r => r.id !== reqId);
            setDB('hk_requests', reqs);
            switchTab('history');
            Swal.fire({icon:'success', title:'ยกเลิกแล้ว', toast:true, position:'top-end', timer:1500, showConfirmButton:false});
        }
    });
}

function renderProfilePage(container) {
    container.innerHTML = `
        <h2 class="text-xl font-bold mb-4 text-gray-800">แก้ไขประวัติส่วนตัว</h2>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <div>
                <label class="block text-sm text-gray-600 mb-1">ชื่อ - นามสกุล</label>
                <input type="text" id="prof-name" value="${user.name}" class="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
                <label class="block text-sm text-gray-600 mb-1">รหัสผ่านใหม่ (เว้นว่างหากไม่ต้องการเปลี่ยน)</label>
                <input type="password" id="prof-pwd" class="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="********">
            </div>
            <button onclick="saveProfile()" class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 active:scale-95">บันทึกการแก้ไข</button>
        </div>
    `;
}

function saveProfile() {
    const newName = document.getElementById('prof-name').value;
    const newPwd = document.getElementById('prof-pwd').value;
    
    let users = getDB('hk_users');
    let uIndex = users.findIndex(u => u.id === user.id);
    
    users[uIndex].name = newName;
    if (newPwd) users[uIndex].password = newPwd;
    
    setDB('hk_users', users);
    
    // Update current session
    user.name = newName;
    if(newPwd) user.password = newPwd;
    localStorage.setItem('hk_currentUser', JSON.stringify(user));
    
    Swal.fire({icon: 'success', title: 'บันทึกสำเร็จ', timer: 1500, showConfirmButton: false});
}

// Initial Load
switchTab('request');
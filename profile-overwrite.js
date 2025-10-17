// profile-overwrite.js

function getIdFromUrl() {
  const qs = new URLSearchParams(window.location.search);
  if (qs.get('id')) return qs.get('id');

  const parts = window.location.pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1] || '';
  if (last.endsWith('.html')) return qs.get('id') || '';
  return decodeURIComponent(last);
}

function slugify(name) {
  if (!name) return '';
  return name.toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function setPrettyUrl(slug) {
  if (!slug) return;
  const path = window.location.pathname;
  const parts = path.split('/');
  const last = parts[parts.length - 1];
  if (last && last === slug) return;

  let base = path;
  if (base.endsWith('/')) base = base.slice(0, -1);

  const newPath = base.endsWith('.html') ? base + '/' + encodeURIComponent(slug) : base + '/' + encodeURIComponent(slug);
  history.replaceState(null, '', newPath + window.location.search);
}

// Giao diện
function renderPerson(data) {
  const card = document.getElementById('personInfo');
  if (!card) return;

  if (!data) {
    document.title = 'Không tìm thấy người dùng';
    card.innerHTML = `<p>❌ Không tìm thấy người này!</p>`;
    return;
  }

  const avatar = data.avatar || 'https://placehold.co/200';
  const name = data.name || 'Người dùng ẩn danh';
  document.title = name;
  const slug = slugify(name);
  if (slug) setPrettyUrl(slug);

  card.innerHTML = `
    <img src="${avatar}" alt="Avatar">
    <h2>${escapeHtml(name)}</h2>
    <div class="info-section">
      <p><b>🎂 Ngày sinh:</b> ${escapeHtml(data.dob || 'Chưa rõ')}</p>
      <p><b>📞 SĐT:</b> ${escapeHtml(data.phone || 'Không có')}</p>
      <p><b>💑 Tình trạng:</b> ${escapeHtml(data.relationship || 'Chưa rõ')}</p>
      <p><b>🏫 Trường/Nơi làm việc:</b> ${escapeHtml(data.school || 'Chưa rõ')}</p>
      <p><b>📚 Học lực:</b> ${escapeHtml(data.studyPower || 'Chưa rõ')}</p>
      <p><b>🏡 Nơi ở hiện tại:</b> ${escapeHtml(data.address || 'Chưa rõ')}</p>
      <p><b>🧠 Năng lực:</b> ${escapeHtml(data.skills || 'Không có')}</p>
      <p><b>😨 Nỗi sợ:</b> ${escapeHtml(data.fears || 'Không có')}</p>
      <p><b>🎯 Sở thích:</b> ${escapeHtml(data.interests || 'Không có')}</p>
      <p><b>🌐 Mạng xã hội:</b> ${
        data.webnet 
          ? `<a href="${escapeHtml(data.webnet)}" target="_blank" style="color:#4f46e5;">${escapeHtml(data.webnet)}</a>` 
          : 'Chưa có'
      }</p>
      <p><b>📜 Tiểu sử:</b> ${escapeHtml(data.bio || 'Chưa có')}</p>
    </div>
    <a href="index.html" class="btn">⬅ Quay lại trang chủ</a>
    <button class="btn" id="toggleEditBtn">${data.lockPassword ? '🔓 Mở khóa & Sửa' : '✍️ Sửa thông tin'}</button>
    <button class="btn" id="lockBtn">${data.lockPassword ? '🔐 Đang khóa' : '🔐 Bật khóa'}</button>

    <div class="edit-form" id="editForm" style="display:none;">
      <label>Họ tên</label>
      <input id="editName" type="text" value="${escapeAttr(data.name || '')}">
      <label>Ngày sinh</label>
      <input id="editDob" type="date" value="${escapeAttr(data.dob || '')}">
      <label>Số điện thoại</label>
      <input id="editPhone" type="text" value="${escapeAttr(data.phone || '')}">
      <label>Tình trạng</label>
      <select id="editRelationship">
        <option ${data.relationship === 'Độc thân' ? 'selected' : ''}>Độc thân</option>
        <option ${data.relationship === 'Có người yêu' ? 'selected' : ''}>Có người yêu</option>
        <option ${data.relationship === 'Trong mối quan hệ' ? 'selected' : ''}>Trong mối quan hệ</option>
      </select>
      <label>Trường/Nơi làm việc</label>
      <input id="editSchool" type="text" value="${escapeAttr(data.school || '')}">
      <label>Học lực</label>
      <select id="editStudyPower">
        <option value="">-- Chọn --</option>
        <option ${data.studyPower === 'Yếu' ? 'selected' : ''}>Yếu</option>
        <option ${data.studyPower === 'Trung bình' ? 'selected' : ''}>Trung bình</option>
        <option ${data.studyPower === 'Khá' ? 'selected' : ''}>Khá</option>
        <option ${data.studyPower === 'Giỏi' ? 'selected' : ''}>Giỏi</option>
        <option ${data.studyPower === 'Xuất sắc' ? 'selected' : ''}>Xuất sắc</option>
      </select>
      <label for="editAddress">Nơi ở hiện tại</label>
      <input type="text" id="editAddress" value="${escapeAttr(data.address || '')}">
      <label>Năng lực</label>
      <input id="editSkills" type="text" value="${escapeAttr(data.skills || '')}">
      <label>Nỗi sợ</label>
      <input id="editFears" type="text" value="${escapeAttr(data.fears || '')}">
      <label>Mạng xã hội</label>
      <input id="editwebnet" type="text" value="${escapeAttr(data.webnet || '')}">
      <label>Sở thích</label>
      <input id="editInterests" type="text" value="${escapeAttr(data.interests || '')}">
      <label>Tiểu sử</label>
      <textarea id="editBio" rows="3">${escapeHtml(data.bio || '')}</textarea>
      <button class="btn" style="margin-top:10px;" id="saveBtn">Lưu</button>
    </div>
  `;

  // 🔐 Sửa thông tin — kiểm tra mật khẩu nếu có
  document.getElementById('toggleEditBtn').addEventListener('click', () => {
    if (data.lockPassword) {
      const pw = prompt('🔐 Bài đăng này đã được khóa.\nVui lòng nhập mật khẩu để mở khóa:');
      if (pw === data.lockPassword) {
        document.getElementById('editForm').style.display = 'block';
      } else {
        alert('❌ Sai mật khẩu!');
      }
    } else {
      const f = document.getElementById('editForm');
      f.style.display = f.style.display === 'block' ? 'none' : 'block';
    }
  });

  // 🔐 Bật/tắt khóa
  document.getElementById('lockBtn').addEventListener('click', () => {
    if (data.lockPassword) {
      const pw = prompt('🔓 Nhập mật khẩu hiện tại để tắt khóa:');
      if (pw === data.lockPassword) {
        firebase.database().ref('people/' + currentId).update({ lockPassword: null }).then(() => {
          alert('✅ Đã tắt khóa bảo mật.');
          location.reload();
        });
      } else {
        alert('❌ Sai mật khẩu!');
      }
    } else {
      const pw = prompt('🔐 Đặt mật khẩu khóa bài đăng:');
      if (pw && pw.trim() !== '') {
        firebase.database().ref('people/' + currentId).update({ lockPassword: pw.trim() }).then(() => {
          alert('✅ Đã bật khóa bảo mật.');
          location.reload();
        });
      }
    }
  });

  // 💾 Lưu
  document.getElementById('saveBtn').addEventListener('click', () => {
    const updated = {
      name: document.getElementById('editName').value,
      dob: document.getElementById('editDob').value,
      phone: document.getElementById('editPhone').value,
      relationship: document.getElementById('editRelationship').value,
      school: document.getElementById('editSchool').value,
      skills: document.getElementById('editSkills').value,
      fears: document.getElementById('editFears').value,
      interests: document.getElementById('editInterests').value,
      webnet: document.getElementById('editwebnet').value,
      studyPower: document.getElementById('editStudyPower').value,
      address: document.getElementById('editAddress').value,
      bio: document.getElementById('editBio').value
    };
    firebase.database().ref('people/' + currentId).update(updated).then(() => {
      alert('✅ Cập nhật thành công!');
      renderPerson(Object.assign({}, data, updated));
    });
  });
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, (m) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[m]));
}
function escapeAttr(s) { return escapeHtml(s).replace(/"/g, '&quot;'); }

let currentId = getIdFromUrl();

if (!currentId) {
  const card = document.getElementById('personInfo');
  if (card) card.innerHTML = '<p>Vui lòng mở trang với ?id=ID_nguoi hoặc /slug-name</p>';
} else {
  firebase.database().ref('people/' + currentId).once('value').then(snapshot => {
    const data = snapshot.val();
    if (!data) {
      const slugFromUrl = currentId;
      firebase.database().ref('people').once('value').then(snapAll => {
        const all = snapAll.val() || {};
        let foundId = null, foundData = null;
        for (const k in all) {
          if (slugify(all[k].name) === slugFromUrl) {
            foundId = k; foundData = all[k]; break;
          }
        }
        if (foundData) {
          currentId = foundId;
          renderPerson(foundData);
        } else {
          document.getElementById('personInfo').innerHTML = '<p>❌ Không tìm thấy người này!</p>';
        }
      });
    } else {
      renderPerson(data);
    }
  }).catch(err => {
    console.error(err);
    const card = document.getElementById('personInfo');
    if (card) card.innerHTML = '<p>Lỗi khi tải dữ liệu.</p>';
  });
}

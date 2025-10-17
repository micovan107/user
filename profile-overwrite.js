// profile-overwrite.js
// Dùng thay cho phần script hiện tại để "ghi đè" nội dung #personInfo tự động

// Lấy id từ ?id=... hoặc lấy slug cuối đường dẫn nếu có
function getIdFromUrl() {
  const qs = new URLSearchParams(window.location.search);
  if (qs.get('id')) return qs.get('id');

  // lấy slug cuối cùng (ví dụ /profile.html/Nguyen-Tien-Nam hoặc /profile/Nguyen-Tien-Nam)
  const parts = window.location.pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1] || '';
  // nếu last chứa ".html" -> có thể là "profile.html", lấy trước nó
  if (last.endsWith('.html')) {
    // nếu url là /profile.html thì dùng query param only
    return qs.get('id') || '';
  }
  return decodeURIComponent(last);
}

function slugify(name) {
  if (!name) return '';
  return name.toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // bỏ ký tự lạ
    .replace(/\s+/g, '-') // space -> -
    .replace(/-+/g,'-');
}

function setPrettyUrl(slug) {
  if (!slug) return;
  // giữ phần trước (ví dụ /profile.html) rồi đổi thành /profile.html/slug
  const path = window.location.pathname;
  // nếu đã có slug cuối rồi thì không đổi
  const parts = path.split('/');
  const last = parts[parts.length-1];
  if (last && last === slug) return;

  // tạo new path: 如果 file is profile.html -> append slug, else append slug
  let base = path;
  // nếu đường dẫn kết thúc bằng "/", trim
  if (base.endsWith('/')) base = base.slice(0, -1);

  // nếu base last chứa ".html" (ví dụ profile.html) -> append slug
  if (base.endsWith('.html')) {
    const newPath = base + '/' + encodeURIComponent(slug);
    history.replaceState(null, '', newPath + window.location.search);
  } else {
    // nếu base already is folder, append slug
    const newPath = base + '/' + encodeURIComponent(slug);
    history.replaceState(null, '', newPath + window.location.search);
  }
}

// Hàm hiển thị template (ghi đè innerHTML)
function renderPerson(data) {
  const card = document.getElementById('personInfo');
  if (!card) return console.warn('Không tìm thấy #personInfo trên trang');

  if (!data) {
    document.title = 'Không tìm thấy người dùng';
    card.innerHTML = `<p>❌ Không tìm thấy người này!</p>`;
    return;
  }

  const avatar = data.avatar || 'https://placehold.co/200';
  const name = data.name || 'Người dùng ẩn danh';
  document.title = name; // đổi title

  // tạo slug và cập nhật URL thân thiện
  const slug = slugify(name);
  if (slug) setPrettyUrl(slug);

  // template (ghi đè)
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
    <button class="btn" id="toggleEditBtn">✍️ Sửa thông tin</button>

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

  // xử lý nút sửa/lưu
  document.getElementById('toggleEditBtn').addEventListener('click', () => {
    const f = document.getElementById('editForm');
    f.style.display = f.style.display === 'block' ? 'none' : 'block';
  });

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
    // ghi lên Firebase
    if (currentId) {
      firebase.database().ref('people/' + currentId).update(updated)
        .then(() => {
          alert('✅ Cập nhật thành công!');
          // cập nhật lại giao diện (ghi đè lại)
          renderPerson(updated);
        })
        .catch(err => {
          console.error(err);
          alert('Lỗi khi lưu: ' + (err.message || err));
        });
    } else {
      alert('Không xác định ID để lưu.');
    }
  });
}

// escape để tránh XSS khi đưa vào HTML
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, (m) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[m]));
}
function escapeAttr(s) { return escapeHtml(s).replace(/"/g, '&quot;'); }

let currentId = getIdFromUrl();

if (!currentId) {
  // nếu ko có id, hiển thị thông báo
  const card = document.getElementById('personInfo');
  if (card) card.innerHTML = '<p>Vui lòng mở trang với ?id=ID_nguoi or /slug-name</p>';
} else {
  // lấy dữ liệu từ Firebase (yêu cầu config.js đã load và firebase đã init)
  const dbRef = firebase.database().ref('people/' + currentId);
  dbRef.once('value').then(snapshot => {
    const data = snapshot.val();
    if (!data) {
      // nếu không tìm theo id, thử tìm theo slug (trường name normalised)
      const slugFromUrl = currentId;
      if (slugFromUrl) {
        // thử quét toàn bộ people để match slug của name (chậm với nhiều user)
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
            document.title = 'Không tìm thấy';
          }
        });
      } else {
        document.getElementById('personInfo').innerHTML = '<p>❌ Không tìm thấy người này!</p>';
        document.title = 'Không tìm thấy';
      }
    } else {
      renderPerson(data);
    }
  }).catch(err => {
    console.error(err);
    const card = document.getElementById('personInfo');
    if (card) card.innerHTML = '<p>Lỗi khi tải dữ liệu.</p>';
  });
}

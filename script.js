const form = document.getElementById('infoForm');
const peopleList = document.getElementById('peopleList');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  let avatarUrl = "";
  const file = document.getElementById('avatar').files[0];
  if(file){
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);
    avatarUrl = res.data.secure_url;
  }

  const person = {
    name: document.getElementById('name').value,
    dob: document.getElementById('dob').value,
    phone: document.getElementById('phone').value,
    relationship: document.getElementById('relationship').value,
    school: document.getElementById('school').value,
    skills: document.getElementById('skills').value,
    fears: document.getElementById('fears').value,
    interests: document.getElementById('interests').value,
    avatar: avatarUrl
  };

  const ref = firebase.database().ref('people').push();
  await ref.set(person);

  form.reset();
});

firebase.database().ref('people').on('value', snapshot => {
  peopleList.innerHTML = "";
  snapshot.forEach(child => {
    const data = child.val();
    const id = child.key;
    const card = document.createElement('div');
    card.className = "person-card";
    card.innerHTML = `
      <img src="${data.avatar || 'https://placehold.co/100'}" width="100">
      <div>
        <h3>${data.name}</h3>
        <p>${data.relationship || 'Không rõ tình trạng'}</p>
        <a href="person.html?id=${id}">Xem chi tiết</a>
      </div>
    `;
    peopleList.appendChild(card);
  });
});

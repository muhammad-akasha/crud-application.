

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);
const db = getFirestore(app);
let heading = document.querySelector(".crud-heading");
let crudContainer = document.querySelector(".crud-container");
let crudTable = document.querySelector(".crud-table");
let addBtn = document.getElementById("add-users");
let submitBtn = document.getElementById("submit-btn");
let formContainer = document.querySelector(".form-container");
let updateContainer = document.querySelector(".update-container");
let form = document.getElementById("addingData");
let updateForm = document.getElementById("update-data");

form.addEventListener("submit", (e) => {
  e.preventDefault();
});
updateForm.addEventListener("submit", (e) => {
  e.preventDefault();
});

function openAddForm() {
  heading.style.display = "none";
  crudContainer.classList.add("none");
  formContainer.classList.remove("none");
}

const addDataToFirestore = async () => {
  let userName = document.querySelector(".name").value;
  let email = document.querySelector(".email").value;
  let password = document.querySelector(".password").value;
  let fileInp = document.querySelector(".inp-file");

  try {
    const imagesRef = ref(storage, `images/${fileInp.files[0].name}`);
    await uploadBytes(imagesRef, fileInp.files[0]);
    const url = await getDownloadURL(imagesRef);
    console.log(uploadImg, url);
    const docRef = await addDoc(collection(db, "users"), {
      Name: userName,
      Email: email,
      Password: password,
      image: url,
    });
    getDataFromFirestore();
    heading.style.display = "block";
    crudContainer.classList.remove("none");
    formContainer.classList.add("none");
    resetValues();
    // });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

addBtn.addEventListener("click", openAddForm);
submitBtn.addEventListener("click", addDataToFirestore);

const getDataFromFirestore = async () => {
  const arr = []; // Clear the array at the beginning to avoid duplicates
  const querySnapshot = await getDocs(collection(db, "users"));


  crudTable.innerHTML = `
    <thead class="table-light">
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Email</th>
        <th>Password</th>
        <th style="text-align:center" colspan="2">Action</th>
      </tr>
    </thead>
    <tbody>
  `;

  arr.forEach((data) => {
    let usersdata = `
      <tr>
        <td class="id" data-id="${data.id}">${data.id}</td>
        <td class="name-txt">
         <img class="rounded-img" src=" ${!data.data.image ? "" : data.data.image}" alt="image">
          ${data.data.Name}
        </td>
        <td class="email-txt">${data.data.Email}</td>
        <td class="password-txt">${data.data.Password}</td>
        <td><button type="button" onclick="showUpdateForm(this)" class="btn btn-info action-btn">Edit</button></td>
        <td><button type="button" onclick="deleteCollection(this)" class="btn btn-danger action-btn">Delete</button></td>
      </tr>
    `;
    crudTable.innerHTML += usersdata;
  });

  crudTable.innerHTML += '</tbody>';
};

// Wait for the DOM to be ready before accessing crudTable
document.addEventListener("DOMContentLoaded", () => {
  getDataFromFirestore();
});

function showUpdateForm(ele) {
  // Hide the CRUD container and show the update container
  heading.style.display = "none";
  crudContainer.classList.add("none");
  updateContainer.classList.remove("none");
  let parent = ele.parentElement.parentElement;
  // Get the email , username values and password values

  let updUser = parent.querySelector(".name-txt").textContent.trim();
  let updEmail = parent.querySelector(".email-txt").textContent.trim();
  let updPass = parent.querySelector(".password-txt").textContent.trim();
  let idEle = parent.querySelector(".id");
  const id = idEle.getAttribute("data-id");

  // Get the input fields
  let updInpName = document.querySelector(".upd-name");
  let updInpEmail = document.querySelector(".upd-email");
  let updInpPass = document.querySelector(".upd-password");

  // Set the input fields with the values
  updInpName.value = updUser;
  updInpEmail.value = updEmail;
  updInpPass.value = updPass;

}

window.showUpdateForm = showUpdateForm;
async function update(ele) {
  
  const tableEle = ele.parentElement.parentElement;
  let userName = tableEle.querySelector(".upd-name").value;
  let email = tableEle.querySelector(".upd-email").value;
  let password = tableEle.querySelector(".upd-password").value;
  let img = document.querySelector(".upd-file");

  if (!userName || !email || !password){
    return alert("please fill the form");
  }
  const item = doc(db, "users", id);
  try {
    const imagesRef = ref(storage, `images/${img.files[0].name}`);
    await uploadBytes(imagesRef, img.files[0]);
    const url = await getDownloadURL(imagesRef);
  if (url){
    await updateDoc(item, {
      Name: userName,
      Email: email,
      Password: password,
      image : url
    });
  }else{
    await updateDoc(item, {
      Name: userName,
      Email: email,
      Password: password,
    });
  }
   
    getDataFromFirestore();
    heading.style.display = "block";
    crudContainer.classList.remove("none");
    updateContainer.classList.add("none");
    console.log("sucessfully update");
  } catch (err) {
    console.log(err);
  } finally {
    crudTable.classList.remove("none");
  }
}
window.update = update;

async function deleteCollection(ele) {
  const tableEle = ele.parentElement.parentElement;
  const id = tableEle.firstElementChild.innerText;
  const item = doc(db, "users", id);
  try {
    await deleteDoc(item);
    getDataFromFirestore();
    console.log("sucessfully delete");
  } catch (err) {
    console.log(err);
  }
}

window.deleteCollection = deleteCollection;

function resetValues() {
  let userName = document.querySelector(".name");
  let email = document.querySelector(".email");
  let password = document.querySelector(".password");
  userName.value = "";
  email.value = "";
  password.value = "";
}

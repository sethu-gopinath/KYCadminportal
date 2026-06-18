import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    get,
    update,
    remove
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* ==========================
   FIREBASE
========================== */

const firebaseConfig = {

    apiKey: "AIzaSyDzR0mlf1QpaGxEJ_rwErxZvgU899n8WGE",

    authDomain: "insuranceconsentapp.firebaseapp.com",

    databaseURL:
    "https://insuranceconsentapp-default-rtdb.firebaseio.com",

    projectId: "insuranceconsentapp",

    storageBucket:
    "insuranceconsentapp.firebasestorage.app",

    messagingSenderId:
    "198248114444",

    appId:
    "1:198248114444:web:b0faa3925805bbe8f48129"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let applications = {};
let currentFilter = "all";

/* ==========================
   INIT
========================== */

window.addEventListener(
    "load",
    loadApplications
);

/* ==========================
   LOAD APPLICATIONS
========================== */

async function loadApplications(){

    try{

        const snapshot =
        await get(
            ref(db,"applications")
        );

        if(!snapshot.exists()) return;

        applications = snapshot.val();

        renderTable();
        updateStats();

    }
    catch(error){

        console.error(error);

        alert(
            "Unable to load applications"
        );
    }
}

/* ==========================
   STATS
========================== */

function updateStats(){

    const list =
    Object.values(applications);

    document.getElementById(
        "totalApplications"
    ).innerText =
    list.length;

    document.getElementById(
        "completedApplications"
    ).innerText =
    list.filter(
        x =>
        (x.status || "")
        .toLowerCase()
        .includes("completed")
    ).length;

    document.getElementById(
        "rejectedApplications"
    ).innerText =
    list.filter(
        x =>
        (x.status || "")
        .toLowerCase()
        .includes("rejected")
    ).length;

    document.getElementById(
        "pendingApplications"
    ).innerText =
    list.filter(
        x =>
        !(x.status || "")
        .toLowerCase()
        .includes("completed")
        &&
        !(x.status || "")
        .toLowerCase()
        .includes("rejected")
    ).length;
}

/* ==========================
   TABLE
========================== */

function renderTable(){

    const tbody =
    document.getElementById(
        "applicationsTable"
    );

    tbody.innerHTML = "";

    Object.entries(applications)
    .reverse()
    .forEach(([id,data])=>{

        const status =
        data.status || "Pending";

        if(
            currentFilter !== "all"
        ){

            if(
                currentFilter === "completed" &&
                !status.toLowerCase().includes("completed")
            ) return;

            if(
                currentFilter === "rejected" &&
                !status.toLowerCase().includes("rejected")
            ) return;

            if(
                currentFilter === "pending" &&
                (
                    status.toLowerCase().includes("completed") ||
                    status.toLowerCase().includes("rejected")
                )
            ) return;
        }

        const tr =
        document.createElement("tr");

        const score =
typeof data.faceVerification?.score !== "undefined"
? data.faceVerification.score + "%"
: "-";

        tr.innerHTML = `

        <td>${id}</td>

        <td>
        ${data.customer?.fullName || ""}
        </td>

        <td>
        ${data.customer?.phone || ""}
        </td>

        <td>
        ${status}
        </td>

        <td>
        ${score}
        </td>

        <td>
        ${new Date(
            data.createdAt
        ).toLocaleDateString()}
        </td>

        <td>

            <button onclick="viewApplication('${id}')">
                View
            </button>

            <button onclick="editApplication('${id}')">
                Edit
            </button>

            <button onclick="viewLogs('${id}')">
                Logs
            </button>

            <button onclick="deleteApplication('${id}')">
                Delete
            </button>

        </td>
        `;

        tbody.appendChild(tr);

    });

}

/* ==========================
   SEARCH
========================== */

window.searchApplication =
function(){

    const searchValue =
    document
    .getElementById(
        "searchApplication"
    )
    .value
    .trim();

    if(!searchValue){

        renderTable();
        return;
    }

    const tbody =
    document.getElementById(
        "applicationsTable"
    );

    tbody.innerHTML = "";

    Object.entries(applications)
    .forEach(([id,data])=>{

        if(
            id.includes(searchValue)
        ){

            const tr =
            document.createElement("tr");

            tr.innerHTML = `

            <td>${id}</td>

            <td>
            ${data.customer?.fullName || ""}
            </td>

            <td>
            ${data.customer?.phone || ""}
            </td>

            <td>
            ${data.status || ""}
            </td>

            <td>
            ${typeof data.faceVerification?.score !== "undefined"
? data.faceVerification.score + "%"
: "-"}
            </td>

            <td>
            ${new Date(
                data.createdAt
            ).toLocaleDateString()}
            </td>

            <td>

                <button onclick="viewApplication('${id}')">
                    View
                </button>

                <button onclick="editApplication('${id}')">
                    Edit
                </button>

                <button onclick="viewLogs('${id}')">
                    Logs
                </button>

            </td>
            `;

            tbody.appendChild(tr);
        }

    });

};

/* ==========================
   FILTER
========================== */

window.filterApplications =
function(type){

    currentFilter = type;

    renderTable();
};

/* ==========================
   VIEW DETAILS
========================== */

window.viewApplication =
function(id){

    const data =
    applications[id];

    document.getElementById(
        "viewModal"
    ).style.display =
    "flex";

    document.getElementById(
        "applicationDetails"
    ).innerHTML = `

    <h3>Application No</h3>
    <p>${id}</p>

    <h3>Customer Name</h3>
    <p>${data.customer?.fullName || ""}</p>

    <h3>Phone</h3>
    <p>${data.customer?.phone || ""}</p>

    <h3>Email</h3>
    <p>${data.customer?.email || ""}</p>

    <h3>Address</h3>
    <p>${data.customer?.address || ""}</p>

    <h3>Status</h3>
    <p>${data.status || ""}</p>

    <h3>Face Score</h3>
    <p>${data.faceVerification?.score || "-"}</p>

    <h3>Verified At</h3>
<p>${data.faceVerification?.verifiedAt || "-"}</p>

    <h3>Consent Link</h3>

    <a href="${data.consentLink}"
       target="_blank">

       Open Consent Link

    </a>

    <br><br>

    <img
    src="${data.photo}"
    width="220"
    style="border-radius:15px;">
    `;
};

window.closeModal =
function(){

    document.getElementById(
        "viewModal"
    ).style.display =
    "none";
};

//eadit option

window.editApplication = function(id){

    const data = applications[id];

    document.getElementById(
        "editApplicationId"
    ).value = id;

    document.getElementById(
        "editName"
    ).value =
    data.customer?.fullName || "";

    document.getElementById(
        "editAge"
    ).value =
    data.customer?.age || "";

    document.getElementById(
        "editPhone"
    ).value =
    data.customer?.phone || "";

    document.getElementById(
        "editEmail"
    ).value =
    data.customer?.email || "";

    document.getElementById(
        "editAddress"
    ).value =
    data.customer?.address || "";

    document.getElementById(
        "editStatus"
    ).value =
    data.status || "Pending";

    document.getElementById(
        "editModal"
    ).style.display = "flex";
};

//close edit 

window.closeEditModal = function(){

    document.getElementById(
        "editModal"
    ).style.display = "none";
};

//SAVE CHANGES

window.saveApplication = async function(){

    const id =
    document.getElementById(
        "editApplicationId"
    ).value;

    let photoData =
applications[id].photo || "";

const photoFile =
document.getElementById(
    "editPhoto"
).files[0];

if(photoFile){

    photoData =
    await convertToBase64(
        photoFile
    );
}
    try{

        await update(
            ref(
                db,
                `applications/${id}`
            ),
            {

                photo: photoData,

        // reset face verification when photo changes
        faceVerification: null,
        
                status:
                document.getElementById(
                    "editStatus"
                ).value,
                
                

                customer:{
                    ...applications[id].customer,

                    fullName:
                    document.getElementById(
                        "editName"
                    ).value,

                    age:
                    document.getElementById(
                        "editAge"
                    ).value,

                    phone:
                    document.getElementById(
                        "editPhone"
                    ).value,

                    email:
                    document.getElementById(
                        "editEmail"
                    ).value,

                    address:
                    document.getElementById(
                        "editAddress"
                    ).value
                    
                }
            }
        );

        alert(
            "Application Updated"
        );

        closeEditModal();

        await loadApplications();

        loadApplications();

    }
    catch(error){

        console.error(error);

        alert(
            "Update Failed"
        );
    }
};

//LOGS

window.viewLogs = function(id){

    const logs =
    applications[id].logs || {};

    let html = "";

    Object.values(logs)
.reverse()
.forEach(log=>{

        html += `

        <div style="
        padding:10px;
        border-bottom:1px solid #ddd">

            <strong>
            ${log.event}
            </strong>

            <br>

            ${log.time}

        </div>
        `;
    });

    document.getElementById(
        "logsContainer"
    ).innerHTML =
    html;

    document.getElementById(
        "logsModal"
    ).style.display =
    "flex";
};

// CLOSE LOGS

window.closeLogsModal = function(){

    document.getElementById(
        "logsModal"
    ).style.display =
    "none";
};

// DELET 

window.deleteApplication =
async function(id){

    const confirmDelete =
    confirm(
        `Delete ${id} ?`
    );

    if(!confirmDelete)
    return;

    try{

        await remove(
    ref(db,`applications/${id}`)
);

delete applications[id];

renderTable();

updateStats();

alert("Application Deleted");

    }
    catch(error){

        console.error(error);

        alert(
            "Delete Failed"
        );
    }
};

//CONVERT NEW PHOTO

function convertToBase64(file){

    return new Promise(
        (resolve,reject)=>{

            const reader =
            new FileReader();

            reader.onload =
            () => resolve(reader.result);

            reader.onerror =
            reject;

            reader.readAsDataURL(file);

        }
    );
}
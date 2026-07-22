const API_URL =

"https://script.google.com/macros/s/AKfycbzieFUCqa1JPRJiAgDou5VwBfubtDj0ILErfCkqU7UFeCEJN6Er3xYauAzAMbnOWAgn/exec";



let currentRole="";

let editRow=-1;

let customerData=[];



/* =========================
LOGIN
========================= */


async function login(){


const email =
document.getElementById("email").value;


const password =
document.getElementById("password").value;



if(email==="" || password===""){


document.getElementById("error").innerText =
"Please enter email and password";


return;


}



try{


const response = await fetch(API_URL,{

method:"POST",

headers:{

"Content-Type":"text/plain;charset=utf-8"

},

body:JSON.stringify({

action:"login",

email,

password

})


});



const result =
await response.json();



if(result.success){


currentRole =
result.role;



localStorage.setItem(
"role",
currentRole
);



openDashboard();



}else{


document.getElementById("error").innerText =
"Invalid Email or Password";


}



}catch(error){


document.getElementById("error").innerText =
"Connection Error";


}



}



/* =========================
CUSTOMER VIEW
========================= */


function customerView(){


currentRole="guest";


openDashboard();


}



/* =========================
OPEN DASHBOARD
========================= */


function openDashboard(){


document.getElementById("loginContainer")
.style.display="none";


document.getElementById("dashboard")
.style.display="block";



document.getElementById("userRole")
.innerText =
"Role: "+currentRole;



if(currentRole==="guest"){


document.getElementById("addBtn")
.style.display="none";


document.getElementById("statsGrid")
.classList.add("hidden");


}else{


document.getElementById("statsGrid")
.classList.remove("hidden");


}



loadCustomers();


}



/* =========================
LOAD CUSTOMERS START
========================= */


async function loadCustomers(){


try{


const response =
await fetch(API_URL,{

method:"POST",

headers:{

"Content-Type":"text/plain;charset=utf-8"

},

body:JSON.stringify({

action:"getCustomers"

})


});



const result =
await response.json();


customerData =
result.data || result;



let html="";


customerData.forEach((item,index)=>{


let repair =
Number(item.repairPrice)||0;


let fare =
Number(item.farePrice)||0;


let statusClass="pending";


if(item.status==="Ongoing")
statusClass="ongoing";


if(item.status==="Completed")
statusClass="completed";


html += `

<tr>

<td>${item.name || ""}</td>

<td>${item.address || ""}</td>

<td>${item.schedule || ""}</td>

<td>${item.contact || ""}</td>

<td>${item.email || ""}</td>

<td>${item.repair || ""}</td>

<td>${item.assignIT || ""}</td>


<td>
<span class="status ${statusClass}">
${item.status || "Pending"}
</span>
</td>


<td class="price">
₱${repair.toLocaleString()}
</td>


<td class="fare">
₱${fare.toLocaleString()}
</td>


<td>

<button class="action-btn print-btn"
onclick="printCustomer(${index})">

<i class="fa-solid fa-print"></i>

</button>


<button class="action-btn edit-btn"
onclick="editCustomer(${index})">

<i class="fa-solid fa-pen"></i>

</button>


</td>


</tr>

`;


});


document.getElementById("customerTable")
.innerHTML=html;


}catch(error){


alert("Failed to Load Customers");


}


}
  
  
/* =========================
SEARCH CUSTOMER
========================= */


function searchCustomer(){


let input =
document.getElementById("searchInput")
.value.toLowerCase();



let rows =
document.querySelectorAll(
"#customerTable tr"
);



rows.forEach(row=>{


let name =
row.cells[0]
.innerText
.toLowerCase();



row.style.display =
name.includes(input)
?
""
:
"none";



});


}



/* =========================
TOGGLE FORM
========================= */


function toggleForm(){


let form =
document.getElementById("formSection");



form.style.display =
form.style.display==="block"
?
"none"
:
"block";



}



/* =========================
SAVE CUSTOMER
========================= */


async function saveCustomer(){



let customer={


action:"saveCustomer",


row:editRow,


name:
document.getElementById("name").value,


address:
document.getElementById("address").value,


schedule:
document.getElementById("schedule").value,


contact:
document.getElementById("contact").value,


email:
document.getElementById("customerEmail").value,


repair:
document.getElementById("repair").value,


assignIT:
document.getElementById("assignIT").value,


status:
document.getElementById("status").value,


repairPrice:
document.getElementById("repairPrice").value,


farePrice:
document.getElementById("farePrice").value



};



if(customer.name===""){


alert("Customer name required");

return;


}



try{


await fetch(API_URL,{

method:"POST",

headers:{

"Content-Type":"text/plain;charset=utf-8"

},

body:JSON.stringify(customer)


});



alert("Customer Saved Successfully");


clearForm();


loadCustomers();



}catch(error){


alert("Save Error");


}



}



/* =========================
EDIT CUSTOMER
========================= */


function editCustomer(index){


if(currentRole!=="admin"){


alert("Only admin can edit.");

return;


}



let item =
customerData[index];



editRow=index;



document.getElementById("name").value =
item.name || "";

document.getElementById("address").value =
item.address || "";

document.getElementById("schedule").value =
item.schedule || "";

document.getElementById("contact").value =
item.contact || "";

document.getElementById("customerEmail").value =
item.email || "";

document.getElementById("repair").value =
item.repair || "";

document.getElementById("assignIT").value =
item.assignIT || "";

document.getElementById("status").value =
item.status || "Pending";

document.getElementById("repairPrice").value =
item.repairPrice || "";

document.getElementById("farePrice").value =
item.farePrice || "";



document.getElementById("formSection")
.style.display="block";



window.scrollTo({

top:0,

behavior:"smooth"

});


}



/* =========================
DELETE CUSTOMER
========================= */


async function deleteCustomer(index){



if(currentRole!=="admin"){


alert("Only admin can delete.");

return;


}



if(!confirm("Delete this customer?"))
return;



try{


let response =
await fetch(API_URL,{

method:"POST",

headers:{

"Content-Type":"text/plain;charset=utf-8"

},

body:JSON.stringify({

action:"deleteCustomer",

row:index

})


});



let result =
await response.json();



if(result.success){


alert("Deleted Successfully");


loadCustomers();


}else{


alert("Delete Failed");


}



}catch(error){


alert("Delete Error");


}


}



/* =========================
PRINT CUSTOMER REPORT
========================= */


function printCustomer(index){



let item =
customerData[index];



let win =
window.open(
"",
"",
"width=900,height=700"
);



win.document.write(`

<html>

<head>

<title>
IT Service Report
</title>


<style>

body{

font-family:Arial;

padding:40px;

color:black;

}


h1{

text-align:center;

}


table{

width:100%;

border-collapse:collapse;

}


td,th{

border:1px solid black;

padding:12px;

text-align:left;

}



</style>


</head>



<body>


<h1>
IT SERVICE REPORT
</h1>


<h3>
Customer Repair Information
</h3>



<table>


<tr>

<th>Name</th>

<td>${item.name||""}</td>

</tr>


<tr>

<th>Address</th>

<td>${item.address||""}</td>

</tr>


<tr>

<th>Contact</th>

<td>${item.contact||""}</td>

</tr>


<tr>

<th>Email</th>

<td>${item.email||""}</td>

</tr>


<tr>

<th>Repair</th>

<td>${item.repair||""}</td>

</tr>


<tr>

<th>Assigned IT</th>

<td>${item.assignIT||""}</td>

</tr>


<tr>

<th>Status</th>

<td>${item.status||""}</td>

</tr>


<tr>

<th>Repair Fee</th>

<td>
₱${Number(item.repairPrice||0).toLocaleString()}
</td>

</tr>


<tr>

<th>Fare Fee</th>

<td>
₱${Number(item.farePrice||0).toLocaleString()}
</td>

</tr>


</table>


<br><br>


<p>
Customer Signature: ______________________
</p>


<br>


<p>
Authorized IT Personnel: ______________________
</p>



<script>

window.print();

</script>


</body>

</html>

`);



win.document.close();


}



/* =========================
CLEAR FORM
========================= */


function clearForm(){



editRow=-1;



document.querySelectorAll(
"#formSection input"
)
.forEach(input=>{

input.value="";

});



document.getElementById("repair")
.value="";


document.getElementById("status")
.value="Pending";



}



/* =========================
LOGOUT
========================= */


function logout(){



localStorage.removeItem("role");



currentRole="";


editRow=-1;



document.getElementById("dashboard")
.style.display="none";



document.getElementById("loginContainer")
.style.display="block";



document.getElementById("email")
.value="";


document.getElementById("password")
.value="";


document.getElementById("error")
.innerText="";



}



/* =========================
AUTO LOGIN SESSION
========================= */


window.onload=function(){


let role =
localStorage.getItem("role");



if(role){


currentRole=role;


openDashboard();


}


};





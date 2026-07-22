const URL = 
"https://script.google.com/macros/s/AKfycbzwAOWBL6y5-T6riAW0EOMqoY_q8u721vyhxtGGEK5J5m7ulmH_eNJsHjlbMJk8JZ6KqQ/exec";
/* GOOGLE USER DATA */
let googleUserEmail = "";
let googleUserName = "";
// ==============================
// GOOGLE LOGIN
// ==============================
window.onload = function(){
google.accounts.id.initialize({
client_id:
"495855477306-9rdg89fh3g5mtolu8th08ltojor8lkkr.apps.googleusercontent.com",
callback:
handleGoogleLogin
});
google.accounts.id.renderButton(
document.getElementById("googleLoginButton"),
{
theme:"outline",
size:"large",
text:"signin_with"
}
);
};
function handleGoogleLogin(response){
const payload = JSON.parse(
atob(
response.credential.split(".")[1]
)
);
googleUserEmail =
payload.email;
googleUserName =
payload.name;
document.getElementById("name").value =
googleUserName;
document.getElementById("email").value =
googleUserEmail;
document.getElementById("cemail").value =
googleUserEmail;
document.getElementById("userStatus").innerHTML =
"✅ Logged in as:<br>" 
+
googleUserEmail;
}
// ==============================
// MODAL
// ==============================
function showModal(message){
document.getElementById("modalText").innerText =
message;
document.getElementById("modal").style.display =
"flex";
}
function closeModal(){
document.getElementById("modal").style.display =
"none";
}
// ==============================
// CUSTOMER VIEW
// ==============================
function openCustomerView(){
document.getElementById("customerView").style.display =
"block";
}
// ==============================
// ADMIN LOGIN
// ==============================
function toggleLogin(){
document.getElementById("loginBox").style.display =
"block";
}
function closeAdmin(){
document.getElementById("loginBox").style.display =
"none";
}
async function loginAdmin(){
try{
const email =
document.getElementById("adminEmail").value.trim();
const password =
document.getElementById("adminPassword").value.trim();
if(!email || !password){
showModal(
"Please enter Admin Email and Password."
);
return;
}
const res =
await fetch(URL+"?type=users");
const users =
await res.json();
const found =
users.find(u=>
u.email?.trim()===email &&
u.password?.trim()===password
);
if(found){
showModal(
"Admin Login Successful."
);
document.getElementById("loginBox").style.display =
"none";
document.getElementById("adminPanel").style.display =
"block";
loadAdmin();
}else{
showModal(
"Invalid Admin Login."
);
}
}catch(error){
console.log(error);
showModal(
"Login Failed."
);
}
}
// ==============================
// SUBMIT CONCERN
// ==============================
async function submitConcern(){
try{
const name =
document.getElementById("name").value.trim();
const email =
document.getElementById("email").value.trim();
const address =
document.getElementById("address").value.trim();
const contact =
document.getElementById("contact").value.trim();
const problem =
document.getElementById("problem").value.trim();
const msg =
document.getElementById("msg");
msg.innerHTML="";
// REQUIRE GOOGLE LOGIN
if(googleUserEmail===""){
showModal(
"Please sign in using Google Account first."
);
return;
}
if(email !== googleUserEmail){
showModal(
"Email does not match Google Account."
);
return;
}
if(address.length < 5){
showModal(
"Please enter complete Address."
);
return;
}
if(!/^[0-9]{11}$/.test(contact)){
showModal(
"Contact number must be 11 digits."
);
return;
}
if(problem.length < 10){
showModal(
"Please provide complete concern details."
);
return;
}
msg.innerHTML=`
<div class="loading">
Saving your concern...
</div>
`;
await fetch(URL,{
method:"POST",
body:JSON.stringify({
type:"concern",
name:name,
email:email,
address:address,
contact:contact,
problem:problem
})
});
document.getElementById("address").value="";
document.getElementById("contact").value="";
document.getElementById("problem").value="";
msg.innerHTML=`
<div class="success">
✅ Concern Submitted Successfully!
<br>
Please wait for approval.
</div>
`;
}catch(error){
console.log(error);
showModal(
"Failed to submit concern."
);
}
}
// ==============================
// COMMENT SYSTEM
// ==============================
async function submitComment(){
try{
const comment =
document.getElementById("ccomment").value.trim();
if(googleUserEmail===""){
showModal(
"Please login with Google before commenting."
);
return;
}
if(comment===""){
showModal(
"Please write a comment."
);
return;
}
await fetch(URL,{
method:"POST",
body:JSON.stringify({
type:"comment",
name:googleUserName,
email:googleUserEmail,
comment:comment
})
});
document.getElementById("ccomment").value="";
loadComments();
showModal(
"Comment Posted Successfully."
);
}catch(error){
console.log(error);
showModal(
"Failed to post comment."
);
}
}
// ==============================
// LOAD COMMENTS
// ==============================
function loadComments(){
fetch(URL+"?type=comments")
.then(res=>res.json())
.then(data=>{
const box =
document.getElementById("commentList");
box.innerHTML="";
data.reverse().forEach(c=>{
box.innerHTML += `
<div class="commentBox">
<b>
${c.name || "Google User"}
</b>
<br>
<small style="color:#00e5ff">
${c.timestamp || ""}
</small>


<br><br>


${c.comment}


</div>

`;


});



})


.catch(error=>{


console.log(error);


});


}



loadComments();







// ==============================
// CUSTOMER DATA
// ==============================



async function loadCustomerData(){


try{


const email =
document.getElementById("searchEmail").value.trim();



if(email===""){


showModal(
"Please enter your Email."
);


return;


}





const res =
await fetch(URL+"?type=concerns");



const data =
await res.json();





const filtered =
data.filter(c=>

c.email &&
c.email.toLowerCase()===email.toLowerCase()

);





const box =
document.getElementById("customerData");



box.innerHTML="";





if(filtered.length===0){


box.innerHTML=`

<div class="commentBox">

No records found.

</div>

`;


return;


}







filtered.forEach(c=>{


box.innerHTML += `


<div class="commentBox">


<b>Name:</b>

${c.name}


<br><br>


<b>Email:</b>

${c.email}


<br><br>


<b>Contact:</b>

${c.contact || ""}


<br><br>


<b>Concern:</b>

<br>

${c.problem}


<br><br>


<b>Status:</b>


<span class="${
c.status==="Approved"
?
"status-approved"
:
c.status==="Rejected"
?
"status-rejected"
:
"status-pending"
}">


${c.status}


</span>


<br><br>


<b>Date:</b>

${c.timestamp || ""}



</div>


`;



});





}catch(error){


console.log(error);


showModal(
"Unable to load customer data."
);


}



}









// ==============================
// ADMIN LOAD DATA
// ==============================



async function loadAdmin(){



try{



const res =
await fetch(URL+"?type=concerns");



const data =
await res.json();




const table =
document.getElementById("adminTable");



table.innerHTML="";





data.reverse().forEach((c,i)=>{


table.innerHTML += `


<tr>


<td>${c.name}</td>


<td>${c.email}</td>


<td>${c.contact || ""}</td>


<td>${c.problem}</td>


<td>


<span class="${
c.status==="Approved"
?
"status-approved"
:
c.status==="Rejected"
?
"status-rejected"
:
"status-pending"
}">


${c.status}


</span>


</td>



<td>

${c.timestamp || ""}

</td>



<td>


<button 
class="btnApprove"
onclick="approve(${data.length-1-i})">


Approve


</button>




<button 
class="btnDelete"
onclick="rejectData(${data.length-1-i})">


Reject


</button>



</td>



</tr>


`;



});





}catch(error){


console.log(error);


showModal(
"Unable to load admin data."
);


}


}







// ==============================
// APPROVE
// ==============================



async function approve(index){


await fetch(URL,{

method:"POST",

body:JSON.stringify({


type:"approve",

index:index


})


});



showModal(
"Concern Approved."
);



loadAdmin();


}







// ==============================
// REJECT
// ==============================



async function rejectData(index){



if(!confirm(
"Reject this concern?"
)) return;




await fetch(URL,{

method:"POST",

body:JSON.stringify({


type:"reject",

index:index


})


});



showModal(
"Concern Rejected."
);



loadAdmin();



}








// ==============================
// PDF REPORT
// ==============================



async function downloadPDFByDate(){



try{



const date =
document.getElementById("pdfDate").value;




if(date===""){


showModal(
"Select Date First."
);


return;


}






const res =
await fetch(URL+"?type=concerns");



const data =
await res.json();




const filtered =
data.filter(c=>{


if(!c.timestamp)
return false;



return new Date(c.timestamp)
.toISOString()
.split("T")[0]===date;



});





if(filtered.length===0){


showModal(
"No data found."
);


return;


}







const {jsPDF}=window.jspdf;



const doc =
new jsPDF();





doc.text(
"Customer Support Report",
14,
15
);





doc.autoTable({



head:[

[
"#",
"Name",
"Email",
"Contact",
"Problem",
"Status"
]

],



body:

filtered.map((c,i)=>[

i+1,

c.name,

c.email,

c.contact,

c.problem,

c.status

]),



startY:25


});





doc.save(
"Customer_Report_"+date+".pdf"
);





}catch(error){


console.log(error);


showModal(
"PDF Error."
);


}


}

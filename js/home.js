const API = "https://script.google.com/macros/s/AKfycbxh8z79-uUkuqhylKw5Rj_cmJUMb8awtfrSDW1-ISyiy4ZLAgbiJXx5NjCZcjRwlXoX/exec";
const GOOGLE_API_KEY =
"AIzaSyBc-Uwh9jJ-rJ1JPWIbImQm7Rt8VD_UCPY";
const GOOGLE_CLIENT_ID =
"495855477306-9rdg89fh3g5mtolu8th08ltojor8lkkr.apps.googleusercontent.com";
let pickerApiLoaded = false;
let oauthToken = null;
function loadPickerAPI(){
gapi.load('picker',{
callback:function(){
pickerApiLoaded = true;
}
});
}
document.addEventListener(
"DOMContentLoaded",
loadPickerAPI
);
function getUser(){
return sessionStorage.getItem("userEmail");
}
function requireUser(){
if(!getUser()){
alert("Please login first");
openUser();
return false;
}
return true;
}
function showHome(){
document.getElementById("timeline").style.display="none";
document.getElementById("home").style.display="flex";
}
function showTimeline(){
document.getElementById("home").style.display="none";
document.getElementById("timeline").style.display="block";
loadPosts();
}
function openUser(){
userPopup.style.display="flex";
}
function closeUser(){
userPopup.style.display="none";
}
function openAdmin(){
adminPopup.style.display="flex";
}
function closeAdmin(){
adminPopup.style.display="none";
}
function userLogin(){
let email =
document.getElementById("uEmail").value;
if(email===""){
alert("Enter email");
return;
}
sessionStorage.setItem(
"userEmail",
email
);
alert("User login successful");


closeUser();


}






/* =========================
   ADMIN LOGIN
========================= */


async function adminLogin(){


try{


const response = await fetch(API,{

method:"POST",

body:JSON.stringify({

action:"adminLogin",

email:aEmail.value,

password:aPass.value

})

});



const data = await response.json();



if(data.success){


sessionStorage.setItem(
"admin",
"true"
);


adminBar.style.display="block";

adminPanel.style.display="block";


alert("Admin logged in");


closeAdmin();


}

else{


alert("Invalid admin login");


}



}

catch(error){


console.error(error);

alert("Server connection error");


}


}






/* =========================
   ADMIN LOGOUT
========================= */


function logoutAdmin(){


sessionStorage.removeItem(
"admin"
);


adminBar.style.display="none";

adminPanel.style.display="none";


}







/* =========================
   GOOGLE DRIVE PICKER
========================= */


function openPicker(){



if(!pickerApiLoaded){


alert(
"Google Picker loading. Try again."
);


return;


}




const tokenClient =
google.accounts.oauth2.initTokenClient({


client_id:GOOGLE_CLIENT_ID,


scope:
"https://www.googleapis.com/auth/drive.readonly",



callback:(tokenResponse)=>{


oauthToken =
tokenResponse.access_token;




const picker =
new google.picker.PickerBuilder()


.addView(

new google.picker.DocsView()

.setIncludeFolders(false)

.setMimeTypes(
"image/png,image/jpeg,image/jpg"
)

)


.setOAuthToken(oauthToken)


.setDeveloperKey(
GOOGLE_API_KEY
)


.setCallback(
pickerCallback
)


.build();



picker.setVisible(true);



}


});



tokenClient.requestAccessToken();



}






function pickerCallback(data){


if(
data.action === google.picker.Action.PICKED
){


const file =
data.docs[0];



const imageURL =
"https://drive.google.com/uc?id="
+
file.id;



document.getElementById("pImg").value =
imageURL;



document.getElementById("preview").innerHTML =

`
<img src="${imageURL}">
`;



}



}







/* =========================
   CREATE POST
========================= */


async function createPost(){



if(
sessionStorage.getItem("admin") !== "true"
){


alert("Admin only");

return;


}




try{


await fetch(API,{

method:"POST",


body:JSON.stringify({


action:"createPost",


title:pTitle.value,


description:pDesc.value,


image:pImg.value,


quote:pQuote.value


})


});



alert("Post published");



pTitle.value="";

pDesc.value="";

pImg.value="";

pQuote.value="";



loadPosts();



}

catch(error){


console.error(error);

alert("Cannot create post");


}


}







/* =========================
   LOAD POSTS
========================= */


async function loadPosts(){


try{


const response =
await fetch(API+"?action=posts");



const posts =
await response.json();



let html="";



posts.reverse().forEach(p=>{


html += `


<div class="post">


<img src="${p[3]}" loading="lazy">


<h3>${p[1]}</h3>


<p>${p[2]}</p>


<div class="quote">
${p[4] || ""}
</div>



<button onclick="toggle(this)">
Comments
</button>



<div style="display:none">


<textarea id="c-${p[0]}"
placeholder="Write comment">
</textarea>


<button onclick="sendComment('${p[0]}')">
Send
</button>


<div id="box-${p[0]}"></div>


</div>



</div>


`;



});



timeline.innerHTML = html;



posts.forEach(p=>{

loadComments(p[0]);

});



}

catch(error){


console.error(error);

timeline.innerHTML =
"Unable to load posts";


}


}







/* =========================
   SEND COMMENT
========================= */


async function sendComment(postId){



if(!requireUser())
return;



const text =
document.getElementById(
"c-"+postId
).value;



if(text===""){

alert("Write comment");

return;

}



await fetch(API,{

method:"POST",

body:JSON.stringify({

action:"comment",

postId:postId,

email:getUser(),

comment:text

})


});



document.getElementById(
"c-"+postId
).value="";



loadComments(postId);



}







/* =========================
   LOAD COMMENTS
========================= */


async function loadComments(postId){


const response =
await fetch(
API+
"?action=getComments&postId="
+
postId
);



const data =
await response.json();



const box =
document.getElementById(
"box-"+postId
);



if(!box)
return;



box.innerHTML="";
data.forEach(c=>{
box.innerHTML += `
<div class="comment">
<b>${c[2]}</b>
<p>${c[3]}</p>
</div>
`;
});
}
function toggle(btn){
const box =
btn.nextElementSibling;
box.style.display =
box.style.display==="block"
?
"none"
:
"block";
}


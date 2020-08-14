document.addEventListener('DOMContentLoaded',()=>{
    let url = "http://localhost:5000/notificationcount"
    let token = window.localStorage.getItem("token")

    fetch(url,{
        "method":'POST',
        headers:{
           "Content-Type":"application/json",
           "x-access-token":token
        },

    })
    .then(response=>response.json())
    .then(data=>{            
        let userName = document.querySelector('#username');
        let totalCredit = document.querySelector('#totalCreditNumber');
        let notiCount = document.querySelector('#notifCountNum')       //this notif count id is in the notification button in the nav bar
        userName.textContent = data.name;
        window.localStorage.setItem('name',data.name)
        totalCredit.textContent = data.credits;
        totalCredit.style.color = "orangered";
        notiCount.textContent = data.result.length
        notiCount.style.color = "yellow"
    })
})

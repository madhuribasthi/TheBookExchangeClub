document.addEventListener('DOMContentLoaded', () => {

    let token = window.localStorage.getItem("token")
    if(!token)
    {
        location.href = "login.html"
        return
    }
    
    document.querySelector('#addbutton').addEventListener('click', (event) => {
        event.preventDefault()
        let b_title = document.querySelector('#title').value
        let b_author = document.querySelector('#author').value
        let b_price = document.querySelector('#price').value
        let e = document.querySelector('#sel')
        let b_cat = e.options[e.selectedIndex].value
        let desc = document.querySelector('#addr').value

        if(b_title === "" || b_author === "" || b_price === "" || desc === "")
        {
            alert("Enter all the fields")
            return
        }

        let url = "http://localhost:5000/addbooks"
        let data = {
            title: b_title,
            author: b_author,
            price: b_price,
            category: b_cat,
            desc: desc
        }

        fetch(url, {
            "method": "POST",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": token
            },
            "body": JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if(data.hasOwnProperty("error"))
            {
                alert("Error: "+ data.error)
                return
            }
            if(!alert("Book added successfully!!")){
                document.querySelector('#title').value = "",
                document.querySelector('#author').value = "",
                document.querySelector('#price').value = "",
                desc.value = ""
                window.location.reload()
            }
        })
    })

    // let url7 = "http://localhost:5000/notificationcount"
    // let token = window.localStorage.getItem("token")

    // fetch(url7,{
    //     "method":'POST',
    //     headers:{
    //        "Content-Type":"application/json",
    //        "x-access-token":token
    //     },

    // })
    // .then(response=>response.json())
    // .then(data=>{            
    //     let userName = document.querySelector('#username');
    //     let totalCredit = document.querySelector('#totalCreditNumber');
    //     // let notiCount = document.querySelector('#notifCount')       //this notif count id is in the notification button in the nav bar
    //     userName.textContent = data.name;
    //     totalCredit.textContent = data.credits;
    //     totalCredit.style.color = "orangered";
    //     // notiCount.textContent = "Notification: " + data.result.length
    // })

    // event to redirect to user's Profile
    document.querySelector('#userProfile').addEventListener('click', (event) => {
        event.preventDefault()
        location.href = 'user.html'
    })
    
    // event to redirect to edit profile page
    document.querySelector('#editProfile').addEventListener('click', (event) => {
        event.preventDefault()
        location.href = 'editPro.html'
    })
    
    // event listner to redirect to past exchanges page
    document.querySelector('#pastExchanges').addEventListener('click', (event) => {
        event.preventDefault()
        location.href = 'exchange.html'
    })
    
    // event to logout
    document.querySelector('#logoutButton').addEventListener('click', (event) => {
        event.preventDefault()
        window.localStorage.setItem("token","")
        location.href = 'index.html'
    })
})
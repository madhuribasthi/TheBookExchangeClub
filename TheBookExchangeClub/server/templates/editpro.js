document.addEventListener('DOMContentLoaded', () => {
    // add an query that set the default values of the field as the details of the user
    let url2 = "http://localhost:5000/getdetails"
    let token = window.localStorage.getItem("token")

    if(!token)
    {
        location.href = "login.html"
        return
    }
    
    fetch(url2,{
        "method":"POST",
        headers: {
            "Content-Type":"application/json",
            'x-access-token': token
        }
    })
    .then(response => response.json())
    .then(data => {
        if(data.hasOwnProperty("error"))
        {
            alert("Erro: " + data.error)
            return
        }
        document.querySelector('#Fullname').value = data.result[0].name
        document.querySelector('#phoneno').value = data.result[0].contact
        // document.querySelector('#Password').value = data.result[0].password
        // document.querySelector('#RePassword').value = data.result[0].password
        // document.querySelector('#totalcredits').textContent = "Total Credits: " + data.result[0].credits
    })

    // when notification button is pressed get notification from the notification table
    // document.querySelector('#notificationButton').addEventListener('click',(event) => {
    //     event.preventDefault()
    // let n_url = "http://localhost:5000/getnotification"
    // let token = window.localStorage.getItem('token')
    // fetch(n_url, {
    //     "method":"POST",
    //     headers: {
    //         "Content-Type":"application/json",
    //         "x-access-token":token
    //     }
    // })
    // .then(response => response.json())
    // .then(data => {
    //     if(data.hasOwnProperty("error"))
    //     {
    //         alert("Error: " + data.error)
    //         return
    //     }
    //     let temp = Array.from(data.result)
    //     // console.log(temp)

    //     // ADD A CONDITION TO HIDE THE NOTIFICATION BUTTON IS THE READ STATUS IS 1
    //     temp.forEach((temp)=>{
    //         if(temp.nType==0)
    //         {
    //             const p = document.createElement('p');
    //             const button = document.createElement('button');
    //             const notif = document.querySelector('#notifications')
    //             p.textContent = temp.sendersname + " rejected your request for " + temp.book;
    //             button.textContent = "Ok";
    //             button.className = 'btn btn-dark btn-sm';
    //             p.appendChild(button);
    //             notif.appendChild(p);            
    //         }
    //         else if(temp==1)
    //         {
    //           const p1=document.createElement('p');
    //           const button=document.createElement('button')
    //           const notif = document.querySelector('#notifications')
    //           p1.textContent= temp.sendersname + " accepted your request for " + temp.book;
    //           button.textContent="Ok";
    //           button.className='btn btn-dark btn-sm';
    //           p1.appendChild(button);
    //           notif.appendChild(p1);
    //         } 
    //         else{ 
    //             const p2=document.createElement('p');
    //             const button1=document.createElement('button');
    //             const button2=document.createElement('button');
    //             const notif = document.querySelector('#notifications')
    //             p2.textContent= temp.sendersname + " has requested you for " + temp.book
    //             button1.textContent='Accept';
    //             button2.textContent='Decline';
    //             button1.className='btn btn-primary btn-sm';
    //             button2.className='btn btn-sm btn-danger';
    //             p2.appendChild(button1);
    //             p2.appendChild(button2);
    //             notif.appendChild(p2);
    //         }
    //     })
    // })
// })

    // when confirm button is pressed then the data is updated in the backend
    document.querySelector('#confirmButton').addEventListener('click', (event) => {
        event.preventDefault()
        
        let name = document.querySelector('#Fullname').value
        let pass = document.querySelector('#Password').value
        let repass = document.querySelector('#RePassword').value
        let phone = document.querySelector('#phoneno').value

        if(!pass || !repass)
        {
            alert("Enter the password please")
            return
        }

        if(pass != repass)
        {
            alert("Password didn't match")
            return
        }

        let url = 'http://localhost:5000/editprofile'

        let data = {
            name: name,
            pass: pass,
            contact: phone
        }

        fetch(url, {
            "method":"POST",
            headers: {
                "Content-Type":"application/json",
                "x-access-token":token
            },
            "body": JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if(data.hasOwnProperty('error'))
            {
                alert('Error: ' + data.error)
                return
            }
            if(!alert('Profile Updated Successfully'))
                {
                    location.href = 'user.html'
                }
        })
    })

    let url7 = "http://localhost:5000/notificationcount"
    // let token = window.localStorage.getItem("token")

    fetch(url7,{
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
        // let notiCount = document.querySelector('#notifCount')       //this notif count id is in the notification button in the nav bar
        userName.textContent = data.name;
        totalCredit.textContent = data.credits;
        totalCredit.style.color = "orangered";
        // notiCount.textContent = "Notification: " + data.result.length
    })

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
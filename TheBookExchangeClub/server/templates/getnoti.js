document.addEventListener('DOMContentLoaded',()=>{

    let token = window.localStorage.getItem('token')

    // to get the notification from the database and also delete notification that are above 30 days older
    let n_url = "http://localhost:5000/delnotify"

    fetch(n_url, {
        "method":"POST",
        headers: {
            "Content-Type":"application/json",
            "x-access-token":token
        }
    })
    .then(response => response.json())
    .then(data => {
        if(data.hasOwnProperty("error"))
        {
            alert("Error: " + data.error)
            return
        }
        let temp = Array.from(data.result)

        temp.forEach((temp)=>{
            let B_credit = temp.credit  //this book credit is to keep note of how much credit book is being requested or accepted or rejected
            let read_status = temp.readStatus
            if(temp.nType==0)
            {
                const p = document.createElement('p');
                const button = document.createElement('button');
                const notif = document.querySelector('#notifications')
                if(read_status == 1)
                {
                    button.style.display = 'none'
                }
                p.textContent = temp.sendersname + " rejected your request for " + temp.book;
                button.textContent = "Ok";
                p.className = 'p1'
                // p.setAttribute("data-userCredit",String(totalCredits))  //send this credit when the button is pressed
                p.setAttribute("data-bookcredit",String(B_credit))      //send this as well
                p.setAttribute("data-senderid",String(temp.senderID))
                p.setAttribute("data-notiftype",String(temp.nType))
                p.setAttribute("data-readstatus",String(temp.readStatus))
                p.setAttribute("data-bookname",String(temp.book))
                button.className='btn btn-dark btn-sm ok';
                p.appendChild(button);
                notif.appendChild(p);            
            }
            else if(temp.nType==1)
            {
                const p1=document.createElement('p');
                const button=document.createElement('button')
                const notif = document.querySelector('#notifications')
                if(read_status == 1)
                {
                    button.style.display = 'none'
                }
                p1.textContent= temp.sendersname + " accepted your request for " + temp.book;
                button.textContent="Ok";
                p1.className = 'p1'
                // p1.setAttribute("data-userCredit",String(totalCredits))  //send this credit when the button is pressed
                p1.setAttribute("data-bookcredit",String(B_credit))      //send this as well
                p1.setAttribute("data-senderid",String(temp.senderID))
                p1.setAttribute("data-notiftype",String(temp.nType))
                p1.setAttribute("data-readstatus",String(temp.readStatus))
                p1.setAttribute("data-bookname",String(temp.book))
                button.className='btn btn-dark btn-sm ok';
                p1.appendChild(button);
                notif.appendChild(p1);
            } 
            else{ 
                const p2=document.createElement('p');
                const button1=document.createElement('button');
                const button2=document.createElement('button');
                const notif = document.querySelector('#notifications')
                if(read_status == 1)
                {
                    button1.style.display = 'none'
                    button2.style.display = 'none'
                }
                p2.textContent= temp.sendersname + " has requested you for " + temp.book
                button1.textContent='Accept';
                button2.textContent='Decline';
                p2.className='p2';
                // p2.setAttribute("data-userCredit",String(totalCredits))  //send this credit when the button is pressed
                p2.setAttribute("data-bookcredit",String(B_credit))      //send this as well
                p2.setAttribute("data-senderid",String(temp.senderID))
                p2.setAttribute("data-notiftype",String(temp.nType))
                p2.setAttribute("data-readstatus",String(temp.readStatus))
                p2.setAttribute("data-bookname",String(temp.book))
                button1.className='btn btn-primary btn-sm';
                button2.className='btn btn-sm btn-danger';
                p2.appendChild(button1);
                p2.appendChild(button2);
                notif.appendChild(p2);
            }
        })
    })

    let click_cnt = 0
    // event listner for the notifications
    document.querySelector('#notifCount').addEventListener('click', (event) => {
        // selecting all the elements of the notification
        const Nlist = document.querySelector('#notifications')
        let n_type
        let b_name
        let b_id
        let user_credit
        let b_credit
        let s_id
        
        // check if the read status of the notification is one then fetch the senders contact and display it there instead of buttons
        let p_tags = Array.from(Nlist.querySelectorAll('p'))
        if(click_cnt == 0){
            click_cnt = 1;
            p_tags.forEach((tags) => {
                if(tags.getAttribute('data-readstatus') == 1)
                {
                    // call a route to send the notification sender's detail to display it on the notification drop down
                    let con_url = 'http://localhost:5000/getsenderdetail'
                    let info = {
                        senderID: tags.getAttribute('data-senderid')
                    }
                    
                    fetch(con_url, {
                        "method":"POST",
                        headers: {
                            'Content-Type':'application/json',
                            'x-access-token':token
                        },
                        "body": JSON.stringify(info)
                    })
                    .then(response => response.json())
                    .then(data => {
                        if(data.hasOwnProperty("error"))
                        {
                            alert("Error: " + data.error)
                            return
                        }
                        const p = document.createElement('p')
                        p.textContent = "Contact: " + data.result[0].contact
                        tags.appendChild(p)
                    })
                }
            })                      
        }

        Nlist.addEventListener('click', (event) => {
            event.preventDefault()
            if(event.target.className == 'btn btn-primary btn-sm')
            {
                //selecting the p tag that contain this particular notification
                const item = event.target.parentElement

                n_type = 1
                b_name = item.getAttribute('data-bookname')
                // b_id = item.getAttribute('data-bookid')     //this is not required mostly coz only notification type 3 require the bookID to get the receivers name and id from customer table but in type 1 and 0 they we just have to deal with already stored details
                user_credit = totalCredits
                b_credit = item.getAttribute('data-bookcredit')
                s_id = item.getAttribute('data-senderid')
                

                // before sending the notification check where you are getting the user credit
                // also remove the user Credit attribute from the notification since we are taking the values from the total credit part in the user drop down
                
                let info = {
                    notificationType: n_type,
                    book: b_name,
                    // bookID: b_id,
                    userCredit: user_credit,
                    bookCredit: b_credit,
                    senderID: s_id
                }
                
                let Nurl = "http://localhost:5000/notify"

                fetch(Nurl, {
                    "method":"POST",
                    headers: {
                        "Content-Type":"application/json",
                        "x-access-token":token
                    },
                    "body": JSON.stringify(info)
                })
                .then(response => response.json())
                .then(data => {
                    if(data.hasOwnProperty("error"))
                    {
                        alert("Error: " + data.error)
                    }
                })
                .then(
                    window.location.reload()
                )
            }
            else if(event.target.className == "btn btn-sm btn-danger")
            {
                //selecting the p tag that contain this particular notification
                const item = event.target.parentElement

                n_type = 0
                b_name = item.getAttribute('data-bookName')
                // b_id = item.getAttribute('data-bookID')     // similarly this is also not required
                user_credit = totalCredits
                b_credit = item.getAttribute('data-bookcredit')
                s_id = item.getAttribute('data-senderid')

                let info = {
                    notificationType: n_type,
                    book: b_name,
                    // bookID: b_id,
                    userCredit: user_credit,
                    bookCredit: b_credit,
                    senderID: s_id
                }

                let Nurl = "http://localhost:5000/notify"

                fetch(Nurl, {
                    "method":"POST",
                    headers: {
                        "Content-Type":"application/json",
                        "x-access-token": token
                    },
                    "body": JSON.stringify(info)
                })
                .then(response => response.json())
                .then(data => {
                    if(data.hasOwnProperty("error"))
                    {
                        alert("Error: " + data.error)
                    }
                })
                .then(
                    window.location.reload()
                )
            }
            else if(event.target.className == "btn btn-dark btn-sm ok")
            {
                //selecting the p tag that contain this particular notification
                const item = event.target.parentElement

                n_type = item.getAttribute('data-notiftype')
                b_name = item.getAttribute('data-bookname')     
                // b_id = item.getAttribute('data-bookid')     // and this is also not required
                user_credit = totalCredits
                b_credit = item.getAttribute('data-bookcredit')
                s_id = item.getAttribute('data-senderid')

                let info = {
                    notificationType: n_type,
                    book: b_name,
                    // bookID: b_id,
                    userCredit: user_credit,
                    bookCredit: b_credit,
                    senderID: s_id
                }

                let Nurl = "http://localhost:5000/okay"

                fetch(Nurl, {
                    "method":"POST",
                    headers: {
                        "Content-Type":"application/json",
                        "x-access-token": token
                    },
                    "body": JSON.stringify(info)
                })
                .then(response => response.json())
                .then(data => {
                    if(data.hasOwnProperty("error"))
                    {
                        alert("Error: " + data.error)
                    }
                })
                .then(
                    window.location.reload()
                )
            }
        })
    })
})
document.addEventListener('DOMContentLoaded',()=>{
    
    let token = window.localStorage.getItem('token')
    let bookid = window.localStorage.getItem('bookid');

    if(!token)
    {
        location.href = "login.html"
        return
    }

    let name = window.localStorage.getItem('name')
    let info = {
        bookid: bookid
    }

    //api to get the books description and image
    let d_url = "http://localhost:5000/getdescription"      //url to get description

    fetch(d_url,{
        "method":"POST",
        headers: {
            "Content-Type":"application/json",
            "x-access-token":token
        },
        "body":JSON.stringify(info)
    })
    .then(response => response.json())
    .then(data=>{
        if(data.hasOwnProperty("error"))
        {
            alert("Error: " + data.error)
            return
        }

        document.querySelector('#booktitle').textContent = data.result[0].title;
        document.querySelector('#main-body').textContent = data.result[0].body;
        // document.querySelector('#bimage'). = data.result[0].body;
    })


    //api to get comments for the books being shown
    let c_url = "http://localhost:5000/getcmnt"

    fetch(c_url,{
        "method":"POST",
        headers: {
            "Content-Type":"application/json",
            "x-access-token":token
        },
        "body":JSON.stringify(info)
    })
    .then(response=>response.json())
    .then(data=>{
        if(data.hasOwnProperty("error"))
        {
            alert("Error: " + data.error)
            return
        }

        let arr = Array.from(data.result)

        const commentsection = document.querySelector('#comment-section')

        arr.forEach((item)=>{
            //creating elements here
            const div1 = document.createElement('div')
            const div2 = document.createElement('div')
            const div3 = document.createElement('div')
            const div4 = document.createElement('div')
            const h3 = document.createElement('h3')
            const h5 = document.createElement('h5')
            const p = document.createElement('p')
            const sp1 = document.createElement('span')
            const sp2 = document.createElement('span')
            const sp3 = document.createElement('span')
            const sp4 = document.createElement('span')
            const sp5 = document.createElement('span')

            //styling elements
            div1.className = 'd-flex p-2 flex-row cmnt-div'
            div2.className = 'p-2 justify-content-start mt-2'
            div3.className = 'p-2 mt-auto mb-auto'
            div4.className = 'clearfix'
            h3.className = 'h1 text-hide user-icon'
            h5.className = 'text-dark font-weight-bold'

            let rating = [sp1,sp2,sp3,sp4,sp5]

            for(let i = 0; i < 5; i++)
            {
                rating[i].classList.add('fa','fa-star')
            }

            //inserting data into the elements
            h5.textContent = item.name
            p.textContent = item.body
            for(let i = 0; i < item.rating; i++)
            {
                rating[i].classList.add('checked')
            }

            //inserting elements
            div2.appendChild(h3)
            div3.appendChild(h5)
            div3.appendChild(sp1)
            div3.appendChild(sp2)
            div3.appendChild(sp3)
            div3.appendChild(sp4)
            div3.appendChild(sp5)
            div3.appendChild(div4)
            div3.appendChild(p)
            div1.appendChild(div2)
            div1.appendChild(div3)
            commentsection.appendChild(div1)

        })

    })

    let rate = 0
    let stars = document.querySelectorAll(".getrating")
    stars = Array.from(stars)
    stars.forEach(item=>{
        item.addEventListener('click',(event)=>{
            rate = item.getAttribute('data-rate')
        })
    })

    //event listiner to submit comment and rating
    document.querySelector('#submit-comment').addEventListener('click',(event)=>{
        event.preventDefault()

        let r_url = "http://localhost:5000/setcmnt"
        let cmnt = document.querySelector('#addr').value

        info = {
            bookid: bookid,
            name: name,
            cmnt: cmnt,         //add rating here
            rating: rate
        }
        if(cmnt == "" || rate == 0)
        {
            alert("Enter comment and rating please!!!")
            return
        }else{
            fetch(r_url,{
                "method":"POST",
                headers:{
                    'Content-Type':'application/json',
                    'x-access-token':token
                },
                "body":JSON.stringify(info)
            })
            .then(response=>response.json())
            .then(data=>{
                if(data.hasOwnProperty('error'))
                {
                    alert("Error: " + data.error)
                    return
                }
                
                cmnt.value = ""     //clearing the text area
                location.href = 'review.html'        //reloading the page
            })
        }   
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
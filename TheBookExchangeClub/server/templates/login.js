document.addEventListener("DOMContentLoaded", () =>{
    // eventListner for login button
    document.querySelector('#logbutton').addEventListener('click', (event) =>{
        event.preventDefault();
        let username = document.querySelector("#user").value
        let pass = document.querySelector("#pass").value
        if(username === "" || pass === "")
        {
            alert("Enter username and password")
            return
        }
        let data = {
            username: username,
            pass: pass
        }
        let url = "http://localhost:5000/login"
        fetch(url,{
            "method":"POST",
            headers: {
                'Content-Type': 'application/json'
            },
            "body": JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if(data.hasOwnProperty("error"))
            {
                alert("Error: " + data['error'])
                return
            }
            window.localStorage.setItem("token",data['token'])
            location.href = "main.html"
        })
    })
})
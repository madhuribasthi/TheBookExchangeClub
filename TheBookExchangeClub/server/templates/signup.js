document.addEventListener("DOMContentLoaded", () =>{
    document.querySelector('#signupButton').addEventListener('click',(event) => {
        event.preventDefault();
        let name = document.querySelector("#Fullname").value
        let pass = document.querySelector("#Password").value
        let repass = document.querySelector('#RePassword').value
        let phone = document.querySelector("#phoneno").value

        if(name === "" || pass === "" || phone === "" || repass === "")
        {
            alert("All fields are mendetory")
            return;
        }
        if(pass != repass)
        {
            alert("Your Password didn't match !!")
            return
        }
        let data = {
            fname: name,
            contact: phone,
            pass: pass
        }
        let url = "http://localhost:5000/signup";
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
                alert("Error: " + data.error)
                return
            }
            window.localStorage.setItem("token",data['token'])
            location.href = 'main.html'
        })
    })
})
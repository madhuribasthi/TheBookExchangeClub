document.addEventListener('DOMContentLoaded', () => {
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
const express = require('express')
const jwt=require("jsonwebtoken")
const app = express()
const bodyParser = require('body-parser')
const db = require("./database/db")
const cors = require('cors')
const path = require('path')
const bcrypt = require('bcrypt');
const saltRounds = 3;
// app.use(bodyParser.json({type: '*/*'}));
app.use(bodyParser())
app.use(cors())
app.use(express.static(path.join(__dirname, 'templates')))

// JWT authentication function
function auth(req,res,next)
{
    const config=require("./auth_config");
    let token=req.headers["x-access-token"] || req.headers["authorization"];
    if (token) 
    {
        jwt.verify(token, config.secret, (err, decoded) => {
          if (err) 
          {
            res.statusCode=401;
            return res.json({
              "error": "Token is not valid"
            });
          } 
          else 
          {
            req.decoded = decoded;
            next();
          }
        });
      } 
      else 
      {
        res.statusCode=400;
        return res.json({
          "error": "Auth token is not supplied"
        });
      }
}

// Login route
app.post('/login', (req,res) => {
    // console.log(req.body);
    let username = req.body.username;
    let passw = req.body.pass;
    const config = require("./auth_config");
    if(!username || !passw)
    {
        res.json({"error":"send username and password"});
        return;
    }
    //query to look if the user exist or not
    db.query("SELECT customerID FROM customer WHERE contact = ?", username,function(error,result){
        if(error) {
            console.log(error)
            res.json({"error":"database error 1"});
            return
        }
        if(!result.length){
            res.json({"error":"user does not exist"})
            return
        }

        //query to check if the userexist then the password is correct or not
        var salt = bcrypt.genSaltSync(saltRounds);  //salt round is 3. To store a shorter hashed password reduce the salt round to get longer hash increase the salt round
        // var hash = bcrypt.hashSync(passw, salt); //hashing is not required here    

        db.query("SELECT customerID,password FROM customer WHERE contact = ?", [username], (err,result) => {
            if(err)
            {
                console.log(err)
                res.json({"error":"database error 2"})
                return;
            }

            var check = bcrypt.compareSync(passw,result[0].password)
            
            if(!check) {      // if the hash and the stored hash matches then the password is correct else wrong
                res.json({"error":"incorrect password"});
            } else {
                let cusID = result[0].customerID
                // creating the authentication token for the user
                const token=jwt.sign({
                    exp:Math.floor(Date.now()/1000)+(31*24*60*60),
                    username:username,
                    customerID:cusID,
                },config["secret"]);
                res.json({"message":"success","token":token});
            }
        })
    })
})

// sign-Up route
app.post('/signup', (req,res) => {
    const config = require("./auth_config");
    let firstname = req.body.fname;
    // let lastname = req.body.lname;
    let contact = req.body.contact;
    let passw = req.body.pass;
    if(!firstname || !contact || !passw)
    {
        res.json({"error":"All fields are required"});
        return
    }

    // hashing the password before storing 
    var salt = bcrypt.genSaltSync(saltRounds);  //salt round is 3
    var hash = bcrypt.hashSync(passw, salt);    //passw is bing hashed here

    const user = {
        name: firstname,
        contact: contact,
        password: hash      //storing the hash instead of storing plaing text
    }

    // query to insert new user into the customer table
    db.query("SELECT customerID FROM customer WHERE contact = ?", contact, function(error,result){
        if(error) {
            console.log(error)
            res.json({"error":"database error 1 in signup route"});
            return;
        }
        if(result.length) {
            res.json({"error":"user already exist"});
        } else {
            
            db.query("INSERT INTO customer set ?", user, function(error, result){
                if(error)
                {
                    res.json({"error":"database error 2 in signup route"});
                    return;
                }

                db.query("select customerID from customer where contact = ?", contact, (err, result) => {
                    if(err)
                    {
                        res.json({"error":"database error 3 in signup route"});
                        return;
                    }
                    // creating the authentication token for the user
                    let cusID = result[0].customerID
                    // console.log(result[0].customerID)
                    const token=jwt.sign({
                    exp:Math.floor(Date.now()/1000)+(31*24*60*60),
                    username:contact,
                    customerID:cusID,
                    },config["secret"]);
                    res.json({"message":"success","token":token});
                })
            })
        }
    })
})

// main page route 
app.get('/main', auth, (req, res) => {
    // console.log(req.body)
    let username = req.decoded['username']
    let cusID = req.decoded['customerID']
    // console.log("check the command prompt", username)
    db.query("SELECT * FROM books", (error, result) => {
        if(error)
        {
            res.json({"error":"database error"})
            return
        }
        if(!result.length){
            res.json({"message":"No books!!"})
        }else{
            res.json({"result":result, "customerID":cusID});
        }
    })
})

// user page route
app.get('/user', auth, (req,res) => {
    let username = req.decoded['username']
    let cusID = req.decoded['customerID']
    db.query("SELECT customerID from customer where contact = ?", username, (err, result) => {
        if(err)
        {
            res.json({"error":"database error 1 in user route"})
            return
        }
        let cID = result[0].customerID
        // console.log(result[0].customerID)
        db.query("SELECT * FROM user WHERE customerID = ?",cID, (err,result) => {
            if(err)
            {
                res.json({"error":"database error 2 in user route"})
                return
            }
            res.json({"message":"success","result":result})
        })
    })
})

// add-books route
app.post('/addbooks', auth, (req,res) => {
    let username = req.decoded['username']
    let cusID = req.decoded['customerID']
    let b_title = req.body.title
    let b_author = req.body.author
    let b_price = req.body.price
    let b_category = req.body.category
    let b_desc = req.body.desc

    //query to call price to credit converter and then store the data in the book table
    db.query("call price_to_credit(?, ?, ?, ?, ?)",[b_title,b_author,b_price,cusID,b_category], (err,result) => {
        if(err)
        {
            res.json({"error":"database error"})
            return
        }
        // res.json({"message":"book added successfully"})

        db.query("select bookID from books where customerID = ? AND title = ?",[cusID,b_title], (err,result)=>{
            if(err)
            {
                res.json({"error":"database error 1 in adding description in addbooks route"})
                return
            }

            let data = {
                body: b_desc,
                bookID: result[0].bookID
            }
            db.query("insert into description set ?", data, (err,result)=>{
                if(err)
                {
                    res.json({"error":"database error 2 in inserting description in addbooks route"})
                    return
                }

                res.json({"message":"Book added successfully"})
            })
        })
    })
})

// edit profile route
app.post('/editprofile', auth, (req,res) => {
    let username = req.decoded['username']
    let cusID = req.decoded['customerID']
    let name = req.body.name
    let contact = req.body.contact
    let passw = req.body.pass

    // console.log(name, contact, passw)

    // query to update the current user info
    if(!name || !contact || !passw)
    {
        res.json({"error":"Fields can't be empty"})
        return
    }

    // hashing the password before storing 
    var salt = bcrypt.genSaltSync(saltRounds);  //salt round is 3
    var hash = bcrypt.hashSync(passw, salt);    //passw is bing hashed here

    db.query("UPDATE customer SET name = ?, contact = ?, password = ? WHERE customerID = ?", [name,contact,hash,cusID], (err,result) => {
        if(err)
        {
            res.json({"error":"database error"})
            return
        }
        res.json({"message":"Account update succefully"})
    })
})

// route to send the details of the user in edit profile page
app.post('/getdetails', auth, (req,res) => {
    let username = req.decoded['username']
    let cusID = req.decoded['customerID']
    db.query("select * from customer where customerID = ?", cusID, (err,result) => {
        if(err)
        {
            res.json({"error":"database error"})
            return
        }
        res.json({"message":"success","result":result})
    })
})

// push notification route
app.post('/notify', auth, (req,res) => {
    let username = req.decoded['username']
    let cusID = req.decoded['customerID']
    let noti_type = req.body.notificationType // 3 is for request notification, 1 is for accepting, 0 for denial
    let sender_name = ""
    let receiver_name = ""
    let book_name = req.body.book
    let read_status = 0
    let user_credit = req.body.userCredit  //user's current credit is taken from fron-end
    let b_credit = req.body.bookCredit   // book credit is sent form front-end
    // console.log(req.body.userCredit)
    // query to get the senders name
    db.query("SELECT name FROM customer where customerID = ?", cusID, (err,result) => {
        if(err)
        {
            res.json({"error":"database error"})
            return
        }
        sender_name = result[0].name

        // query to get receiver's ID and name from book table if this is a request
        if(noti_type === 3){
        console.log("this is a request")
        
        let b_ID = req.body.bookID              // THIS IS ONLY FOR THE NOTIFICATION TYPE 3 IF IT GIVES ERROR THEN SEND BOOK ID FROM FRONTEND THAT IS SUPPOSED TO BE STORED IN EACH NOTIFICATION FOR TYPE 1 AND 0
        
        db.query("SELECT C.name,C.customerID,B.credit FROM customer C INNER JOIN books B ON C.customerID = B.customerID WHERE B.bookID = ?", b_ID, (err,result) => {
            if(err)
            {
                res.json({"error":"database error in join"})
                return
            }
            receiver_name = result[0].name
            let receiver_ID = result[0].customerID
            // let b_credit = result[0].credit
            // I'm not using the book credit obtained from this query coz it's being sent from the frontEND

            if(user_credit-b_credit<0) //get user credit from front end
            {
                res.json({"error":"Not enough credit"})
                return
            }
            
            if(receiver_ID !== cusID){
                // query to check if the same request already exist or not
                db.query("SELECT * FROM notification where senderID = ? AND receiverID = ? AND book = ?",[cusID,receiver_ID,book_name], (err,result) => {
                    if(err)
                    {
                        res.json({"error":"database error in checking the request already exist or not"})
                        return
                    }
                    if(!result.length){
                        // query to insert the notification in notification table
                        db.query("CALL insert_notification(?, ?, ?, ?, ?, ?, ?, ?)", [cusID,sender_name,receiver_ID,receiver_name,book_name,b_credit,noti_type,read_status], (err, result) => {
                            if(err)
                            {
                                res.json({"error":"database error"})
                                return
                            }
                            // res.json({"message":"success"})

                            // to reduce the credit of the user
                            // get customers credit from front end
                            // console.log(user_credit-b_credit)
                            db.query("UPDATE customer set credits = ? where customerID = ?",[Number(user_credit-b_credit),cusID],(err,result) => {
                                if(err)
                                {
                                    res.json({"error":"database error while updating credit in notif route"});
                                    return
                                }
                                res.json({"message":"request sent succecfully"})
                            })
                        })
                    }
                    else{
                        res.json({"message":"You already requested for this book"})
                    }
                })
            }else{
                res.json({"error":"Can't send request to yourself"})
            }
        })
        }
        else{
            console.log("this is not a request")
            let noti_receiver_ID = req.body.senderID // to store the id of the person who sent the type 3 notification
            
            // query to get receiver's name and id from notification table if it's an acceptance or denial of request
            db.query("SELECT sendersname FROM notification WHERE senderID = ?", noti_receiver_ID, (err,result) => {
                if(err)
                {
                    res.json({"error":"database error in getting the sendersname in notify route"})
                    return
                }
                if(!result.length){
                    res.json({"error":"Empty table"})
                    return
                }
                receiver_name = result[0].sendersname

                // query to insert into notification table. It has a trigger that insert the exchange detail into the exchange table if the request type is one
                db.query("CALL insert_notification(?, ?, ?, ?, ?, ?, ?, ?)",[cusID,sender_name,noti_receiver_ID,receiver_name,book_name,b_credit,noti_type,read_status], (err,result) => {
                    if(err)
                    {
                        res.json({"error":"database error 2"})
                        return
                    }
                    db.query("UPDATE notification SET readStatus = 1 where senderID = ? AND receiverID = ? AND nType = 3",[noti_receiver_ID,cusID], (err,result) => {
                        if(err)
                        {
                            res.json({"error":"database error"})
                            return
                        }

                        //if notification type is 0 then return the credit to the person who requested the book
                        if(noti_type == 0)
                        {
                            db.query("SELECT credits from customer where customerID = ?", noti_receiver_ID, (err,result) =>{
                                if(err)
                                {
                                    res.json({"error":"database error in getting credit of the reciever"})
                                    return;
                                }
                                let receiver_credit = result[0].credits;
                                // console.log(receiver_credit)
                                db.query("UPDATE customer SET credits = ? where customerID = ?",[Number(receiver_credit)+Number(b_credit),noti_receiver_ID], (err,result) => {
                                    if(err)
                                    {
                                        res.json({"error":"error in returning the credit to the user"})
                                        return
                                    }
                                    // res.json({"message":"credit returned successfully"})
                                    // ADD NOTIFICATION DELETE QUERY TO DELETE THE REQUEST NOTIFICATION IF IT IS DENIED 
                                    // AND ALSO UPDATE THE DELETE NOTIFICATION PROCEDURE IF DELETE QUERY IS ADDED HERE
                                    db.query("DELETE FROM notification where senderID = ? AND receiverID = ? AND nType = 3",[noti_receiver_ID,cusID], (err,result) => {
                                        if(err)
                                        {
                                            res.json({"error":"database error in deleting the request notification when the request is denied in notify route"})
                                            return
                                        }
                                        res.json({"message":"Request notification deleted successfully"})
                                    })
                                })
                            })
                        }
                        if(noti_type == 1)
                        {
                            db.query("delete from books where customerID = ? and title = ?",[cusID,book_name], (err,result)=>{
                                if(err)
                                {
                                    res.json({"error":"database error in deleting book after accepting the request"})
                                    return
                                }
                                res.json({"message":"success"})
                            })
                        }
                    })
                })
            })
        }
    })
})

// delete notification on clicking OKAY button route :)
app.post('/okay', auth, (req,res) => {
    let username = req.decoded['username']
    let cusID = req.decoded['customerID']
    let receiver_ID = cusID
    let sender_ID = req.body.senderID
    let noti_type = req.body.notificationType
    console.log(sender_ID,noti_type,receiver_ID)
    // if notification type is 0(request denied) then delete that notification from notification table
    if(noti_type == 0){
        db.query("CALL delete_notification(?, ?, ?)", [sender_ID, receiver_ID, noti_type], (err,result) => {
            if(err){
                res.json({"error":"database error 1"})
                return
            }
            res.json({"message":"denial notification deleted"})
        })
    }
    else{
        // if okay button is clicked then mark the notification as read
        db.query("UPDATE notification SET readStatus = 1 WHERE senderID = ? AND receiverID = ? AND nType = ?",[sender_ID,receiver_ID,noti_type], (err,resultl) => {
            if(err)
            {
                res.json({"error":"database error 2 in okay route"})
                return
            }
            res.json({"message":"readStatus updated"})
        })
    }
})

// route to get all the notification belonging to the user
app.post('/getnotification', auth, (req,res) => {
    let username = req.decoded['username']
    let cusID = req.decoded['customerID']
    db.query("SELECT * from notification where receiverID = ?", cusID, (err,result) => {
        if(err)
        {
            res.json({"error":"database error in getnotification route"})
            return
        }
        res.json({"message":"success","result":result,"contact":username})
    })
})

// add a route to delete notification that are out of date and send all other notification to display it on the notification drop down (this is triggered when someone click on the notification menu in nav bar)
app.post('/delnotify', auth, (req,res) => {
    let username = req.decoded['username']
    let cusID = req.decoded['customerID']

    // query to delete all the notification where date is less than todays date
    db.query("CALL del_noti_ondate(?)", cusID, (err,result) => {
        if(err)
        {
            res.json({"error":"database error 1 in delnotify route"})
            return
        }
        // query to send the rest of the customers notification back to be displayed
        db.query("SELECT * FROM notification WHERE receiverID = ?", cusID, (err,result) => {
            if(err)
            {
                res.json({"error":"database error 2 in delnotify route"})
                return
            }
            res.json({"message":"success","result":result,"contact":username})
        })
    })
})

// delete user route
app.post('/deluser', auth, (req,res) => {
    let username = req.decoded['username']
    let cusID = req.decoded['customerID']
    
    // query to delete the user from customer table when user confirm to delete his account
    db.query("DELETE FROM customer where customerID = ?", cusID, (err,result) => {
        if(err)
        {
            res.json({"error":"database error"})
            return
        }
        res.json({"message":"account deleted successfully"})
    })
})

// delete book route
app.post('/deletebook', auth, (req,res) => {
    let username = req.decoded['username']
    let cusID = req.decoded['customerID']
    let book_ID = req.body.bookID //bookID is sent from front-end. Will either be stored in custom attribute of invisible textfield

    // CHECK FOR IF THE CREDIT IS SUFFICIENT IN THE FRONT END ITSELF
    // query to delete book as per the book ID
    db.query("CALL del_book(?, ?)", [book_ID,cusID], (err,result) => {
        if(err)
        {
            res.json({"error":"database error"})
            return
        }
        res.json({"message":"book delete successfully"})
    })
})

// route to get the number of notification and also the credits and the username from the backend
app.post('/notificationcount', auth, (req,res) => {
    let username = req.decoded['username']
    let cusID = req.decoded['customerID']

    db.query("select name,credits from customer C where customerID = ?",[cusID],(err,result)=> {
        if(err)
        {
            res.json({"error":"database error"})
            return
        }
        let name = result[0].name
        let credits = result[0].credits

        // query to get the notification count 
        db.query("SELECT * FROM notification where receiverID = ? AND readStatus = 0",cusID, (err,result) => {
            if(err)
            {
                res.json({"error":"error in getting the notification count"})
                return
            }
            res.json({"result":result,"name":name,"credits":credits})
        })
    })
})

// route to send the senders contact to be showed in the notification if the request is accepted
app.post('/getsenderdetail', auth, (req,res) => {
    let username = req.decoded['username']
    let cusID = req.decoded['customerID']

    let sender_id = req.body.senderID

    db.query("SELECT contact FROM customer where customerID = ?", sender_id, (err,result) => {
        if(err)
        {
            res.json({"error":"error in getting the senders contact in getsenderdetail route"})
            return
        }
        res.json({"result":result})
    })
})

// route to send the exchange history of the user
app.post('/exchanges', auth, (req,res) => {
    let username = req.decoded['username']
    let cusID = req.decoded['customerID']

    db.query("SELECT * FROM exchanges where senderID = ? OR receiverID = ?", [cusID,cusID], (err, result) => {
        if(err)
        {
            res.json({"error":"database error in exchange route"})
            return
        }
        res.json({"result":result})
    })
})

//route to send the book description to front end
app.post('/getdescription', auth, (req,res) => {
    let username = req.decoded['username']
    let cusID = req.decoded['customerID']

    // let b_id = window.localStorage.getItem('bookid')
    let b_id = req.body.bookid

    db.query("SELECT D.body,B.title FROM description D INNER JOIN books B ON D.bookID = B.bookID where D.bookID = ?", b_id, (err,result) => {
        if(err)
        {
            res.json({"error":"database error in getdescription"})
            return
        }
        res.json({"message":"got description", "result":result})
    })
})

//route to send comments to front end
app.post('/getcmnt', auth, (req,res) => {
    let username = req.decoded['username']
    let cusID = req.decoded['customerID']

    // let b_id = window.localStorage.getItem('bookid')
    let b_id = req.body.bookid
    db.query("SELECT * FROM comments where bookID = ?", b_id, (err, result) => {
        if(err)
        {
            res.json({"error":"database error in getting comment"})
            return
        }
        res.json({"message":"got comments", "result":result})
    })
})

//route to set description of the book
app.post('/setdescription', auth, (req,res)=>{
    let username = req.decoded['username']
    let cus_ID = req.decoded['customerID']

    let desc = req.body.desc
    let bookid = req.body.bookid
    //add something for image here
    let info = {
        body:desc,
        bookID:bookid
    }

    db.query("INSERT INTO description set ?", info, (err, result)=>{
        if(err)
        {
            res.json({"error":"database error at setdescription"})
            return
        }
        res.json({"message":"description saved"})
    })
})

//route to get comments and set it to the table
app.post('/setcmnt', auth, (req,res)=>{
    let username = req.decoded['username']
    let cusID = req.decoded['customerID']

    let cmnt = req.body.cmnt
    let bookid = req.body.bookid
    let name = req.body.name
    let rate = req.body.rating
    let data = {
        bookID: bookid,
        name: name,
        body: cmnt,
        rating: rate
    }

    db.query("INSERT INTO comments set ?",data, (err,result)=>{
        if(err)
        {
            res.json({"error":"database error in setcmnt route"})
            return
        }

        res.json({"message":"comment set"})
    })
})

app.listen(5000, console.log('server running on port 5000'))
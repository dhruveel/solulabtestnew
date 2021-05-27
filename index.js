const express = require('express'); // To create a server
const bodyParser = require('body-parser'); // to parse the data of the file
const mysql = require('mysql'); // database dependency
const cors = require('cors')
const passport = require('passport');
const cookieSession = require('cookie-session')

const app = express(); // Create an object
const port = process.env.PORT || 5000; // If port not passed dynamically then use default

app.use(cors())

app.use(bodyParser.urlencoded ({extended: false}));

app.use(bodyParser.json()); // parsing the data into json format

app.listen(port, () => console.log(`listening to port ${port}`)); //listen the port

require('./passport');//include passport configuration file


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

//
//Google auth begins
//
app.use(cookieSession({
    name: 'test-session',
    keys: ['key1', 'key2']
  }))

// Auth middleware that checks if the user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}

// Initializes passport and passport sessions
app.use(passport.initialize());
app.use(passport.session());

// Example protected and unprotected routes
app.get('/', (req, res) => res.send('Example Home page!'))
app.get('/failed', (req, res) => res.send('You Failed to log in!'))

// In this route you can see that if the user is logged in u can acess his info in: req.user
app.get('/good', isLoggedIn, (req, res) => res.send(`Welcome mr ${req.user.displayName}!`))

// Auth Routes
app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/good');
  }
);

app.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
})

// Google auth ends

//Connect MySql database

const pool = mysql.createPool({
        connectionLimit:10,
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'test'
    }); //Connect the Mysql database


//Get all user data
app.get('/get',(req, res) => {
    pool.getConnection((err, connection) =>{
        if(err) throw err
         console.log (`connectd as id ${connection.threadId}`)
 
         //sql query
         connection.query('select * from user' ,[req.params], (err,rows) => 
         {
             connection.release()
             if(!err)
             {
                 res.send(rows)
             }
             else
             {console.log(err)}
         })
    })  
 })

 //Get user data from id
app.get('/get/:id',(req, res) => {
   pool.getConnection((err, connection) =>{
       if(err) throw err
        console.log (`connectd as id ${connection.threadId}`)

        //sql query
        connection.query('select * from user where user_id = ?' ,[req.params.id], (err,rows) => 
        {
            connection.release()
            if(!err)
            {
                if(rows.length>0)
                res.send(rows)
                else
                res.send("No rows found")
                    
            }
            else
            {console.log(err)}
        })
   })  
})


// Delete a user by id
app.delete('/delete/:id', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        connection.query('DELETE FROM user WHERE user_id = ?', [req.params.id], (err, rows) => {
            connection.release() // return the connection to pool
            if (!err) {
                res.send(`User with the record ID ${[req.params.id]} has been removed.`)
            } else {
                console.log(err)
            }
            
            console.log('The data from user table are: \n', rows)
        })
    })
});

// Add a user
app.post('/add', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        
        const params = req.body
        connection.query('INSERT INTO user SET ?', params, (err, rows) => {
        connection.release() // return the connection to pool
        if (!err) {
            res.send(`user with the record ID  has been added.`)
        } else {
            console.log(err)
        }
        
        console.log('The data from user table are: \n', rows)

        })
    })
});

// Update a user record
app.put('/update', (req, res) => {

    pool.getConnection((err, connection) => 
    {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        const { user_id,user_dob, user_name, user_description, user_address } = req.body

        if (user_name)
            connection.query('UPDATE user SET user_name = ? WHERE user_id = ?', [user_name, user_id] , (err, rows) => {})

        if (user_dob)
            connection.query('UPDATE user SET user_dob = ? WHERE user_id = ?', [user_dob, user_id] , (err, rows) => {})

        if (user_description)
            connection.query('UPDATE user SET user_description = ? WHERE user_id = ?', [user_description, user_id] , (err, rows) => {})

        if (user_address)
            connection.query('UPDATE user SET user_address = ? WHERE user_id = ?', [user_address, user_id] , (err, rows) => {})

        connection.release() // return the connection to pool


        //connection.query('UPDATE user SET user_name = ?, user_dob = ?, user_description = ?, user_address = ? WHERE user_id = ?', [user_name, user_dob, user_description, user_address, user_id] , (err, rows) => {
          
            if(!err) {
                res.send(`User with the name: ${user_name} has been updated.`)
            } else {
                console.log(err)
            }

        
        console.log(req.body)
    })
})
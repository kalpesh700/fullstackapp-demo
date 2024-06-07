const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express=require("express");
const app= express();
const port = 8080;
const path =require("path");
const { v4: uuidv4 } = require('uuid');
app.set("views",path.join(__dirname,"/views"))
app.set("view engine", "ejs");
const methodOverride=require("method-override");
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'app',
    password:'kalpesh123'
  });
  let getRandomUser=()=> {
    return [
       faker.string.uuid(),
      faker.internet.userName(),
       faker.internet.email(),
       faker.internet.password(),
    ];
  }
  //fake data insertion
  // let data=[];
  // for(let i=0;i<100;i++){
  //   data.push(getRandomUser());
  // }
  // let q= "insert into user(id,username,email,password) values  ?";


app.listen(port,()=>{
  console.log("server is listning ")
})
//home page
app.get('/', (req, res) => {
  const q = 'SELECT COUNT(*) AS count FROM user';

  try {
      connection.query(q, (err, result) => {
          if (err) throw err;
          
          console.log('Database query result:', result);
          console.log('Count value:', result[0].count);

          res.render('home.ejs', { count: result[0].count });

          // Close the connection after the query completes
          
      });
  } catch (err) {
      console.log(err);
      res.send('Some error in database');
  }
});
//show user
app.get('/user', (req, res) => {
  const q = 'SELECT  * FROM user';

  try {
      connection.query(q, (err, result) => {
          if (err) throw err;
        
           res.render('showusers.ejs', { users: result });

          // Close the connection after the query completes
          
      });
  } catch (err) {
      console.log(err);
      res.send('Some error in database');
  }
});
app.get("/user/:id/edit", (req, res) => {
  let id = req.params.id; // Access the 'id' parameter correctly
  let q = `SELECT * FROM user WHERE id = "${id}"`; // Correctly use the 'id' in the query and escape it to prevent SQL injection

  try {
      connection.query(q, (err, result) => {
          if (err) {
              console.error('Error querying database:', err);
              throw err;
          }
          
          // Check if any user found with the provided ID
          if (result.length > 0) {
              res.render("edit.ejs", { user: result[0] });
          } else {
              res.send("User not found");
          }
      });
  } catch (err) {
      console.error('Error:', err);
      res.send("Some error occurred");
  }
});
app.patch('/user/:id', (req, res) => {
  let id = req.params.id; // Access the 'id' parameter correctly
  let { password: formpass, userName: newusername } = req.body;

  // Ensure that formpass and newusername are defined and not empty
  if (!formpass || !newusername) {
      res.send("Password and new username must be provided");
      return;
  }

  let q = `SELECT * FROM user WHERE id = ${connection.escape(id)}`;

  try {
      connection.query(q, (err, result) => {
          if (err) {
              console.error('Error querying database:', err);
              res.send("Some error occurred");
              return; // Exit after sending the response
          }

          if (result.length === 0) {
              res.send("User not found");
              return; // Exit after sending the response
          }

          let user = result[0];
          if (formpass !== user.password) {
              res.send("Wrong password");
              return; // Exit after sending the response
          }

          // Update the user's username using connection.escape to prevent SQL injection
          let q2 = `UPDATE user SET username = ${connection.escape(newusername)} WHERE id = ${connection.escape(id)}`;
          connection.query(q2, (err, updateResult) => {
              if (err) {
                  console.error('Error updating database:', err);
                  res.send("Some error occurred");
                  return; // Exit after sending the response
              }
              res.redirect("/user");
          });
      });
  } catch (err) {
      console.error('Error:', err);
      res.send("Some error occurred");
  }
});
//add user
app.get('/user/post', (req, res) => {
  res.render('newuser.ejs'); // Render the form for creating a new user
});
app.post('/user/post',(req,res)=>{
  let{email:newemail,userName:newusername,password:newpassword}=req.body;
  let q=`INSERT INTO user (id,username, password, email) VALUES (?,?, ?, ?)`;
 let newid=uuidv4();
  try {
    connection.query(q,[newid,newemail,newusername,newpassword] ,(err, result) => {
        if (err) throw err;
      
        console.log(result);
        res.render('post.ejs', { email: newemail, userName: newusername });
        
    });
} catch (err) {
    console.log(err);
    res.send('Some error in database');
}
});
//delete user
app.get("/user/:id/delete", (req, res) => {
    let id = req.params.id; // Access the 'id' parameter correctly
    let q = `DELETE FROM user WHERE id ="${id}" `; 
    try {
        connection.query(q, (err, result) => {
            if (err) {
                console.error('Error querying database:', err);
                throw err;
            }
            res.redirect('/user');
        });
    } catch (err) {
        console.error('Error:', err);
        res.send("Some error occurred");
    }
  });




// try{
//   connection.query(q,[data],(err,result)=>{
//     if(err)throw err;
//     console.log(result);


//   });
//   }catch(err){
//     console.log(err)
//   }


// connection.end();
var mysql = require('mysql');
var express = require('express'); 
var cookieParser = require('cookie-parser');             
var http = require('http');
var nodemailer = require('nodemailer');
var app = express();          
app.use(cookieParser());

// db connection                   
var connection = mysql.createConnection({
    host     : '192.168.1.52',
    user     : 'achapman',
    password : 'vC45JJEv2QyMt4u',
    database : 'todos',
    dateStrings: 'date'
});

// static (for serving up static html/css/images etc)
app.use(express.static('public')); 

// reusable transporter object, for sending emails using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://killallhumans%40virginmedia.com:Lp5tlKRoef@smtp.virginmedia.com');

/* handy functions */

function getCatsForItem(items, curItemIndex, completedFunction)
{
    console.log('items length ' + items.length + ' cur item index ' + curItemIndex);
    
    if (curItemIndex >= items.length)
    {
        completedFunction(items);
    }    
    
    else
    {
        var itemID = items[curItemIndex].id;
        getCatsFromDB(itemID, function(categories){
            items[curItemIndex].categories = categories;
            getCatsForItem(items, ++curItemIndex, completedFunction); // add one before calling the function again
        });
    }
};
    
function getCatsFromDB(itemID, callback)
{  
    var sql = 'SELECT c.name FROM Items_Categories ic INNER JOIN categories c ON ic.category_id=c.id WHERE ic.item_id=' + itemID;
    connection.query(sql, function (error, results)
    {               
        if (error) throw error;

        var categories = [];

        for(var r in results) 
        {
            categories.push(results[r]);
        }
        
        callback(categories);
    }); 
};

/* list all items, with the option of filtering down to a specific category */

app.get('/items', function(request, response)
{
    var cat = request.query.category_id;
    console.log('cat ' + cat);
    var sql;
    var items = [];   
     
    var sessCookie = request.cookies.TDsession;
    var returnMsg;
    
    if(sessCookie)
    {
        /* autenticate the session */
        var authSQL = 'SELECT user_id FROM sessions WHERE session_id=\'' + sessCookie + '\'';
        console.log(authSQL);
        connection.query(authSQL, function(error, results)
        {
            if (error) throw error;
            console.log(results.length + 'result(s) found');            
            var userID = results[0].user_id;
            if (cat != null)
            {
                sql = 'SELECT items.*, c.name as catName, c.id as catID FROM items inner JOIN Items_Categories ic ON items.id=ic.item_id inner JOIN categories c ON ic.category_id=c.id WHERE ic.category_id=' + cat + ' AND items.userID=' + userID + ''; 
                console.log(sql); 
                
                connection.query(sql, function(error, results)
                {
                    if (error) throw error;

                    console.log('Found no. results: ', results.length);

                    for(var r in results) {
                        items.push(results[r]);
                        console.log(results[r]);
                    }
                    returnMsg = {"status": true, "items": items};
                    response.send(returnMsg);
                    console.log('sent');

                });         
            }

            else
            {
                sql = 'SELECT * FROM items WHERE userID=' + userID + ''; 
                console.log(sql);         

                connection.query(sql, function(error, results)
                {
                    if (error) throw error;

                    console.log('Found no. results: ', results.length);

                    for(var r in results) {
                        items.push(results[r]);
                    }
                    
                    getCatsForItem(items, 0, function(items)
                    {
                        returnMsg = {"status": true, "items": items};
                        response.send(returnMsg); 
                        console.log('sent') ;
                    });
                });           
            } 
        });
    }
    
    else
    {
        returnMsg = {"status": false};
        response.send(returnMsg);    
    }
});

app.get('/categories', function(request, response)
{
    var cat = request.query.category_id;
    var sql= 'SELECT * FROM categories'; 

    var items = [];

    connection.query(sql, function (error, results, fields)
    {
        if (error) throw error;

        console.log('Found no. results: ', results.length);

        for(var r in results) {
            var res = results[r];
            items.push(res);
        }

        response.send(items); 
        console.log('sent') ;
    });
});


/* get an individual item along with its associated categories */
app.get('/items/:id', function(request, response){

   var itemID = request.params.id; 
    console.log('getting info for item id# ' + itemID);
   
   var data = [];
   var cats = [];

   var sql = 'SELECT * FROM items WHERE id = ' + connection.escape(itemID);

    connection.query(sql, function (error, results, fields)
    {
        if (error) throw error;

        console.log('Found no. results: ', results.length);
        
        if(results.length == 1)
        {
            data.push(results[0]);     
        }
    });
    
    var sql2 = 'SELECT c.name FROM Items_Categories ic INNER JOIN categories c ON ic.category_id=c.id WHERE ic.item_id=' + connection.escape(itemID);
    connection.query(sql2, function (error, results, fields)
    {
        if (error) throw error;

        console.log('Found no. results: ', results.length);

        for(var r in results) 
        {
            cats.push(results[r]);
        }
        
        data.push(cats);
        
        response.send(data); 
        console.log('sent') ;
    }); 
});

app.post('/addItem', function(request, response)
{
    console.log('receiving item data');
    var content = '';
    
    request.on('data', function (data) {
      // Append data.
      content += data;
    });
    
    request.on('end', function ()
    {
        var item = JSON.parse(content);
        console.log(item);
        var sessCookie = request.cookies.TDsession;
        var returnMsg;
    
        if(sessCookie)
        {
            /* autenticate the session */
            var authSQL = 'SELECT user_id FROM sessions WHERE session_id=\'' + sessCookie + '\'';
            console.log('authenticating session ' + authSQL);
            connection.query(authSQL, function(error, results)
            {
                if (error) throw error;
             
                var userID = results[0].user_id;
                var sql = 'INSERT INTO items (name, description, due, userID) values (' + connection.escape(item.name) + ', ' + connection.escape(item.description) +', ' + connection.escape(item.due) + ', \'' + userID + '\')';
                
                connection.query(sql, function(error, result) 
                {
                    if (error) throw error;
                    console.log('insertID ' + result.insertId);

                    var returnMsg = {"status": true, "item_id": result.insertId};
                    response.send(returnMsg);
                });
            });
        }       
    });    
});

app.post('/addItemCats/:itID', function(request, response)
{
    var itemID = request.params.itID; 
    console.log('receiving category data for item id: ' + itemID);  
    var content = '';

    request.on('data', function (data) {
        // Append data.
        content += data;
    });

    request.on('end', function () 
    {
        var categories = JSON.parse(content);
   
        // add currently checked categories
        for (var i=0; i<categories.length; i++)
        {
            if (categories[i].checked == true)
            {
                var catID = connection.escape(categories[i].id);
                var sql = 'INSERT INTO Items_Categories (item_id, category_id) values (' + itemID + ', ' + catID + ')';
        
                console.log(sql);
                connection.query(sql, function(error, result) 
                {
                    if (error) throw error;
                });
            }
        }
        
        var returnMsg = {"status": true, "message": 'added'};
        response.send(returnMsg);
    });
});

app.post('/addCategory', function(request, response)
{
    console.log('receiving item data');
    var content = '';
    
    request.on('data', function (data) {
      // Append data.
      content += data;
    });
    
    request.on('end', function ()
    {
       console.log('content: ' + content);
       var item = JSON.parse(content);
       console.log('item: ' + item);

        var sql = 'INSERT INTO categories (name) values (' + connection.escape(item.name) + ')';
                console.log('sql ' + sql);
        connection.query(sql, function(error, result) {
            if (error) throw error;
            var returnMsg = {"status": true, "message": result.insertId};
            response.send(returnMsg);
        });
    });  
});

app.post('/addIC/:itID/:catID', function(request, response)
{
   var itemID = request.params.itID; 
   var catID = request.params.catID;
   console.log(itemID + ' and ' + catID);

    var sql = 'INSERT INTO Items_Categories (item_id, category_id) values (' + itemID + ', ' + catID + ')';
    connection.query(sql, function(error, result) {
        if (error) throw error;
        console.log(result.insertId);
        var returnMsg = {"status": true, "message": result.insertId};
        response.send(returnMsg);
    });
});

function makeid(len)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < len; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

function createSessionRecord(sessionID, userID)
{
    var sql = 'INSERT INTO sessions (session_id, user_id) values (\'' + sessionID + '\', ' + userID + ')';
    console.log(sql);
    connection.query(sql, function(error, result) {
        if (error) throw error;
        console.log('session created, id# ' + result.insertId);
    });
};

app.post('/register', function(request, response)
{
    console.log('receiving item data');
    var content = '';
    
    request.on('data', function (data) {
      // Append data.
      content += data;
    });
    
    request.on('end', function ()
    {
       console.log('content: ' + content);
       var item = JSON.parse(content);

       if((Object.keys(item).length == 5))
       {
            var sql = 'INSERT INTO users (firstName, lastName, email, password) values (' + connection.escape(item.firstName) + ', ' + connection.escape(item.lastName) + ', ' +  connection.escape(item.email) + ', md5(' + connection.escape(item.password) + '));';
            console.log('sql is ' + sql);
            connection.query(sql, function(error, result) 
            {
                if (error) throw error;
                console.log('user registered, id# ' + result.insertId);
                               
                var userID = result.insertId;
                var sessID = makeid(20); // create a random session ID with a length of 20  
                var returnMsg;                 
                createSessionRecord(sessID, userID);
                response.cookie('TDsession', sessID, -1, { path: '/' }); //-1 to mark it as a session cookie
                returnMsg = {"status": true, "userID": userID, "sessionID": sessID}; 

                response.send(returnMsg);
            });
       }
    });    
 
});

app.post('/login', function(request, response)
{
    console.log('receiving item data');
    var content = '';
    
    request.on('data', function (data) {
      // Append data.
      content += data;
    });
    
    request.on('end', function ()
    {
       var item = JSON.parse(content);
       var username = item.username; 
       var pword = item.pword;
       var sql = 'SELECT * FROM users WHERE email=\'' + username + '\' AND PASSWORD=MD5(\'' + pword + '\')';
        connection.query(sql, function(error, result) {
            if (error) throw error;
            console.log(result.length);
            var returnMsg;
            
            // if the username & password are correct, make a session cookie
            if (result.length == 1)
            {
                var sessID = makeid(20); // create a random session ID with a length of 20  
                var userID = result[0].id;
                createSessionRecord(sessID, userID);
                response.cookie('TDsession', sessID, -1, { path: '/' }); //-1 to mark it as a session cookie
                returnMsg = {"status": true, "userID": userID, "sessionID": sessID};    
            }
            else
            {
                returnMsg = {"status": false, "userID": ''};    
            } 
            
            response.send(returnMsg);
        });
    });    
});


app.put('/reset', function(request, response)
{
    var content = '';

    request.on('data', function (data) {
        // Append data.
        content += data;
    });

    request.on('end', function () 
    {
        console.log(content);
        var item = JSON.parse(content);
        var resetCode = makeid(10);

        var sql = 'UPDATE users SET password_new = MD5(' + connection.escape(item.password) + '), reset_code = \'' + resetCode +'\' where email = ' + connection.escape(item.email) + '';
        console.log(sql);
        connection.query(sql, function(error, result) {
            if (error) throw error;
            console.log('changed ' + result.changedRows + ' rows');
            var returnMsg = {"status": true, "message": result.changedRows};
            
            // setup e-mail data with unicode symbols
            var mailOptions = {
                from: 'Andrew Chapman <achapman@chapmandigital.co.uk>', // sender address
                to: item.email, // list of receivers
                subject: 'Password Reset', // Subject line
                text: 'Hey there, we think you want to reset your password. Copy the following link to your browser to make it happen. <br />http://localhost/#/reset/' + resetCode + '.' , // plaintext body
                html: 'Hey there, we think you want to reset your password. Click on the following link to make it happen. <a href="http://localhost/#/reset/' + resetCode + '">clickety</a>.'  // html body
            };
            
            console.log('mo ' + mailOptions.to)  ;
                        
            // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);

            });           
            response.send(returnMsg);
        });
    });
});

app.get('/reset/:id', function(request, response)
{
   var resetID = request.params.id; 
   console.log('resetID ' + resetID);
   var sql= 'SELECT * FROM users WHERE reset_code = \'' + resetID + '\''; 
   console.log(sql);
   connection.query(sql, function(error, result) 
   {
       console.log('num results ' + result.length);
       if (error)
       {
            throw error;
       }
       
       if (result.length > 0)
       {
           console.log('id ' + result[0].id);
           var sql2 = 'UPDATE users SET password = \'' + result[0].password_new + '\', reset_code = null WHERE id = ' + result[0].id;
           console.log(sql2);
           connection.query(sql2, function (error2, result2)
            {
                if (error2)
                {
                    console.error(error2.code); 
                    throw error;
                }
                console.log('changed ' + result2.changedRows + ' rows');
                var returnMsg = {"status": true, "message": result.changedRows};            
                response.send(returnMsg);
            }); 
       }
       
       else
       {
            var returnMsg = {"status": false};            
            response.send(returnMsg); 
       }
    });
});

app.get('/logout', function(request, response)
{
    response.cookie('TDsession', '', '0', { path: '/' }); //-1 to mark it as a session cookie
    var returnMsg = {"status": true};            
    response.send(returnMsg);
});


/* update item data */
app.put('/updateItem/:itID', function(request, response)
{
    var itemID = request.params.itID; 
    console.log('receiving item data for item id: ' + itemID);  
    var content = '';

    request.on('data', function (data) {
        // Append data.
        content += data;
    });

    request.on('end', function () 
    {
        console.log(content);
        var item = JSON.parse(content);
        var dateStr = item.due;
        var dateArr = dateStr.split('/');
        if (dateArr.length == 3) // has date, month, year values
        {
                
        }

        var sql = 'UPDATE items SET name=' + connection.escape(item.name) + ', description=' + connection.escape(item.description) + ', due=' + connection.escape(item.due) + ', completed=' + connection.escape(item.completed) + ' where id=' + item.id;
        
        console.log(sql);
        connection.query(sql, function(error, result) {
            if (error) throw error;
            console.log('changed ' + result.changedRows + ' rows');
            var returnMsg = {"status": true, "message": result.changedRows};            
            response.send(returnMsg);
        });
    });
});

/* update item categories */
app.put('/updateItemCats/:itID', function(request, response)
{
    var itemID = request.params.itID; 
    console.log('receiving category data for item id: ' + itemID);  
    var content = '';

    request.on('data', function (data) {
        // Append data.
        content += data;
    });

    request.on('end', function () 
    {
        var categories = JSON.parse(content);
   
        // remove current categories
        var delSql = 'DELETE FROM Items_Categories WHERE item_id=\'' + itemID + '\'';
        console.log(delSql);
        connection.query(delSql, function (error, result) 
        {
            if (error) throw error;

            console.log('deleted ' + result.affectedRows + ' rows');     
        });
        
        // add currently checked categories
        for (var i=0; i<categories.length; i++)
        {
            if (categories[i].checked == true)
            {
                var catID = connection.escape(categories[i].id);
                var sql = 'INSERT INTO Items_Categories (item_id, category_id) values (' + itemID + ', ' + catID + ')';
        
                console.log(sql);
                connection.query(sql, function(error2, result2) 
                {
                    if (error2) throw error;
                });
            }
        }
        
        var returnMsg = {"status": true, "message": 'updated'};
        response.send(returnMsg);
    });
});

app.put('/updateCategory/:id', function(request, response)
{
    var id = request.params.id; 
    console.log('receiving data for item id ' + id);  
    var content = '';

    request.on('data', function (data) {
        // Append data.
        content += data;
    });

    request.on('end', function () 
        {
            console.log(content);
            var item = JSON.parse(content);

            var sql = 'UPDATE categories SET name=' + connection.escape(item.name) + ' where id=' + id;
            connection.query(sql, function(error, result) {
                if (error) throw error;
                console.log('changed ' + result.changedRows + ' rows');
                var returnMsg = {"status": true, "message": result.changedRows};            
                response.send(returnMsg);
            });

    });
});

app.delete('/item/:id', function(request, response)
{
    var itemID = request.params.id;     
    var sql = 'DELETE FROM items WHERE id=' + itemID;
    connection.query(sql, function (error, result) 
    {
        if (error) throw error;

        console.log('deleted ' + result.affectedRows + ' rows');
        var returnMsg = {"status": true, "message": result.affectedRows};            
        response.send(returnMsg);        
    });
});

app.delete('/category/:id', function(request, response)
{
    var ID = request.params.id;     
    var sql = 'DELETE FROM categories WHERE id=' + ID;
    connection.query(sql, function (error, result) 
    {
        if (error) throw error;

        console.log('deleted ' + result.affectedRows + ' rows');
        var returnMsg = {"status": true, "message": result.affectedRows};            
        response.send(returnMsg);        
    });
});

app.listen(80, function(){
    console.log('listening');
});

var mysql = require('mysql');
var express = require('express'); 
var cookieParser = require('cookie-parser');                
var http = require('http');
var app = express();          
app.use(cookieParser());
                   
var connection = mysql.createConnection({
    host     : '192.168.1.52',
    user     : 'achapman',
    password : 'vC45JJEv2QyMt4u',
    database : 'todos'
});




app.use(express.static('public')); // for serving up static html/css/images etc

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


/* list all items, with the option of filtering down to a specific category */

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
    console.log('GCFDB');
    
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

app.get('/items', function(request, response)
{
    var cat = request.query.category_id;
    console.log('cat ' + cat);
    var sql;
    var items = [];   
     
    
    if (cat != null)
    {
        sql = 'SELECT items.*, c.name as catName, c.id as catID FROM items inner JOIN Items_Categories ic ON items.id=ic.item_id inner JOIN categories c ON ic.category_id=c.id WHERE ic.category_id='+cat; 
        console.log(sql); 
        
        connection.query(sql, function(error, results)
        {
            if (error) throw error;

            console.log('Found no. results: ', results.length);

            for(var r in results) {
                items.push(results[r]);
                console.log(results[r]);
            }
            
            response.send(items); 
            console.log('sent') ;

        });         
    }

    else
    {
        sql = 'SELECT * FROM items'; 
        console.log(sql);         

        connection.query(sql, function(error, results)
        {
            if (error) throw error;

            console.log('Found no. results: ', results.length);

            for(var r in results) {
                items.push(results[r]);
            }
            
            getCatsForItem(items, 0, function(items){
                console.log('GCFI');
                response.send(items); 
                console.log('sent') ;
            });


        });           
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
       console.log(content);
       var item = JSON.parse(content);

        var sql = 'INSERT INTO items (name, description, due) values (' + connection.escape(item.name) + ', ' + connection.escape(item.description) +', ' + connection.escape(item.due) + ')';
        connection.query(sql, function(error, result) {
            if (error) throw error;
            console.log(result.insertId);
            var returnMsg = {"status": true, "message": result.insertId};
            response.send(returnMsg);
        });
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

app.put('/updateItem/:id', function(request, response)
{
    var id = request.params.id; 
    console.log('receiving item data');  
    var content = '';

    request.on('data', function (data) {
        // Append data.
        content += data;
    });

    request.on('end', function () 
        {
            console.log(content);
            var item = JSON.parse(content);

            var sql = 'UPDATE items SET completed=' + connection.escape(item.completed) + ' where id=' + id;
            connection.query(sql, function(error, result) {
                if (error) throw error;
                console.log('changed ' + result.changedRows + ' rows');
                var returnMsg = {"status": true, "message": result.changedRows};            
                response.send(returnMsg);
            });

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

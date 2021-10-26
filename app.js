const express = require('express');
const app = express();
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const body_parser = require('body-parser');
const datapath=path.join(__dirname, 'routes/story_details.json');
app.use(cors());
app.use(express.static('routes'));
app.use(body_parser.urlencoded({ extended: true }));
app.get('/api',function(req,res,next){//gets main page and sends it
    try
    {
    res.sendFile(__dirname+'/index.html');
    }
    catch(e){
        next(e);
    }
});
app.get('/api/author_list',function(req,res,next){//gets list of authors and sends it
    try{
    const data = fs.readFileSync(datapath);
    const page=JSON.parse(data);
    var list_of_authors=[];
    for (var i in page){
        var chk=list_of_authors.includes(page[i].author);
        if (chk === false){
            list_of_authors.push(page[i].author);
        }
        }
        res.send(list_of_authors) ;
    }
    catch(e){
        next(e);
    }
    });
app.get('/api/stories/:author',function(req,res,next){//gets stories by author :author and sends it
    try{
    const data = fs.readFileSync(datapath);
    const page=JSON.parse(data);
    var author_catalogue=[];
    for (var i in page){
        if (page[i].author === req.params.author){
            author_catalogue.push(page[i].title);
        } 
    }
    if (author_catalogue === undefined || author_catalogue.length == 0) {
        const err = new Error('Author not found');
        err.status =404;
        throw err;
    }
    res.send(author_catalogue);
}
catch(e){
    next(e);
}
});
app.get('/api/log/:author',function(req,res,next){//sends true if :author is already stored as an author in the database , false if otherwise
    try{
        const data = fs.readFileSync(path.join(__dirname, 'routes/passes.json'));
        const page=JSON.parse(data);
        var b=false;
        for(var i in page){
            if(page[i].author===req.params.author){
                b=true;
            }
        }
        res.send(b);
    }
    catch(e){
        next(e);
    }
});
app.get('/api/log/:author/:password',function(req,res,next){//returns true is :author and :password are stored within the database as a pair
    try{
    const data = fs.readFileSync(path.join(__dirname, 'routes/passes.json'));
    const page=JSON.parse(data);
    var b = false;
    for(var i in page){
        if(page[i].author === req.params.author && page[i].password === req.params.password){
            b=true;
        }
    }
    res.send(b);
}
catch(e){
    next(e);
}
});
app.get('/api/stories/:author/:title', function (req, res, next) {//gets story by author :author with title :title
    try{
    const data = fs.readFileSync(datapath);
    const page=JSON.parse(data);
    const page_info = page.find(vart => vart.title === (req.params.title));
    const check_info = page.find(varu => varu.author === (req.params.author));
    if ((!page_info) || (!check_info) || !(page_info.author === check_info.author)){
        const err = new Error('Story not found');
        err.status = 404;
        throw err;
    }
    else{
    res.send(page_info);
    }
    }
    catch(e){
        next(e);
    }
  });
app.post('/api/createaccount',function(req,res,next){//posts url encoded string with a new author and their password to the data base
    try{
    const data = fs.readFileSync(path.join(__dirname, 'routes/passes.json'));
    const details=JSON.parse(data);
    const new_author = {
        author: req.body.author,
        password:req.body.password
    };
    details.push(new_author);
    fs.writeFileSync(path.join(__dirname, 'routes/passes.json'), JSON.stringify(details));
    res.status(201).json(new_author);
}
    catch(e){
        next(e);
    }
});
app.post('/api/stories', function(req,res,next){//posts url encoded with a new story , it's author and title to the database
    try{
    const data = fs.readFileSync(datapath);
    const details=JSON.parse(data);
    var b=false;
    for(var i in details){
        if(details[i].author===req.body.author && details[i].title===req.body.title){
            b=true;
        }
    }
    if (b===false){
        const new_story = {
            author: req.body.author,
            title: req.body.title,
            story: req.body.story,
            comments: []
        };
        details.push(new_story);
        fs.writeFileSync(datapath, JSON.stringify(details));
        res.status(201).json(new_story);
}
}
catch(e){
    next(e);
}
});
app.post('/api/stories/:author/:title/comments', function(req,res,next){//posts a comment to a story with title :title and author :author
    try{
    const data = fs.readFileSync(datapath);
    const details=JSON.parse(data);
    const new_comment = req.body.comments;
    for (var i in details){
        if((details[i].author === req.params.author) && (details[i].title === req.params.title)){
            details[i].comments.push(new_comment);
        }
    }
    fs.writeFileSync(datapath, JSON.stringify(details));
    res.status(201).json(new_comment);
}
catch(e){
    next(e);
}
});

app.listen(3000);//starting server at port 3000
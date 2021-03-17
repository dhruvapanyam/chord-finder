var express = require('express')

var app = express()

const port = process.env.PORT || 4000

var server = app.listen(port,function(){
    console.log('Listening on port',port,'...')
})


// app.use(express.static('front_end'));


if (process.env.NODE_ENV === "production") {

    app.use(express.static("front_end"));


    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname,  "build", "index.html"));
    });
}

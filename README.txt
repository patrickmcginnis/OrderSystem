Patrick McGinnis 

To run:
    npm i
    mkdir a4
    mongod --dbpath="a4"
    node database-initializer.js
    node server.js

    Proceed to localhost:3000


    ********
    Possible troubleshooting but I doubt you should have any issues:
        I use   mongoose.connect('mongodb://127.0.0.1/a4', {useNewUrlParser: true}); for my connection string
    
        NOT     mongoose.connect('mongodb://localhost/a4', {useNewUrlParser: true});

        as my computer does some things with the IP that make it impossible to run after some time.
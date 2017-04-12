var fs = require('fs');

fs.readFile('index.html', 'utf8', function(err, data){
    
    if(err)
        console.log(err);
    else
        console.log(data);
});
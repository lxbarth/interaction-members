var csv = require('csv'),
    fs = require('fs'),
    _ = require('underscore'),
    template = fs.readFileSync('./template._', 'utf-8');

var serial = function () {
    (_(arguments).reduceRight(_.wrap, function() {}))();
};

serial(function(next) {
    var members = {};
    csv()
        .fromPath('./members.csv', {trim: true, columns: true})
        .on('data', function(data) {
            if (data['MEMBER ORG']) members[data['MEMBER ORG']] = data['WEBSITE'];
        })
        .on('end', function() {
            next(members);
        });
},
function(next, members) {
    console.log(members);
});

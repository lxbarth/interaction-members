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
    var countries = {};
    csv()
        .fromPath('./countries.csv', {trim: true, columns: true})
        .transform(function(data) {
            data['Member Organization'] =
            _(data['Member Organization'].split(','))
                .map(function(e) {
                    return {
                        name: e.trim(),
                        link: members[e.trim()]
                    };
                });
            data['count'] = _.size(data['Member Organization']);
            return data;
        })
        .on('data', function(data) {
            console.log(data);
        })
        .on('end', function() {
            next(countries);
        });
},
function(next, countries) {
    
});

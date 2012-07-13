var csv = require('csv'),
    fs = require('fs'),
    _ = require('underscore'),
    memberTemplate = fs.readFileSync('./memberTemplate._', 'utf-8');

var serial = function () {
    (_(arguments).reduceRight(_.wrap, function() {}))();
};

serial(
// Read members.csv
function(next) {
    var links = {};
    csv()
        .fromPath('./members.csv', {trim: true, columns: true})
        .on('data', function(data) {
            if (data['MEMBER ORG']) links[data['MEMBER ORG']] = data['WEBSITE'];
        })
        .on('end', function() {
            next(links);
        });
},
// Read and transform countries.csv
function(next, links) {
    var countries = [];
    csv()
        .fromPath('./countries.csv', {trim: true, columns: true})
        .transform(function(data) {
            var members = _.chain(data['Member Organization'].split(','))
                .uniq(function(m) {
                    return m.name;
                })
                .sortBy(function(m) {
                    return m.name;
                })
                .map(function(m) {
                    return {
                        name: m.trim(),
                        link: links[m.trim()]
                    };
                })
                .value();
            return {    
                'name': data['Country'],
                'id': data['ID'],
                'ISO': data['ISO'],
                'total': _.size(members),
                'members': _.template(memberTemplate, {members: members})
            };
        })
        .on('data', function(data) {
            countries.push(data);
        })
        .on('end', function() {
            next(_.sortBy(countries, function(c) { return c.name; }));
        });
},
// Write out to new file.
function(next, countries) {
    var writer = csv()
        .toPath('./countries-processed.csv', {
            columns: Object.keys(countries[0]),
            header: true
        });
    _.each(countries, function(country) {
        writer.write(country);
    });
    writer.end();
});

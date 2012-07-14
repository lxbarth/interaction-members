var csv = require('csv'),
    fs = require('fs'),
    _ = require('underscore'),
    memberTemplate = fs.readFileSync('./memberTemplate._', 'utf-8'),
    sqlite = require('sqlite3').verbose();

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
                .uniq()
                .sort()
                .map(function(m) {
                    return {
                        name: m.trim(),
                        link: links[m.trim()]
                    };
                })
                .value();
            // No idea why sort does not completely sort the array. Help.
            members.shift(members.pop());
            return {    
                '$name': data['Country'],
                '$id': data['ID'],
                '$ISO': data['ISO'],
                '$total': _.size(members),
                '$members': _.template(memberTemplate, {members: members})
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
    var db = new sqlite.Database('./project/interaction-members/interaction_activity.sqlite');
    db.serialize(function() {
        db.run("CREATE TABLE interaction_activity (name VARCHAR(256), id INT, ISO VARCHAR(3), total INT, members TEXT)");
        _.each(countries, function(country) {
            db.run("INSERT INTO interaction_activity VALUES($name, $id, $ISO, $total, $members)", country);
        });
        db.close();
    });
    return;
});

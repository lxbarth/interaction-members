var csv = require('csv'),
    fs = require('fs'),
    _ = require('underscore'),
    template = fs.readFileSync('./template._', 'utf-8'),
    countries = {};

csv()
    .fromPath('./womw2011.csv', {trim: true, columns: true})
    .on('data', function(data) {
        countries[data.Country] = countries[data.Country] || [];
        countries[data.Country].push({
            name: data.Organization,
            iso: data.ISO || '',
            link: data['Link'] || 'http://google.com/?q=' +
                encodeURIComponent(data.Organization) + '&output=search'
        });
    })
    .on('end', function() {
        var writer = csv()
            .toPath('./out.csv', {columns: ['country', 'total', 'organizations'], header: true});
        _.each(countries, function(organizations, country) {
            organizations = _.chain(organizations)
                .uniq(function(o) {
                    return o.name;
                })
                .sortBy(function(o) {
                    return o.name;
                })
                .value();
            console.log(organizations);
            writer.write({
                country: country,
                total: _.size(organizations),
                organizations: _.template(template, {
                    organizations: organizations
                })});
        });
        writer.end();
    });

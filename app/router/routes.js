
var fs = require('fs-extra');
var path = require('path');
const User = require('../model/user');
const Food = require('../model/food');
const utils = require('../auth/utils');
var http = require('http');
var https = require("https");
module.exports = function(app) {
	var photoURL;
	app.route('/upload')
    .post(function (req, res, next) {

        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);
						var randomName = utils.randomString(12);
            //Path where image will be uploaded
            fstream = fs.createWriteStream('./app/img/' + filename + randomName);
            file.pipe(fstream);
            fstream.on('close', function () {
                console.log("Upload Finished of " + filename + randomName);
                filename += randomName;
								photoURL = '/img/' + filename;

						});
        });
				return;
    });


	app.get('/foods', function(req, res){
		console.log('START answer for GET= ' + "req.query: " + JSON.stringify(req.query) + "req.body: " + JSON.stringify(req.body));
		var coords = [];
    coords[0] = req.query.pos.lng;
    coords[1] = req.query.pos.lat;
		var maxDistance = req.query.maxdist/111.12;
		Food.find({
			location: {
         $near: coords,
         $maxDistance: maxDistance
       }
			})
			.populate('owner')
			.exec(function(err, foods) {
			res.status(200).json(foods);
			res.end();
			console.log('answer for GET' + JSON.stringify(foods));
		});
	});

	app.get('/img/*', function (req, res, next) {
			res.sendFile(path.join(__dirname,  '../' + req.url));
			return;
	});

	app.get('/getFSQ', function (req, res) {
			console.log('cathc getFSQ from client');

			var options = {
			  host: 'api.foursquare.com',
			  path: '/v2/venues/search?ll=50.4811,30.486&limit=5&client_id=3LRKSJWBD3IGVOVDTYAFTG4P4PZQPDEKKEQG5HNJCXBXTCCS&client_secret=3V4BYVOQOMGRFLGXBOU4DWGHJVHMZW0FUXPMPOYOAYLRMLTM&v=20160101',
				method : 'GET',

			};
			var res_data = '';
			var req = https.get(options, function(response) {
			  // handle the response

			  response.on('data', function(chunk) {
					console.log('in process');
					res_data += chunk;

			  });
			  response.on('end', function() {
					console.log('ended!');
					console.log(res_data);
					res.json(res_data);
			  });
			});

			req.on('error', function(e) {
			  console.log("Got error: " + e.message);
			});

	});


	//https://api.foursquare.com/v2/venues/search?ll=50.4811,30.486&limit=5&client_id=3LRKSJWBD3IGVOVDTYAFTG4P4PZQPDEKKEQG5HNJCXBXTCCS&client_secret=3V4BYVOQOMGRFLGXBOU4DWGHJVHMZW0FUXPMPOYOAYLRMLTM&v=20160101');

	app.post('/addfood', function(req, res){
		console.log('take POST query: ' + "req.query: " + JSON.stringify(req.query) + "req.body: " + JSON.stringify(req.body));
    var newfood = new Food();

			newfood.name = req.body.foodname;
			newfood.location = req.body.location;
			newfood.serving = req.body.serving;
			newfood.delivery = req.body.delivery;
			newfood.comment = req.body.comment;
			newfood.owner = req.body.ownerId;
			newfood.photoURL = photoURL;
    	newfood.save(function(err){
      if(err) {
				console.log('cant save: ' + err );

				res.send(err); return;}

			console.log("SAVED: " + JSON.stringify(newfood.name));
			res.json(newfood);
			});
		});



};

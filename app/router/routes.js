
const fs = require("fs");
const User = require('../model/user');
const Food = require('../model/food');
// authenticate
module.exports = function(app) {




	// food routes
	app.get('/foods', function(req, res){
		console.log('START answer for GET= ' + "req.query: " + JSON.stringify(req.query) + "req.body: " + JSON.stringify(req.body));

		Food.find({
			location: {
				$near: [30.491008758544922, 50.476079378950324],
		     $maxDistance: 50000000,
		     $minDistance: 1
			 }
		}, function(err, foods) {
			res.status(200).json(foods);
			res.end();
			console.log('answer for GET' + JSON.stringify(foods));
		});
	});



	app.post('/foods', function(req, res){

    var newfood = new Food();
			newfood.name = req.body.name;
			newfood.location = req.body.location;

    newfood.save(function(err){
      if(err) {
				console.log('errorrr');
				res.send(err); return;}

				res.json(req.body);
      console.log("saved food!" + res.headersSent);

			console.log("req.body: " + JSON.stringify(req.body) + "req.query: " + JSON.stringify(req.query));

        });


    });



	// map.geojson routes
	app.get('/data', function(req, res) {
		var obj;
		fs.readFile('./app/data/map.geojson', 'utf8', function (err, data) {
			if (err) throw err;
			obj = JSON.parse(data);
			res.send(obj);
			var now = new Date();
			console.log('send map.geojson to HTTP get request ' + now);
			res.end();
		});
	});


};

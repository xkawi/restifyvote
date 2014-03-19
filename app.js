var restify = require('restify');
var Firebase = require('firebase');

var ip_addr = '127.0.0.1';
var port = '3000';

var server = restify.createServer({
	name: "restifyvote"
});

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());

var production_db = "https://restifyvote.firebaseio.com";
var data_db = "https://restifyvote.firebaseio.com/data";

var PATH = '/votes';
//server.get({path: PATH, version: '0.0.1'}, getAllVotes);
server.get({path: PATH+'/result', version: '0.0.1'}, getVoteResult);
server.post({path: PATH, version: '0.0.1'}, postVotes);
server.post({path: PATH+'/input', version: '0.0.1'}, getInput);
/*function getAllVotes(req, res, next){
	res.setHeader('Access-Control-Allow-Origin', '*');
	ref.once('value', function(snapshots){
		var snaps = snapshots.val();
		var players = snaps.player_information;
		res.json(200, players);
		next();
		//for (var i = players.length - 1; i >= 0; i--) {
		//	var p = players[i];
			//p.id, p.fn, p.ln, p.img, p.location, p.health, p.district, p.votes
		//	var p.id
		//};
	});
}*/

function getVoteResult(req, res, next){
	var ref = new Firebase(production_db);

	res.setHeader('Access-Control-Allow-Origin', '*');
	//logic goes here
	var target = {
		"name": "robin",
		"method": "lightning"
	}

	ref.once('value', function(snapshots){
		var snaps = snapshots.val();
		var allPlayers = snaps.player_information;
		var allMethods = snaps.attack_methods;
		var player_mostVote = {
			"id": 0,
			"name": "RobinWang",
			"votes": 0
		}

		var attack_mostVote = {
			"method": "thunderstorm",
			"votes": 0
		};

		for (var i = allPlayers.length - 1; i >= 0; i--) {
			var p = allPlayers[i];
			if (p.votes > player_mostVote.votes){
				player_mostVote.id = p.id;
				player_mostVote.name = p["first_name"].toString() + p["last_name"].toString();
				player_mostVote.votes = p.votes;
			}
		};
		console.log(Object.keys(allMethods));
		for (var i = allMethods.length - 1; i >= 0; i--) {
			//var attack = allMethods[i];
			var attack = Object.keys(allMethods[i])[0];
			var votes = allMethods[i][attack];
			console.log(attack, allMethods[i][attack]);
			if (votes > attack_mostVote.votes){
				attack_mostVote.method = attack;
				attack_mostVote.votes = votes;
			}
		};
		target.name = player_mostVote.name;
		target.method = attack_mostVote.method;
		res.json(target);
		next();
	});
}

function getInput(req, res, next){
	var newRef = new Firebase(data_db);
	if (req.body){
		newRef.set(req.body);
		res.setHeader('content-type', 'application/json');
		res.send(200, req.body);
	} else {
		res.send(200, {"error": "missing POST request body"});
	}
	next();
}
	//console.log(req.body);
/* EXAMPLE FORMAT OF INPUT
{
	"player_information": [
		{
			"id": 1,
			"first_name": "Robin",
			"last_name": "Wang",
			"img": "robin.jpg",
			"location": {
				"latitude": 1.2,
				"longitude": 1.5
			},
			"health": 0.5,
			"district": "Hell",
			"votes": 0
		},
		{
			"id": 2,
			"first_name": "Rob",
			"last_name": "Wa",
			"img": "rob.jpg",
			"location": {
				"latitude": 1.6,
				"longitude": 1.2
			},
			"health": 0.7,
			"district": "Heaven",
			"votes": 0
		}
	],
	"attack_methods" : [
		{
			"method": "lightning strike",
			"votes": 0
		},
		{
			"method": "thunderstorm",
			"votes": 0
		},
		{
			"method": "earthquake",
			"votes": 0
		}
	]
}
*/

server.listen(port, ip_addr, function(){
	console.log('%s listening at %s', server.name, server.url);
});
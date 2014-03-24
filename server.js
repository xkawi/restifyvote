var restify = require('restify');
var Firebase = require('firebase');

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

var server = restify.createServer({
	name: "restifyvote"
});

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());

var production_db = "https://restifyvote.firebaseio.com";
var data_db = "https://restifyvote.firebaseio.com/data";
var img_url = "https://s3-ap-southeast-1.amazonaws.com/ei-player-images";

var PATH = '/votes';
server.get({path: '/'}, showIndex);
server.get({path: PATH+'/result', version: '0.0.1'}, getVoteResult);
server.post({path: PATH+'/init', version: '0.0.1'}, init_db);

function showIndex(req, res, next){
	res.setHeader('content-type', 'text/html');
	var body = '<html><body style="text-align:center;">';
	body += '<h3><a href="http://voting-system.s3-website-ap-southeast-1.amazonaws.com/">Start Voting!</a></h3>';
	body += '<p>RESTful EndPoint:<br/>GET /votes/result<br/>POST /votes/init</p>';
	body += '</body></html>';
	res.writeHead(200, {
		'Content-Length': Buffer.byteLength(body),
		'Content-Type': 'text/html'
	});
	res.write(body);
	res.end();
	next();
}
function getVoteResult(req, res, next){
	var ref = new Firebase(production_db);

	res.setHeader('Access-Control-Allow-Origin', '*');
	
	var target = {
		"result": {
			"player_id": 0,
			"first_name": "robin",
			"last_name": "wang",
			"target_queue": "q.fire"
		}
	}

	ref.once('value', function(snapshots){
		var snaps = snapshots.val();

		var allPlayers = snaps.player_information;
		var player_mostVote = {
			"player_id": 0,
			"first_name": "robin",
			"last_name": "wang",
			"votes": 0
		}
		for (var i = allPlayers.length - 1; i >= 0; i--) {
			var p = allPlayers[i];
			if (p.votes > player_mostVote.votes){
				player_mostVote.player_id = p.id;
				player_mostVote.first_name = p["first_name"];
				player_mostVote.last_name = p["last_name"];
				player_mostVote.votes = p.votes;
			}
		};

		var allMethods = snaps.attack_methods;
		var attack_mostVote = {
			"id": 0,
			"method": "fire",
			"target_queue": "q.fire",
			"votes": 0
		};
		for (var i = allMethods.length - 1; i >= 0; i--) {
			var attack = allMethods[i];
			if (attack.votes > attack_mostVote.votes){
				attack_mostVote = attack;
			}
		};

		/* DESIRED OUTPUT
		{
		    results: {
		      player_id: 1,
		      first_name: 'robin',
		      last_name: 'wang',
		      target_queue: 'q.fire'
		    }
		}
		*/
		target["result"].first_name = player_mostVote.first_name;
		target["result"].last_name = player_mostVote.last_name;
		target["result"].player_id = player_mostVote.player_id;
		target["result"].target_queue = attack_mostVote.target_queue;

		res.json(target);
		next();
	});
}

function init_db(req, res, next){
	if (req.body){
		/* EXTRA INFORMATION FOR UPDATING PRIMITIVE DATA
		var startRef = new Firebase(production_db + "/start");	
		startRef.transaction(function(current_value) {
			console.log(current_value)
			return true; //update value to true
		});*/
		var pdata = req.body["ns0:voting_information"]["ns0:player"];
		var players = [];
		for (var i = pdata.length - 1; i >= 0; i--) {
			var p = pdata[i];
			var player = { location : {} };
			player.id = p["ns0:id"];
			player.last_name = p["ns0:last_name"];
			player.first_name = p["ns0:first_name"];
			player.location.latitude = p["ns0:location"]["ns0:latitude"];
			player.location.longitude = p["ns0:location"]["ns0:longitude"];
			player.health = p["ns0:health"];
			player.district = p["ns0:district"];
			player.img = img_url + "/" + p["ns0:first_name"] + ".jpg";
			player.votes = 0;
			players.push(player);
		};

		var adata = req.body["ns0:voting_information"]["ns0:attack"];
		var attacks = [];
		for (var i = adata.length - 1; i >= 0; i--) {
			var att = adata[i];
			var attack = {};
			attack.id = att["ns0:id"];
			attack.name = att["ns0:name"];
			attack.target_queue = att["ns0:queue"];
			attack.votes = 0;
			attacks.push(attack);
		};

		var fbSave = {
			"player_information": players,
			"attack_methods": attacks
		}
		var ref = new Firebase(production_db);
		ref.set(fbSave);

		res.setHeader('content-type', 'application/json');
		res.send(200, { "status": "success"} );
	} else {
		res.send(200, {"error": "missing POST request body"});
	}
	next();
}

server.listen(port, ipaddress, function(){
	console.log('%s listening at %s', server.name, server.url);
});
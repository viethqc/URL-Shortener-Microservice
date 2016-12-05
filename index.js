var express = require('express');
var app = express();
var url = require('url');
var mongo = require('mongodb').MongoClient;

var urlMongo = "mongodb://localhost:27017/urlshortermicroservices";

app.set('port', process.env.PORT || 5000);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get("/", function(request, response){
	response.render('index', {});
});

app.get("/[0-9]+", function(request, response){
	var objURL = null;
	var strLinkID = "";

	objURL = url.parse(request.url, true);
	if (objURL == null)
	{
		response.render('new', {action : "error"});
		return;
	}

	strLinkID = objURL.path.substring(1);
	console.log(strLinkID);

	mongo.connect(urlMongo, function(err, db){
		var doc = db.collection('urlshorter');

		doc.find({
				id : parseInt(strLinkID)
			}).toArray(function(err, documents) {
				if (documents.length == 0)
				{
					response.render('new', {action : "error"});
					return;
				}
				else
				{
					return response.redirect(documents[0].name);
				}
			});
	});
});

app.get("/new/*", function(request, response){
	var objURL = null;	
	var strPath = "";
	var arrParts = [];
	var i = 0;
	var iCount = 0;

	objURL = url.parse(request.url, true);
	if (objURL == null)
	{
		response.render('index');
		return;
	}

	//Tim link
	i = 0;
	for (i = 0; i < objURL.path.length; i++)
	{
		if (objURL.path[i] == '\/')
		{
			iCount++;
		}

		if (iCount == 2)
		{
			break;
		}
	}
	strPath = objURL.path.substring(i + 1);

	//validate url
	if (validateURL(strPath) == false)
	{
		response.render('new', {action : "show", link : "Error : link input error"})
		return;
	}

	mongo.connect(urlMongo, function(err, db){
		var doc = db.collection('urlshorter');

		//doc.insert({name : "https:facebook.com", id : 2});
		doc.find({
			name : strPath
		}).toArray(function(err, documents) {
			console.log(documents);
			if (documents.length == 0)
			{
				doc.find({
				}).sort({id : -1}).limit(1).toArray(function(err, documents) {
					var max = 0;
					if (documents.length == 0)
					{
						max = 0;
					}
					else
					{
						max = documents[0].id + 1;
					}
					doc.insert({name : strPath, id : max});
					console.log("name : " + strPath + " id : " + max);
					response.render('new', {action : "show", link : strPath, id : max});
					return;
				});
			}
			else
			{
				response.render('new', {action : "show", link : documents[0].name, id : documents[0].id});
				return;
			}
		})
	});

	console.log(objURL);
});

function validateURL(textval) {
    var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return urlregex.test(textval);
}

app.listen(app.get('port'), function(){
	console.log("Listen in port : %d", app.get("port"));
})

function GetIdMax(callback)
{

}


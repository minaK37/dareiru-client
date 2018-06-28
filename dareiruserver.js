var fs = require("fs");
var http = require("http");
var server = http.createServer();
const LindaClient = require("linda").Client;
const socket = require('socket.io-client').connect('http://linda-server.herokuapp.com');
const linda = new LindaClient().connect(socket);
const ts = linda.tuplespace('masuilab');


linda.io.on('connect', () => {
    console.log('linda-connect!');
});
server.on("request", function(request, response){
	//HTMLファイルをストリームで読み込む
	var stream = fs.createReadStream("index.html");
	response.writeHead(200, {"Content-Type":"text/html"});
	stream.pipe(response);
});
server.listen(process.env.PORT||1234);

// HTTPをWebSocketにUpgradeする
var io = require("socket.io").listen(server);

// 接続した時に実行される
io.on("connection", function(socket){

	// メッセージ送信のイベント
      ts.watch({
      where: "delta",
      type: "dareiru"
  }, (err, tuple) => {
    if(tuple.data.Who==""){
      	io.emit("publish", {value:"たぶん誰もいませんよ"});
    }
    else{
    split = tuple.data.Who.split( "," );
    var kaigyo = "\n";
    var value = split.join( kaigyo );
		io.emit("publish", {value:value});

  };
	});


});

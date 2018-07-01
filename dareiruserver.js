var fs = require("fs");
var http = require("http");
var server = http.createServer();
const LindaClient = require("linda").Client;
const socket = require('socket.io-client').connect('http://linda-server.herokuapp.com');
const linda = new LindaClient().connect(socket);
const ts = linda.tuplespace('masuilab');
var port = process.env.PORT ||1234;
const axios = require('axios');
var urlArray=[];

linda.io.on('connect', () => {
    console.log('linda-connect!');
});
server.on("request", function(request, response){
	//HTMLファイルをストリームで読み込む
	var stream = fs.createReadStream("index.html");
	response.writeHead(200, {"Content-Type":"text/html"});
	stream.pipe(response);
});
server.listen(port);

// HTTPをWebSocketにUpgradeする
var io = require("socket.io").listen(server);

// 接続した時に実行される
io.on("connection",function(socket){

	// メッセージ送信のイベント
      ts.watch({
      where: "delta",
      type: "dareiru"
  },async (err, tuple)  => {
    if(tuple.data.Who==""){
      	io.emit("publish", {value:"たぶん誰もいませんよ"});

    }
    else{
    split = tuple.data.Who.split( "," );
    for (var n in split){
      if(split[n]!=""){
      var iconURL =await icon(split[n]);
      var htmlImg=`<hr><img src="${iconURL}.png" width="16" height="16"><hr></br>`
      if (urlArray.indexOf(htmlImg) == -1){
      urlArray.push(htmlImg);
    }
    }};
    str = urlArray.join('');
    var kaigyo = "</br>";
    var value = split.join( kaigyo );
    dareiru = str+value
		io.emit("publish", {value:dareiru});
    console.log(dareiru)
  };
	});

});


async function fetchPageIcon (pageTitle) {
  const res = await axios({
    method: 'GET',
    url: `http://scrapbox.io/api/pages/masuilab-dareiru/${pageTitle}`,


  })
  return res.data

};

async function icon (icons) {
	const Data = await fetchPageIcon(`${icons}`);
  var url = Data.lines[1].text ;
  var gyazoURL = url.slice( 1,-1 ) ;
  return gyazoURL;
};

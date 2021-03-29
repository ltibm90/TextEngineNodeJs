global.TextEngine = require("./TextEngine.js");

class UserInfo
{
	constructor()
	{
		this.Name = "macmillan";
		this.RegisterDate = "01.01.2020";
		this.Informations = [];
		this.Informations["Mesajlar"] = 1000;
		this.Informations["Konular"] = 100;
		this.Informations["Rep Puanı"] = 25;
	}
	GetReferrer()
	{
		return "XÜye";
	}
	GetGroup()
	{
		return "AR-GE";
	}
	HasCustomInformations()
	{
		return  Object.keys(this.Informations).length > 0;
	}
}
const http = require('http');
const requestListener = function (req, res) {
	res.writeHead(200, { "Content-Type": "text/html" });
	var te = new TextEngine.TextEvulator("te_start.html", true);
	let globalInfo = new Object();
	globalInfo.title = "Cyber-Warrior User Info";
	globalInfo.footer = "<b>Ana Sayfa</b>";
	let userInfo = new UserInfo();
	globalInfo.currentUser = new Object();
	globalInfo.currentUser.Access = 1;
	globalInfo.OnlineUsers = ["MacMillan", "Üye2", "Üye3", "Üye4"];
	globalInfo.user = userInfo;
	te.GlobalParameters = globalInfo;
	te.ParamNoAttrib = true;
	te.TagInfos.Get("js").Flags = TextEngine.TextElementFlags.TEF_NoParse;
	te.EvulatorTypes.SetType("js",() => new  TextEngine.Evulator.JSEvulator());
	te.Parse();
	res.end(te.Elements.EvulateValue().TextContent);
}

const server = http.createServer(requestListener);
server.listen(8080);
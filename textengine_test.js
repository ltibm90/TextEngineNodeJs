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
class WhileTestClass
{
    constructor()
    {
        this.Items = [];
        this.Position = -1;
    }
    Next()
    {
        return ++this.Position < this.Items.length;
    }
    Get()
    {
        return this.Items[this.Position];
    }
}
const http = require('http');
const requestListener = function (req, res) {
	res.writeHead(200, { "Content-Type": "text/html" });
	let wtc = new WhileTestClass();
	wtc.Items.push("Item1");
	wtc.Items.push("Item2");
	wtc.Items.push("Item3");
	wtc.Items.push("Item4");
	wtc.Items.push("Item5");
	wtc.Items.push("Item6");
	var te = new TextEngine.TextEvulator("te_start.html", true);
	let globalInfo = new Object();
	globalInfo.title = "Cyber-Warrior User Info";
	globalInfo.footer = "<b>Ana Sayfa</b>";
	globalInfo.whileItems = wtc;
	let userInfo = new UserInfo();
	globalInfo.currentUser = new Object();
	globalInfo.currentUser.Access = 1;
	globalInfo.OnlineUsers = ["MacMillan", "Üye2", "Üye3", "Üye4"];
	globalInfo.user = userInfo;
	te.GlobalParameters = globalInfo;
	te.ParamNoAttrib = true;
	te.UseJSTag();
	te.Parse();
	res.end(te.Elements.EvulateValue().TextContent);
}

const server = http.createServer(requestListener);
server.listen(8080);

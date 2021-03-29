## Installation And Download

[Text Engine](https://raw.githubusercontent.com/ltibm90/TextEngineNodeJs/main/textengine.js)
1 - Put TextEngine.js to your js path.
```js
            global.TextEngine = require("./TextEngine.js");
```


## Template Engine Usage

```js
            let evulator = new TextEngine.TextEvulator();
            let data = [];
            data["is_loaded"] = true;
            data["str_data"] = "string data";
            data["int_data"] = 12345;
            //User can change Left and Right tag.
            //evulator.LeftTag = '[';
            //evulator.RightTag = ']';
            evulator.GlobalParameters = data;
            evulator.Text = "{if is_loaded}Loaded{/if} string data: {%str_data}, int data: {%int_data}";
            //Parse content.
            evulator.Parse();
            //Evulate all.
            let result = evulator.Elements.EvulateValue();
            //Output: Loaded string data: string data, int data: 12345
            let resultStr = result.TextContent;
						console.log(resultStr);
```


## ParFormat Usage
```js
            //Long usage
            let pf = new ParDecoder.ParFormat();
            let kv = new Object();
            kv["name"] = "MacMillan";
            kv["grup"] = "AR-GE";
            kv["random"] = function () {
                return Math.floor(Math.random() * (100 - 1) +1);
            };
            pf.SurpressError = true;
            pf.Text = "User: {%name}, Group: {%grup}, Random Number: {%random()}";

            //Short usage
            console.log(ParDecoder.ParFormat.Format("User: {%name}, Group: {%grup}, Number Sayı: {%random()}", kv));


            //Output  User: MacMillan, Group: AR-GE, Random Number: 61
            let res = pf.Apply(kv);
						console.log(res);

```

# Evulators

## NoPrintEvulator
```csharp
            TextEvulator evulator = new TextEvulator();
            //NoPrint inner is evulated bu not print to result.
			evulator.Text = "{NOPRINT}.............{/NOPRINT}";
```

## CM(Call Macro)Evulator and MacroEvulator
```csharp
            let evulator = new TextEngine.TextEvulator();
            //evulator.Text = "{noprint}{macro name=macroname}{/macro}{noprint}{cm macroname}";
            evulator.ParamNoAttrib = true;
            evulator.Text = "{noprint}{macro name=macro1}This is macro line, param1: {%param1}, param2: {%param2}\r\n{/macro}{/noprint} {cm macro1}{cm macro1 param1=\"'test'\" param2=123456}";
            evulator.Parse();
            //Output: This is macro line, param1: , param2: \r\nThis is macro line, param1: test, param2: 123456\r\n
            let result = evulator.Elements.EvulateValue().TextContent;
						console.log(result)
```


## ForEvulator, ContinueEvulator And BreakEvulator Usage
```csharp
            let evulator = new TextEngine.TextEvulator();
            //evulator.Text = "{FOR var=i start=0 step=1 to=5}Current Step: {%i}{/FOR}";
            let kv = new Object();
            kv["name"] = "TextEngine";
            evulator.GlobalParameters = kv;
            evulator.Text = "{FOR var=i start=0 step=1 to='name.length'}{%name[i]}{if i == 4}{continue}{/if}{if i==7}{break}{/if}-{/FOR}";
            evulator.ParamNoAttrib = true;
            evulator.Parse();
            //Output: "T-e-x-t-En-g-i"
            let result = evulator.Elements.EvulateValue().TextContent;
						console.log(result)
```

## ForeachEvulator Usage
```js
            let evulator = new TextEngine.TextEvulator();
            //evulator.Text = "{FOREACH var=item in=list}{/FOR}";
						//for for of {FOREACH var=item in=list of}{/FOR}
            let kv = new Object();
            kv["list"] = ["item1", "item2", "item3"];
            evulator.GlobalParameters = kv;
            evulator.Text = "{FOREACH var=current in=list}{%current}\r\n{/FOREACH}";
            evulator.ParamNoAttrib = true;
            evulator.Parse();
            //Output: item1\r\nitem2\r\nitem3\r\n
            let result = evulator.Elements.EvulateValue().TextContent;
						console.log(result)
```
## IfEvulator Usage
```js
        		let evulator = new TextEngine.TextEvulator();
            //evulator.Text = "{IF statement}true{elif statement}elif true{/elif}{else}false{/IF}";
            let kv = new Object();
            kv["status"] = 3;
            evulator.GlobalParameters = kv;
            evulator.ParamNoAttrib = true;
            evulator.Text = "{IF status==1}status = 1{ELIF status == 2}status = 2 {ELSE}status on else, value: {%status}{/IF}";
            evulator.Parse();
            //Output: status on else, value: 3
            let result = evulator.Elements.EvulateValue().TextContent;
						console.log(result);
```

## IncludeEvulator Usage
```js
			let evulator = new TextEngine.TextEvulator();
            evulator.Text = "{include name=\"'path'\" xpath='optional' parse='true or false(as text)'";
			evulator.Parse();
            let result = evulator.Elements.EvulateValue().TextContent;
```

## RepeatEvulator Usage
```js
            let evulator = new TextEngine.TextEvulator();
            evulator.Text = "{repeat current_repeat='cur' count=2}Current Repat: {%cur}{if cur == 0}-{/if}{/repeat}";
            evulator.Parse();
            //Output: "Current Repat: 0-Current Repat: 1"
            let result = evulator.Elements.EvulateValue().TextContent;
						console.log(result);
```

## ReturnEvulator Usage
```js
            let evulator = new TextEngine.TextEvulator();
            evulator.Text = "Test variable, test variable 2 {if !test}{return}{/if} test variable 3";
            evulator.Parse();
            //Output: Test variable, test variable 2 
            let result = evulator.Elements.EvulateValue().TextContent;
						console.log(result);
```


## SetEvulator And UnsetEvulator
```js
            let evulator = new TextEngine.TextEvulator();
            let kv = new Object();
            kv["status"] = true;
            kv["total"] = 5;
            evulator.GlobalParameters = kv;
            evulator.Text = "{set if=status name=variable value='total * 2'} variable is: {%variable}, {unset name=variable}\r\nvariable is: {%variable}";
            evulator.ParamNoAttrib = true;
            evulator.Parse();
            //Output: " variable is: 10, \r\nvariable is: "
            let result = evulator.Elements.EvulateValue().TextContent;
						console.log(result);
```


## SwitchEvulator
```js
            let evulator = new TextEngine.TextEvulator();
            let kv = new Object();
            kv["total"] = 2;
            evulator.GlobalParameters = kv;
            evulator.Text = `{switch c=total}
                                {case v=1}Value 1{/case}
                                {case v=2}Value 2{/case}
                                {default}Default Value{/default}
                                {/switch}`;
            evulator.ParamNoAttrib = true;
            evulator.Parse();
            //Output: Value 2
            let result = evulator.Elements.EvulateValue().TextContent;
						console.log(result);
```



## JsEvulator Text Style

```js
            let evulator = new TextEngine.TextEvulator();
            let kv = new Object();
            kv["name"] = "macmillan";
            evulator.GlobalParameters = kv;
						evulator.TagInfos.Get("js").Flags = TextEngine.TextElementFlags.TEF_NoParse;
						evulator.EvulatorTypes.SetType("js",() => new  TextEngine.Evulator.JSEvulator());
            evulator.Text = "{js @text=1 username='name' other=12345}username is ${username}, othervar ${other} and global variables can be use{/js}";
            evulator.ParamNoAttrib = true;
            evulator.Parse();
            //Output: username is macmillan, othervar 12345 and global variables can be use
            let result = evulator.Elements.EvulateValue().TextContent;
						console.log(result);
```




## JsEvulator Code Style

```js
            let evulator = new TextEngine.TextEvulator();
            let kv = new Object();
            kv["name"] = "macmillan";
            evulator.GlobalParameters = kv;
						evulator.TagInfos.Get("js").Flags = TextEngine.TextElementFlags.TEF_NoParse;
						evulator.EvulatorTypes.SetType("js",() => new  TextEngine.Evulator.JSEvulator());
            evulator.Text = `{js username='name' other=12345}
            	text = "this is jsevulator code style";
              text += ", " + username + ", ";
              if(typeof other != "undefined")
              {
              	text += "other vars: " + other;
              }
            {/js}`;
            evulator.ParamNoAttrib = true;
            evulator.Parse();
            //Output: this is jsevulator code style, macmillan, other vars: 12345
            let result = evulator.Elements.EvulateValue().TextContent;
						console.log(result);
```

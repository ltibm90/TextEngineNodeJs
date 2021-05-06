//Start TextEngine\common.js
//Start Common\common_globals.js
var Common = new Object();
if(typeof global == "undefined" && typeof window != "undefined")
{
	window["global"] = window;
}
Common.Init = function()
{
	Common.Extensions.Init();
	Common.PhpFunctions.Init();
	Common.Misc.Init();
	if(global["File"] == undefined)
	{
		global["File"] = Common.File;
	}
}
//End Common\common_globals.js

//Start Common/Utils/CollectionBase.js
Common.CollectionBase = class CollectionBase
{
	constructor()
	{
		this.inner = [];
	}
	GetItem(index)
	{
		return this.inner[index];
	}
	SetItem(index, value)
	{
		this.inner[index] = value;
	}
    Exists(offset) {
        return this.GetIndex(offset) >= 0;
    }
	GetCount()
	{
		return this.inner.length;
	}
	get Count()
	{
		return this.GetCount();
	}
    Add(item)
    {
        this.inner.push(item);
    }
	AddRange(items)
	{
		if(is_array(items))
		{
			for(let i = 0; i < items.length(); i++)
			{
				this.inner.push(items[i]);
			}
		}
		else
		{
			for(let i = 0; i < items.Count; i++)
			{
				this.inner.push(items.GetItem(i));
			}
		}
	}
    Clear()
    {
		this.inner = [];
    }
    Contains(item)
    {
       return this.IndexOf(item) >= 0;
    }
    IndexOf(item)
    {
        return this.inner.indexOf(item);
    }
    Remove(item)
    {
        let num = this.IndexOf(item);
		if(num >= 0)
		{
			this.RemoveAt(num);
		}
		return false;
    }
    RemoveAt(index)
    {
        this.inner.splice(index, 1);
    }
	Clone()
	{
		return Object.assign({}, this);
	}
    *[Symbol.iterator]() {
		for(let i = 0; i < this.Count ; i++)
		{
			yield this.GetItem(i);
		}
    }
}
//End Common/Utils/CollectionBase.js

//Start Common/Utils/ComputeActions.js
Common.ComputeActions = class ComputeActions
{
     static PriotiryStop = 
        [
            "and",
            "&&",
            "||",
            "==",
            "=",
            ">",
            "<",
            ">=",
            "!=",
            "<=",
            "or",
            "+",
            "-",
            ",",
            "=>",
            "?",
            ":" ];
	static OperatorResult(item1, item2, operator)
	{

		if (is_object(item1) || is_object(item2)) {
			if(is_object(item1) && item2 == -1) return item1;
			return null;
		}
		
		if ((operator == "||" || operator == "or" || operator == "&&" || operator == "and") || ( (isNaN(item1) || isNaN(item2)) && (operator == "&" || operator == "|") )) {
			
			let lefstate = !empty(item1);
			let rightstate = !empty(item2);
			if (operator == "||" || operator == "|" || operator == "or") {
				if (lefstate != rightstate) {
					return true;
				}
				return lefstate;
			} else {
				if (lefstate && rightstate) {
					return true;
				}
				return false;
			}
		}
		switch (operator) {
			case '|':
				return item1 | item2;
			case '&':
				return item1 & item2;
			case '==':
				return item1 == item2;
			case '=':
				return item1 == item2;
			case '!=':
				return item1 != item2;
			case '>=':
				return item1 >= item2;
			case '<=':
				return item1 <= item2;
			case '>':
				return item1 > item2;
			case '<':
				return item1 < item2;
			case '+':
				return item1 + item2;
			case '-':
				return item1 - item2;
			case '*' :
				return item1 * item2;
			case '/':
				return item1 / item2;
			case '%':
				return item1 % item2;
			case '^':
				return pow(item1, item2);
		}
		if(!item1) return item2;
		return item1;
	}
	static CallMethodSingle(item, name, mparams)
    {
        if (item == null || item == undefined) return null;
		let result = null;
		if(is_array(item) ||is_object(item))
		{
			let val = item[name];
			if(is_callable(val))
			{
				result = val.apply(item, mparams);
			}
		}
        else if(is_callable(item))
        {
           result = item.apply(null, mparams);
        }
        return result;
    }
    static CallMethod(name, mparams, vars, localvars = null)
    {
        return ComputeActions.CallMethodSingle(vars, name, mparams);
    }
    static GetPropValue(item, vars, localvars = null)
    {		
        let res = null;
        let name = item.Value;
        if (localvars != null)
        {
            res = ComputeActions.GetProp(name, localvars);
        }
        if (res == null)
        {		
            res = ComputeActions.GetProp(name, vars);
        }
        return res;
    }
    static GetProp(item, vars)
    {
        if (vars == null || vars == undefined) return null;
		if(vars instanceof Common.KeyValueGroup)
		{
			for (let i = vars.Count - 1; i >= 0; i--)
            {
				let curItem = vars.GetItem(i);
                if (curItem instanceof Common.KeyValues)
                {
                    let m = ComputeActions.GetProp(item, curItem);
                    if (m != null) return m;
                }
            }
            return null;
		}
        if (vars instanceof Common.KeyValues)
        {
            return vars.Get(item);
        }
		else if (is_array(vars) || is_object(vars) || is_string(vars))
        {
			let aresult = vars[item];
			if(aresult == undefined) return null;
			return aresult;
        }
        return null;
    }
}
//End Common/Utils/ComputeActions.js

//Start Common/Utils/Extensions.js
Common.Extensions = class Extensions
{
	static Init()
	{
		Array.prototype.FirstOrDefault = function()
		{
			if(this.length == 0) return null;
			return this[0];
		}
		Array.prototype.Contains = function(item, usefindindex = false)
		{
			if(usefindindex)
			{
				return this.findIndex(function(v)
				{
					return v == item;
				}) >= 0;
			}
			return this.indexOf(item) >= 0;
		}
		String.prototype.SubString = function(start, length)
		{
			return this.substr(start, length);
		}
		String.prototype.IsNumeric = function()
		{
			return !isNaN(this);
		}
		String.prototype.Contains = function(str)
		{
			return this.includes(str);
		}
		Object.defineProperty(String.prototype, 'Length', { get: function() 
			{
				return this.length; 
			} 
		});
		String.IsNullOrEmpty = function(item)
		{
			return item == null || item == undefined || item == "";
		}
		String.IsLetterOrDigit = function(item)
		{
			return item.match("^[A-Za-z0-9]+$");
		}
		String.prototype.IsBool = function()
		{
			return this == "true" || this == "false";
		}
	}
}

//End Common/Utils/Extensions.js

//Start Common/Utils/File.js
if (typeof require !== 'undefined') {
    	var fs = require("fs");
}
Common.File = class File
{
    static Exists(path)
	{
		if(!isset(fs)) return false;
		return fs.existsSync(path);
	}
	static ReadAllText(path, encoding = "utf-8")
	{
		if(!isset(fs)) return "";
		return fs.readFileSync(path, encoding);
	}
	static GetDirName(path)
	{
		let index = path.lastIndexOf("/")
		if(index == -1) index = path.lastIndexOf("\\");
		if(index != -1)
		{
			return path.substr(0, index);
		}
		if(this.Exists(path))
		{
			return "";
		}
		return path;
	}
}
//End Common/Utils/File.js

//Start Common/Utils/KeyValueGroup.js
Common.KeyValueGroup = class KeyValueGroup extends Common.CollectionBase
{
	constructor()
	{
		super();
	}
	GetValue(name)
	{
		for (let i = this.Count - 1; i >= 0; i--)
		{
			let current = this.GetItem(i);
			let id = current.GetIdByName(name);

			if (id == -1) continue;
			return current.GetItem(id);
		}
		return null;
	}
	SetValue(name, value)
	{
		if (this.Count == 0)
		{
			this.Add(new KeyValues());
		}
		this.GetItem(this.Count - 1).Set(name, value);
	}
}
//End Common/Utils/KeyValueGroup.js

//Start Common/Utils/KeyValues.js
Common.KeyValueObject = class KeyValueObject
{
	constructor(name, value)
	{
		this.Name = name;
		this.Value = value;
	}
}
Common.KeyValues = class KeyValues extends Common.CollectionBase
{
	constructor()
	{
		super();
		this.AutoInitialize = true;
	}
	Get(name)
	{
		let id = this.GetIdByName(name);
		if(id == -1) return null;
		return this.inner[id].Value;
	}
	Set(name, value)
	{
		let id = this.GetIdByName(name);
		let kv = null;
		if(id == -1)
		{
			kv = new Common.KeyValueObject();
			kv.Name = name;
			this.Add(kv);
		}
		else
		{
			kv = this.GetItem(id);
		}
		kv.Value = value;
	}
	Delete(name)
	{
		let id = this.GetIdByName(name);
		if(id == -1) return false;
		this.RemoveAt(id);
		return true;
	}
    GetIdByName(name)
    {
        for (let i = 0; i < this.Count; i++)
        {
            if (this.inner[i].Name == name)
            {
                return i;
            }
        }
        return -1;
    }
    ToString()
    {
        return "Total Keys: " + this.Count;
    }
}
//End Common/Utils/KeyValues.js

//Start Common/Utils/MiscFunctions.js
Common.Misc = class Misc
{
	static Init(obj) 
	{
		global["IsIterable"] = function(obj)
		{
			if (obj == null) {
				return false;
			}
		  return typeof obj[Symbol.iterator] === 'function';
		}

	}
}

//End Common/Utils/MiscFunctions.js

//Start Common/Utils/NamedObjects.js
Common.NamedObjects = class NamedObjects
{
	constructor()
	{
		this._keys = [];
		this._values = [];
		this.keysincluded = false;
	}
    First()
    {
        if (this.Count == 0) return null;
        return this._values[0];
    }
    get Count()
    {
		return this._values.Count;
    }
	Get(name)
	{
		return this._values[this.GetIndexByName(name)];
	}
	Set(name, value)
	{
		this.AddObject(key, value);
	}
	GetItem(id)
	{
		if (id < 0 || id > this._values.Count) return null;
		return this._values[id];
	}
	SetItem(id, value)
	{
		if (id < 0 || id > _this.values.Count) return;
		this._values[id] = value;
	}
    GetIndexByName(name)
    {
        if (name == "") return -1;
        return this._keys.indexOf(name);
    }
	AddObject(key, value)
    {
        if (!(key instanceof  String) && value == undefined)
        {
            this._keys.push("");
            this._values.push(key);
        }
        else
        {
            this.keysincluded = true;
            let index = this.GetIndexByName(key);
            if (index == -1)
            {
                this._keys.push(key);
                this._values.push(value);
            }
            else
            {
                this._values[index] = value;
            }
        }
    }
    GetObjects()
    {
        return this._values;
    }
    GetKeys()
    {
        return this._keys;
    }
    ToObject()
    {
        let obj = new Object();
        for (let i = 0; i < this._keys.Count; i++)
        {
            if (this._keys[i] == "") continue;
			obj[this._keys[i]] = this._values[i];
        }
        return obj;
    }
    KeysIncluded()
    {
        return this.keysincluded;
    }
}
//End Common/Utils/NamedObjects.js

//Start Common/Utils/PhpFunctions.js
Common.PhpFunctions = class PhpFunctions
{
	static Init()
	{
		let props = Object.getOwnPropertyNames(Common.PhpFunctions);
		for(let i = 0; i < props.length; i++)
		{
			let prop = props[i];
			if(prop == "Init") continue;
			if(global[prop] != undefined) continue;
			if(Common.PhpFunctions.is_callable(Common.PhpFunctions[prop]))
			{
				global[prop] = Common.PhpFunctions[prop];
			}
		}
	}
	static empty(item)
	{
		if(item instanceof Common.StringBuilder)
		{
			item = item.ToString();
		}
		if(item == null || item == undefined || item == "" || item == 0 || item == false) return true;
		if(is_array(item))
		{
			return item.length == 0;
		}
		return false;
		
	}
	static is_array(item)
	{
		return item instanceof Array;
	}
	static is_object(item)
	{
		return !is_array(item) && item instanceof Object;
	}
	static is_string(item)
	{
		return typeof item == "string";
	}
	static in_array(needle, haystack, strict) {
		var found = false, key, strict = !!strict;
		for (key in haystack) {

			if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) {
				found = true;
				break;
			}
		}
		return found;
	}
	static is_callable(item)
	{
		return item != undefined && !item != null && (typeof item === 'function');
	}
	static is_bool(item)
	{
		return item === false || item === true;
	}
	static isset(item)
	{
		return (typeof item != 'undefined');
	}
}
//End Common/Utils/PhpFunctions.js

//Start Common/Utils/StringBuilder.js
Common.StringBuilder = class StringBuilder
{
	constructor()
	{
		this._inner = "";
	}
	Clear()
	{
		this._inner = "";
	}
	Append(str, count = 0)
	{
		if(count > 1)
		{
			for(let i = 0; i < count; i++)
			{
				this.Append(str);
			}
			return;
		}
		this._inner += str;
	}
	ToString()
	{
		return this._inner;
	}
	get Length()
	{
		return this._inner.length;
	}
}
//End Common/Utils/StringBuilder.js

//Start Common\common_end.js
Common.Init();
if(typeof module != "undefined") module.exports = Common;
//End Common\common_end.js


//End TextEngine\common.js

//Start TextEngine\pardecoder.js
//Start ParDecoder\pd_globals.js
var ParDecoder = new Object();
if(typeof require != "undefined")
{
	if(typeof Common == undefined)
	{
		throw new Error("Common library required for this plugin");
	}
}
//End ParDecoder\pd_globals.js

//Start ParDecoder/PDClass/InnerItem.js
ParDecoder.InnerType  = 
{
    TYPE_STRING: 0,
    TYPE_NUMERIC: 1,
    TYPE_BOOLEAN: 2,
    TYPE_VARIABLE: 3
};
ParDecoder.InnerItem = class InnerItem
{
    constructor()
    {
		this.Value = null;
		this.Quote = '\0';
		this.IsOperator = false;
		this.InnerType = 0;
		this.InnerItems = null;
		this.Parent = null;
    }
    IsGroup()
    {
        return false;
    }
    IsObject()
    {
        return false;
    }
    IsParItem()
    {
        return false;
    }
	IsArray()
    {
        return this.InnerItems != null;
    }
}
//End ParDecoder/PDClass/InnerItem.js

//Start ParDecoder/PDClass/InnerItemsList.js
ParDecoder.InnerItemsList = class InnerItemsList extends Common.CollectionBase
{
    constructor()
    {
		super();
    }
}
//End ParDecoder/PDClass/InnerItemsList.js

//Start ParDecoder/PDClass/ParDecode.js
ParDecoder.ComputeResult = class ComputeResult
{
	constructor()
	{
		this.Result = new Common.NamedObjects();
	}
}
ParDecoder.ParDecode = class ParDecode
{
	constructor(text)
	{
		this.Text = text;
		this.pos = 0;
		this.Items = new ParDecoder.ParItem();
		this.Items.ParName = "(";
		this.Items.BaseDecoder = this;
		this.SurpressError = false;
		this.OnGetFlags = null;
		this.OnSetFlags = null;
		this.flags = 0;
		this.Flags = ParDecoder.PardecodeFlags.PDF_AllowMethodCall | ParDecoder.PardecodeFlags.PDF_AllowSubMemberAccess | ParDecoder.PardecodeFlags.PDF_AllowArrayAccess;
	}
	get Flags()
	{
		if(this.OnGetFlags != null) return this.OnGetFlags.apply();
		return this.flags;
	}
	set Flags(value)
	{
		if (this.OnSetFlags != null && this.OnSetFlags.apply(value)) return;
		this.flags = value;
	}
	get TextLength()
	{
		return this.Text.length;
	}
	Decode()
    {
        let parentItem = this.Items;
        let isopened = false;
        for (let i = 0; i < this.TextLength; i++)
        {
            let cur = this.Text[i];
            let prev = '\0';
            if (i - 1 >= 0)
            {
                prev = this.Text[i - 1];
            }
            if (false && (prev != ')' && prev != ']' && prev != '}') && (cur == '=' || cur == '>' || cur == '<' || cur == '?' || cur == ':'))
            {
                if (isopened)
                {
                    let item = new ParDecoder.InnerItem();
                    item.IsOperator = true;
                    if ((prev == '>' && cur == '=') || (prev == '<' && cur == '=') || (prev == '!' && cur == '=') || (prev == '=' && cur == '>'))
                    {
                        item.Value = prev + cur;
                    }
                    else

                    {
                        item.Value = cur;
                    }
                    parentItem = parentItem.Parent;
                    isopened = false;
                    parentItem.InnerItems.Add(item);
                    i--;

                }
                else
                {
                    let item = new ParDecoder.ParItem();
					item.Parent = parentItem,
					item.ParName = "(",
					item.BaseDecoder = this
                    parentItem.InnerItems.Add(item);
                    parentItem = item;
                    isopened = true;
                }
                continue;
            }
            if (cur == '(' || cur == '[' || cur == '{')
            {
                if (isopened)
                {
                    //isopened = false;   
                }
                let item = new ParDecoder.ParItem();
				item.Parent = parentItem;
				item.ParName = cur;
				item.BaseDecoder = this;
                parentItem.InnerItems.Add(item);
                parentItem = item;
                continue;
            }
            else if (cur == ')' || cur == ']' || cur == '}')
            {
                parentItem = parentItem.Parent;
                if (parentItem == null)
                {
                    if (this.SurpressError)
                    {
                        parentItem = this.Items;
                        continue;
                    }
                    throw new Error("Syntax Error");
                }
                continue;
            }
            let result = this.DecodeText(i, isopened);
            parentItem.InnerItems.AddRange(result);
            i = this.pos;
        }
    }
    DecodeText(start, autopar = false)
    {
        let inspec = false;
        let inquot = false;
        let qutochar = '\0';
        let innerItems = new ParDecoder.InnerItemsList();
        let value = new Common.StringBuilder();
        for (let i = start; i < this.TextLength; i++)
        {
            let cur = this.Text[i];
            let next = '\0';
            if (i + 1 < this.TextLength)
            {
                next = this.Text[i + 1];
            }
            if (inspec)
            {
                value.Append(cur);
                inspec = false;
                continue;
            }
            if (cur == '\\')
            {
                inspec = true;
                continue;
            }
            if (!inquot)
            {
                if (cur == ' ' || cur == '\t')
                {
                    continue;
                }
                if (cur == '\'' || cur == '\"')
                {
                    inquot = true;
                    qutochar = cur;
                    continue;
                }
                if (cur == '+' || cur == '-' || cur == '*' ||
                cur == '/' || cur == '%' || cur == '!' ||
                cur == '=' || cur == '&' || cur == '|' ||
                cur == ')' || cur == '(' || cur == ',' ||
                cur == '[' || cur == ']' || cur == '^' ||
                cur == '<' || cur == '>' || cur == '{' ||
                cur == '}' || (cur == ':' && next != ':') || cur == '?' || cur == '.')
                {
                    if (value.Length > 0)
                    {
                        innerItems.Add(this.Inner(value.ToString(), qutochar));
                        value.Clear();
                    }
                    if (cur == '[' || cur == '(' || cur == '{')
                    {

                        this.pos = i - 1;
                        return innerItems;
                    }
                    if (autopar && (cur == '?' || cur == ':' || cur == '=' || cur == '<' || cur == '>' || (cur == '!' && next == '=')))
                    {

                        if ((cur == '=' && next == '>') || (cur == '!' && next == '=') || (cur == '>' && next == '=') || (cur == '<' && next == '='))
                        {
                            this.pos = i;
                        }
                        else
                        {
                            this.pos = i;
                        }
                        return innerItems;
                    }

                    if (cur != '(' && cur != ')' && cur != '[' && cur != ']' && cur != '{' && cur != '}')
                    {
                        let inner2 = new ParDecoder.InnerItem();
						inner2.IsOperator = true;
                        if ((cur == '=' && next == '>') || (cur == '!' && next == '=') || (cur == '>' && next == '=') || (cur == '<' && next == '='))
                        {
                            inner2.Value = cur + next;
                            i++;
                        }
                        else if ((cur == '=' || cur == '&' || cur == '|') && cur == next)
                        {
                            inner2.Value = cur + next;
                            i++;
                        }
                        else
                        {
                            inner2.Value = cur;
                        }
                        let valuestr = inner2.Value;
                        innerItems.Add(inner2);
                        qutochar = '\0';
                        if (valuestr == "=" || valuestr == "<=" || valuestr == ">=" || valuestr == "<" || valuestr == ">" || valuestr == "!=" || valuestr == "==")
                        {
                            this.pos = i;
                            return innerItems;
                        }

                    }
                    else
                    {
                        this.pos = i - 1;
                        return innerItems;
                    }
                    continue;
                }
            }
            else
            {
                if (cur == qutochar)
                {
                    inquot = false;
                    continue;
                }
            }

            if (cur == ':' && next == ':')
            {
                value.Append(':');
                i++;
            }
            value.Append(cur);

        }
        if (value.Length > 0)
        {
            innerItems.Add(this.Inner(value.ToString(), qutochar));
        }
        this.pos = this.TextLength;

        return innerItems;
    }
    Inner(current, quotchar)
    {
		let inner = new ParDecoder.InnerItem();
		inner.Value = current,
		inner.Quote = quotchar,
		inner.InnerType = ParDecoder.InnerType.TYPE_STRING
        if (inner.Quote != '\'' && inner.Quote != '"')
        {
            if (current == "true" || current == "false")
            {
                inner.InnerType = ParDecoder.InnerType.TYPE_BOOLEAN;
                if (current == "true")
                {
                    inner.Value = true;
                }
                else
                {
                    inner.Value = false;
                }
            }

            else if ((inner.Quote != '\'' && inner.Quote != '"') && current.IsNumeric())
            {
                inner.InnerType = ParDecoder.InnerType.TYPE_NUMERIC;
                inner.Value = parseFloat(current);
            }
            else
            {
                inner.InnerType = ParDecoder.InnerType.TYPE_VARIABLE;
            }
        }
        return inner;
    }
}
//End ParDecoder/PDClass/ParDecode.js

//Start ParDecoder/PDClass/ParFormat.js
ParDecoder.ParFormat = class ParFormat
{
	constructor(text = undefined)
	{
		if(text != undefined)
		{
			this._text = text;
		}
		else
		{
			this._text = "";
		}
		this.FormatItems = null;
		this.SurpressError = false;
		this.Flags = ParDecoder.PardecodeFlags.PDF_AllowMethodCall | ParDecoder.PardecodeFlags.PDF_AllowSubMemberAccess | ParDecoder.PardecodeFlags.PDF_AllowArrayAccess;
	}
	get Text()
	{
		return this._text;
	}
	set Text(value)
	{
		this._text = value;
		this.FormatItems = null;
	}
    Apply(data = null)
    {
        if (String.IsNullOrEmpty(this.Text)) return this.Text;
        if (this.FormatItems == null)
        {
            this.ParseFromString(this.Text);
        }
        let text = new Common.StringBuilder();
        for (let i = 0; i < this.FormatItems.Count; i++)
        {
            let item = this.FormatItems.GetItem(i);
            if (item.ItemType == ParDecoder.ParFormatType.TextPar)
            {
                text.Append(item.ItemText);
                continue;
            }
            else if (item.ItemType == ParDecoder.ParFormatType.FormatPar)
            {
                if (item.ParData == null)
                {
                    item.ParData = new ParDecoder.ParDecode(item.ItemText);
					item.ParData.OnGetFlags = function() {return this.Flags};
                    item.ParData.Decode();
                    item.ParData.SurpressError = this.SurpressError;
                }
                let cr = item.ParData.Items.Compute(data);
                text.Append(cr.Result.First());
            }
        }
        return text.ToString();
    }
    static Format(s, data = null)
    {
        let pf = new ParFormat(s);
        return pf.Apply(data);
    }
    ParseFromString(s)
    {
        this.FormatItems = new Common.CollectionBase();
        let text = new Common.StringBuilder();
        let inpar = false;
        for (let i = 0; i < s.Length; i++)
        {
            let cur = s[i];
            let next = '\0';
            if (i + 1 < s.Length) next = s[i + 1];
            if (!inpar)
            {
                if (cur == '{' && next == '{')
                {
                    i++;
                    text.Append(cur);
                    continue;
                }
                if (cur == '{' && next == '%')
                {
                    i += 1;
                    if (text.Length > 0)
                    {
						let formatItem = new ParDecoder.ParFormatItem();
						formatItem.ItemText = text.ToString();
						formatItem.ItemType = ParDecoder.ParFormatType.TextPar;
                        this.FormatItems.Add(formatItem);
                        text.Clear();
                    }
                    inpar = true;
                    continue;
                }
            }
            else
            {
                if (cur == '{')
                {
                    if (this.SurpressError)
                    {
                        continue;
                    }
                    throw new Error("Syntax Error: Unexpected {");
                }
                if (cur == '}')
                {
                    if (text.Length > 0)
                    {
						let formatItem = new ParDecoder.ParFormatItem();
						formatItem.ItemText = text.ToString();
						formatItem.ItemType = ParDecoder.ParFormatType.FormatPar;
                        this.FormatItems.Add(formatItem);
                        text.Clear();
                    }
                    inpar = false;
                    continue;
                }
            }
            text.Append(cur);
        }
        if (text.Length > 0)
        {

			let formatItem = new ParDecoder.ParFormatItem();
			formatItem.ItemText = text.ToString();
			formatItem.ItemType = (inpar) ? ParDecoder.ParFormatType.FormatPar : ParDecoder.ParFormatType.TextPar;
			this.FormatItems.Add(formatItem);		
        }
    }

}
//End ParDecoder/PDClass/ParFormat.js

//Start ParDecoder/PDClass/ParFormatItem.js
ParDecoder.ParFormatType =
{
	TextPar: 0,
	FormatPar: 1
};
ParDecoder.ParFormatItem = class ParFormatItem
{
	constructor()
	{
		this.ItemType = 0;
		this._itemText = "";
		this.ParData = null;
	}
	get ItemText()
	{
		return this._itemText;
	}
	set ItemText(value)
	{
		this._itemText = value;
		this.ParData = null;
	}
}
//End ParDecoder/PDClass/ParFormatItem.js

//Start ParDecoder/PDClass/ParItem.js
ParDecoder.ParItem = class ParItem extends ParDecoder.InnerItem
{
	constructor()
	{
		super();
		this.InnerItems = new ParDecoder.InnerItemsList();
		this.ParName = "";
		this.BaseDecoder = null;
	}
    IsParItem()
    {
        return true;
    }
    IsObject()
    {
        return this.ParName == "{";
    }
    IsArray(exobject = undefined)
    {
		if(exobject == undefined)
		{
			return this.ParName == "[";
		}
        return !is_array(exobject) && this.ParName == "[";
    }
    GetParentUntil(name)
    {
        let parent = this.Parent;
        while (parent != null)
        {
			if(!(parent instanceof ParItem))
			{
				parent = this.Parent;
				continue;
			}
            if (parent.ParName == name) break;
            parent = parent.Parent;
        }
        return parent;
    }
    Compute(vars = null, sender = null, localvars = null)
    {
        let cr = new ParDecoder.ComputeResult();
        let lastvalue = null;
        let xoperator = null;
        let previtem = null;
        let waititem = null;
        let waititem2 = null;
        let waitop = "";
        let waitvalue = null;
        let waitop2 = "";
        let waitvalue2 = null;
        let waitkey = "";
        let unlemused = false;
        let stopdoubledot = false;
		let minuscount = 0;
        if (this.IsObject())
        {
            cr.Result.AddObject(new Object());
        }
        for (let i = 0; i < this.InnerItems.Count; i++)
        {
            let currentitemvalue = null;
            let current = this.InnerItems.GetItem(i);
            let paritem = null;
            if (current.IsParItem())
            {
                paritem = current;
            }
            if (stopdoubledot)
            {
                if (current.IsOperator && current.Value == ":")
                {
                    break;
                }
            }
            let next = null;
            let nextop = "";
            if (i + 1 < this.InnerItems.Count) next = this.InnerItems.GetItem(i + 1);
            if (next != null && next.IsOperator)
            {
                nextop = next.Value;
            }
            if (current.IsParItem())
            {
                let subresult = paritem.Compute(vars, this, localvars);
                let prevvalue = "";
                let previsvar = false;
                if (previtem != null && !previtem.IsOperator && previtem.Value != null)
                {
                    previsvar = previtem.InnerType == ParDecoder.InnerType.TYPE_VARIABLE;
                    prevvalue = previtem.Value;

                }
                let varnew = null;
                if (lastvalue != null)
                {
                    varnew = lastvalue;
                }
                else
                {
                    varnew = vars;
                }
                if (prevvalue != "")
                {

                    if (paritem.ParName == "(")
                    {
						if(this.BaseDecoder.Flags & ParDecoder.PardecodeFlags.PDF_AllowMethodCall)
						{
							if (paritem.BaseDecoder != null && paritem.BaseDecoder.SurpressError)
							{
								try
								{
									currentitemvalue = Common.ComputeActions.CallMethod(prevvalue, subresult.Result.GetObjects(), varnew, localvars);
								}
								catch
								{

									currentitemvalue = null;
								}
							}
							else
							{
								currentitemvalue = Common.ComputeActions.CallMethod(prevvalue, subresult.Result.GetObjects(), varnew, localvars);
							}
						}
						else
						{
							//currentitemvalue = null;
						}

                    }
                    else if (paritem.ParName == "[")
                    {
						if(this.BaseDecoder.Flags & ParDecoder.PardecodeFlags.PDF_AllowArrayAccess)
						{
							let prop = Common.ComputeActions.GetProp(prevvalue, varnew);
							if (prop != null)
							{
								if (is_array(prop))
								{
									let indis = parseInt(subresult.Result.GetItem(0));
									currentitemvalue = prop[indis];
								}
								else if(is_string(prop))
								{

									let indis = parseInt(subresult.Result.GetItem(0));
									currentitemvalue = prop[indis];
								}
								else
								{
									//currentitemvalue = prop;
								}
							}
						}
						else
						{
							//currentitemvalue = null;
						}

                    }
                }
                else
                {
                    if (paritem.ParName == "(")
                    {
                        currentitemvalue = subresult.Result.GetItem(0);
                    }
                    else if (paritem.ParName == "[")
                    {
                        if (subresult.Result.KeysIncluded())
                        {
                            currentitemvalue = subresult.Result.GetObjects();
                        }
                        else
                        {
                            currentitemvalue = subresult.Result.GetObjects();
                        }

                    }
                    else if (paritem.ParName == "{")
                    {
                        currentitemvalue = subresult.Result.First();
                    }
                }

            }
            else
            {
                if (!current.IsOperator && current.InnerType == ParDecoder.InnerType.TYPE_VARIABLE && next != null && next.IsParItem())
                {
                    currentitemvalue = null;
                }
                else
                {
					if(previtem != null && previtem.IsOperator)
					{
						if(current.Value == "+")
						{
							continue;
						}
						else if (current.Value == "-")
						{
							minuscount++;
							continue;
						}
					}
                    currentitemvalue = current.Value;

                }

                if (current.InnerType == ParDecoder.InnerType.TYPE_VARIABLE && (next == null || !next.IsParItem()) && (xoperator == null || xoperator.Value != "."))
                {
					
                    if (currentitemvalue === null || currentitemvalue === "null")
                    {
                        currentitemvalue = null;
                    }
                    else if (currentitemvalue == "false")
                    {
                        currentitemvalue = false;
                    }
                    else if (currentitemvalue == "true")
                    {
                        currentitemvalue = true;
                    }
                    else if (!this.IsObject())
                    {
                        currentitemvalue = Common.ComputeActions.GetPropValue(current, vars, localvars);
                    }
                }
								
            }

            if (unlemused)
            {
                currentitemvalue = empty(currentitemvalue);
                unlemused = false;
            }
            if (current.IsOperator)
            {
                if (current.Value == "!")
                {
                    unlemused = !unlemused;
                    previtem = current;
                    continue;
                }
                if ((this.IsParItem() && current.Value == ",") || (this.IsArray() && current.Value == "=>" && (waitvalue == null || waitvalue == "")) || (this.IsObject() && current.Value == ":" && (waitvalue == null || waitvalue == "")))
                {
                    if (waitop2 != "")
                    {
						if(minuscount % 2 == 1) lastvalue = ComputeActions.OperatorResult(lastvalue, -1, "*");
						minuscount = 0;
                        lastvalue = Common.ComputeActions.OperatorResult(waitvalue2, lastvalue, waitop2);
                        waitvalue2 = null;
                        waitop2 = "";
                    }
                    if (waitop != "")
                    {
						if(minuscount % 2 == 1) lastvalue = ComputeActions.OperatorResult(lastvalue, -1, "*");
						minuscount = 0;
                        lastvalue = Common.ComputeActions.OperatorResult(waitvalue, lastvalue, waitop);
                        waitvalue = null;
                        waitop = "";
                    }
                    if (current.Value == ",")
                    {
                        if (this.IsObject())
                        {
							cr.Result.First()[waitkey] = lastvalue;
                        }
                        else
                        {
                            cr.Result.AddObject(waitkey, lastvalue);
                        }

                        waitkey = "";


                    }
                    else
                    {
                        waitkey = lastvalue;
                    }
                    lastvalue = null;
                    xoperator = null;
                    previtem = current;
                    continue;
                }
                let opstr = current.Value;
                if (opstr == "||" || /*opstr == "|" || */ opstr == "or" || opstr == "&&" || /*opstr == "&" ||*/ opstr == "and" || opstr == "?")
                {
                    if (waitop2 != "")
                    {
						if(minuscount % 2 == 1) lastvalue = ComputeActions.OperatorResult(lastvalue, -1, "*");
						minuscount = 0;
                        lastvalue = Common.ComputeActions.OperatorResult(waitvalue2, lastvalue, waitop2);
                        waitvalue2 = null;
                        waitop2 = "";
                    }
                    if (waitop != "")
                    {
						if(minuscount % 2 == 1) lastvalue = ComputeActions.OperatorResult(lastvalue, -1, "*");
						minuscount = 0;
                        lastvalue = Common.ComputeActions.OperatorResult(waitvalue, lastvalue, waitop);
                        waitvalue = null;
                        waitop = "";
                    }

                    let state = !empty(lastvalue);
                    xoperator = null;
                    if (opstr == "?")
                    {
                        if (state)
                        {
                            stopdoubledot = true;
                        }
                        else
                        {
                            for (let j = i + 1; j < this.InnerItems.Count; j++)
                            {
                                let item = this.InnerItems[j];
                                if (item.IsOperator && item.Value == ":")
                                {
                                    i = j;
                                    break;
                                }
                            }
                        }
                        lastvalue = null;
                        previtem = current;
                        continue;


                    }
                    if (opstr == "||" || /*opstr == "|" || */opstr == "or")
                    {
                        if (state)
                        {
                            lastvalue = true;
                            /*if (opstr != "|")
                            {*/
                                if (this.IsObject())
                                {
                                    cr.Result.First()[waitkey] = true;
                                }
                                else
                                {
                                    cr.Result.AddObject(waitkey, true);
                                }
                                return cr;
                            //}
                        }
                        else
                        {
                            lastvalue = false;
                        }
                    }
                    else
                    {
                        if (!state)
                        {
                            lastvalue = false;
                            /*if (opstr != "&")
                            {*/
                                if (this.IsObject())
                                {
									cr.Result.First()[waitkey] = false;
                                }
                                else
                                {
                                    cr.Result.AddObject(waitkey, false);
                                }
                                return cr;
                            //}
                        }
                        else
                        {
                            lastvalue = true;
                        }
                    }
                    xoperator = null;
                }
                else
                {
                    xoperator = current;
                }

                previtem = current;
                continue;
            }
            else
            {

                if (xoperator != null)
                {
                    if (Common.ComputeActions.PriotiryStop.Contains(xoperator.Value))
                    {
                        if (waitop2 != "")
                        {
							if(minuscount % 2 == 1) lastvalue = ComputeActions.OperatorResult(lastvalue, -1, "*");
							minuscount = 0;
                            lastvalue = Common.ComputeActions.OperatorResult(waitvalue2, lastvalue, waitop2);
                            waitvalue2 = null;
                            waitop2 = "";
                        }
                        if (waitop != "")
                        {
							if(minuscount % 2 == 1) lastvalue = ComputeActions.OperatorResult(lastvalue, -1, "*");
							minuscount = 0;
                            lastvalue = Common.ComputeActions.OperatorResult(waitvalue, lastvalue, waitop);
                            waitvalue = null;
                            waitop = "";
                        }
                    }

                    if (next != null && next.IsParItem())
                    {
                        if (xoperator.Value == ".")
                        {
                            if (currentitemvalue != null && !String.IsNullOrEmpty(currentitemvalue))
                            {
                                lastvalue = Common.ComputeActions.GetProp(currentitemvalue, lastvalue);
                            }
                        }
                        else
                        {
                            if (waitop == "")
                            {
                                waitop = xoperator.Value;
                                waititem = current;
                                waitvalue = lastvalue;
                            }
                            else if (waitop2 == "")
                            {
                                waitop2 = xoperator.Value;
                                waititem2 = current;
                                waitvalue2 = lastvalue;
                            }
                            lastvalue = null;
                        }
                        xoperator = null;
                        previtem = current;
                        continue;
                    }
                    if (xoperator.Value == ".")
                    {
						if(this.BaseDecoder.Flags & ParDecoder.PardecodeFlags.PDF_AllowSubMemberAccess)
						{
							lastvalue = Common.ComputeActions.GetProp(currentitemvalue, lastvalue);
						}
						else
						{
							//lastvalue = null;
						}

                    }
                    else if (nextop != "." && ((xoperator.Value != "+" && xoperator.Value != "-") || nextop == "" || (Common.ComputeActions.PriotiryStop.Contains(nextop))))
                    {
						if(minuscount % 2 == 1) currentitemvalue = ComputeActions.OperatorResult(currentitemvalue, -1, "*");
						minuscount = 0;
                        let opresult = Common.ComputeActions.OperatorResult(lastvalue, currentitemvalue, xoperator.Value);
                        lastvalue = opresult;
                    }
                    else
                    {
                        if (waitop == "")
                        {
                            waitop = xoperator.Value;
                            waititem = current;
                            waitvalue = lastvalue;
                            lastvalue = currentitemvalue;
                        }
                        else if (waitop2 == "")
                        {
                            waitop2 = xoperator.Value;
                            waititem2 = current;
                            waitvalue2 = lastvalue;
                            lastvalue = currentitemvalue;
                        }

                        continue;
                    }
                }
                else
                {
                    lastvalue = currentitemvalue;
                }
            }
            previtem = current;
        }
        if (waitop2 != "")
        {
			if(minuscount % 2 == 1) lastvalue = ComputeActions.OperatorResult(lastvalue, -1, "*");
			minuscount = 0;
            lastvalue = Common.ComputeActions.OperatorResult(waitvalue2, lastvalue, waitop2);
            waitvalue2 = null;
            waitop2 = "";
        }
        if (waitop != "")
        {
			if(minuscount % 2 == 1) lastvalue = ComputeActions.OperatorResult(lastvalue, -1, "*");
			minuscount = 0;
            lastvalue = Common.ComputeActions.OperatorResult(waitvalue, lastvalue, waitop);
            waitvalue = null;
            waitop = "";
        }

        if (this.IsObject())
        {
            cr.Result.First()[waitkey] = lastvalue;
        }
        else
        {
            cr.Result.AddObject(waitkey, lastvalue);
        }
        return cr;
    }
}
//End ParDecoder/PDClass/ParItem.js

//Start ParDecoder/PDClass/PardecodeFlags.js
ParDecoder.PardecodeFlags =  {
	PDF_Default: 0,
	PDF_AllowMethodCall: 1,
	PDF_AllowSubMemberAccess: 2,
	PDF_AllowArrayAccess: 3
}

//End ParDecoder/PDClass/PardecodeFlags.js

//Start ParDecoder\pd_end.js
if(typeof module != "undefined") module.exports = ParDecoder;
//End ParDecoder\pd_end.js


//End TextEngine\pardecoder.js

//Start TextEngine\te_globals.js
//Name Spaces
var TextEngine = new Object();
TextEngine.Evulator = new Object();
TextEngine.XPathClasses = new Object();
TextEngine.Utils = new Object();
if(typeof require != "undefined")
{
	if(typeof Common == undefined)
	{
		throw new Error("Common library required for this plugin");
	}
	if(typeof ParDecoder == undefined)
	{
		throw new Error("ParDecoder library required for this plugin.");
	}
}
//End TextEngine\te_globals.js

//Start TextEngine/Evulator/BaseEvulator.js
/* 
* @abstract 
*/
TextEngine.Evulator.BaseEvulator = class BaseEvulator
{
	constructor()
	{
		this.localVars = null;
		this.Evulator = null;
	}
    Render(tag, vars) {}
    RenderFinish(tag, vars, latestResult) { }
    EvulatePar(pardecoder, additionalparams = null)
    {
        if (pardecoder.SurpressError != this.Evulator.SurpressError)
        {
            pardecoder.SurpressError = this.Evulator.SurpressError;
        }
		let addpar = undefined;
		if(additionalparams instanceof Common.KeyValues)
		{
			addpar = additionalparams;
			this.Evulator.LocalVariables.Add(addpar);
		}
        let er = pardecoder.Items.Compute(this.Evulator.GlobalParameters, null, this.Evulator.LocalVariables);
        if (addpar != undefined)
        {
            this.Evulator.LocalVariables.Remove(addpar);
        }
        return er.Result.First();
    }
    EvulateText(text, additionalparams = null)
    {
        let pardecoder = new ParDecoder.ParDecode(text);
        pardecoder.Decode();
        return this.EvulatePar(pardecoder, additionalparams);
    }
    SetEvulator(evulator)
    {
        this.Evulator = evulator;
    }
    EvulateAttribute(attribute, additionalparams = null)
    {
        if (attribute == null || String.IsNullOrEmpty(attribute.Value)) return null;
        if (attribute.ParData == null)
        {
            attribute.ParData = new ParDecoder.ParDecode(attribute.Value);
            attribute.ParData.Decode();
        }
        return this.EvulatePar(attribute.ParData, additionalparams);

    }
    ConditionSuccess(tag, attr = "c")
    {
        let pardecoder = null;
        if (tag.NoAttrib)
        {
            if (tag.Value == null) return true;

            pardecoder = tag.ParData;
            if (pardecoder == null)
            {
                pardecoder = new ParDecoder.ParDecode(tag.Value);
                pardecoder.Decode();
                tag.ParData = pardecoder;
            }
        }
        else
        {
            let cAttr = tag.ElemAttr[attr];
            if (cAttr == null || cAttr.Value == null) return true;
            pardecoder = cAttr.ParData;
            if (pardecoder == null)
            {
                pardecoder = new ParDecoder.ParDecode(tag.Value);
                pardecoder.Text = cAttr.Value;
                pardecoder.Decode();
                cAttr.ParData = pardecoder;
            }

        }
        let res = this.EvulatePar(pardecoder);
		if(res === true || res === false) return res;
        return !empty(res);
    }
    CreateLocals()
    {
        if (this.localVars != null) return;
        this.localVars = new Common.KeyValues();
        this.Evulator.LocalVariables.Add(this.localVars);
    }
    DestroyLocals()
    {
        if (this.localVars == null) return;
        this.Evulator.LocalVariables.Remove(this.localVars);
        this.localVars = null;
    }
    SetLocal(name, value)
    {
        this.localVars.Set(name, value);
    }
    GetLocal(name)
    {
        return this.localVars[name];
    }
	SetKeyValue(name, value)
	{
		this.Evulator.DefineParameters.Set(name, value);
	}
	UnsetKey($name)
	{
		this.Evulator.DefineParameters.Delete(name);
	}
}
//End TextEngine/Evulator/BaseEvulator.js

//Start TextEngine/Evulator/BreakEvulator.js
TextEngine.Evulator.BreakEvulator = class BreakEvulator extends TextEngine.Evulator.BaseEvulator
{
	constructor()
	{
		super();
	}
    Render(tag, vars)
    {
		let result = new TextEngine.TextEvulateResult();
		result.Result = TextEngine.TextEvulateResultEnum.EVULATE_BREAK;
        return result;
    }
}
//End TextEngine/Evulator/BreakEvulator.js

//Start TextEngine/Evulator/CmEvulator.js
TextEngine.Evulator.CallMacroEvulator = class CallMacroEvulator extends TextEngine.Evulator.BaseEvulator
{
	constructor()
	{
		super();
	}
    Render(tag, vars)
    {

		if(tag.ElemAttr.FirstAttribute == null || String.IsNullOrEmpty(tag.ElemAttr.FirstAttribute.Name)) return null;
        let name = tag.ElemAttr.FirstAttribute.Name;
        let cr = this.ConditionSuccess(tag, "if");
        if (!cr) return null;
        if (String.IsNullOrEmpty(name)) return null;
        let element = this.GetMacroElement(name);
        if (element != null)
        {
            let newelement = new Common.KeyValues();
            for (let i = 0; i < element.ElemAttr.Count; i++)
            {
				let elem = element.ElemAttr.GetItem(i);
                if (elem.Name == "name") continue;
                newelement.Set(elem.Name, this.EvulateAttribute(elem, vars));
            }
            for (let i = 1; i < tag.ElemAttr.Count; i++)
            {
                let key = tag.ElemAttr.GetItem(i);
                newelement.Set(key.Name, this.EvulateAttribute(key, vars));
            }
            let result = element.EvulateValue(0, 0, newelement);
            return result;
        }
        return null;
    }
    GetMacroElement(name)
    {
        return this.Evulator.SavedMacrosList.GetMacro(name);
    }
}
//End TextEngine/Evulator/CmEvulator.js

//Start TextEngine/Evulator/ContinueEvulator.js
TextEngine.Evulator.ContinueEvulator = class ContinueEvulator extends TextEngine.Evulator.BaseEvulator
{
	constructor()
	{
		super();
	}
    Render(tag, vars)
    {
		let cr = this.ConditionSuccess(tag, "if");
		if (!cr) return null;
		let result = new TextEngine.TextEvulateResult();
		result.Result = TextEngine.TextEvulateResultEnum.EVULATE_CONTINUE;
        return result;
    }
}
//End TextEngine/Evulator/ContinueEvulator.js

//Start TextEngine/Evulator/DoEvulator.js
TextEngine.Evulator.DoEvulator = class DoEvulator extends TextEngine.Evulator.BaseEvulator
{
	constructor()
	{
		super();
	}
    Render(tag, vars)
    {
		if ((tag.NoAttrib && String.IsNullOrEmpty(tag.Value)) || (!tag.NoAttrib && String.IsNullOrEmpty(tag.GetAttribute("c")))) return null;
		this.CreateLocals();
		let loop_count = 0;
		let result = new TextEngine.TextEvulateResult();
		result.Result = TextEngine.TextEvulateResultEnum.EVULATE_TEXT;
		do
		{
			this.SetLocal("loop_count", loop_count++);
			let cresult = tag.EvulateValue(0, 0, vars);
			if (cresult == null) continue;
			result.TextContent += cresult.TextContent;
			if (cresult.Result == TextEngine.TextEvulateResultEnum.EVULATE_RETURN)
			{
				result.Result = TextEngine.TextEvulateResultEnum.EVULATE_RETURN;
				this.DestroyLocals();
				return result;
			}
			else if (cresult.Result == TextEngine.TextEvulateResultEnum.EVULATE_BREAK)
			{
				break;
			}
		} while (this.ConditionSuccess(tag));
		this.DestroyLocals();
		return result;
    }
}
//End TextEngine/Evulator/DoEvulator.js

//Start TextEngine/Evulator/EvulatorHandler.js
TextEngine.Evulator.EvulatorHandler = class EvulatorHandler
{
    OnRenderPre(tag, vars) { return true; }
    OnRenderPost(tag, vars, result) { }
    OnRenderFinishPre(tag, vars, result) { return true; }
	OnRenderFinishPost(tag, vars, result) { }
}
//End TextEngine/Evulator/EvulatorHandler.js

//Start TextEngine/Evulator/ForEvulator.js
TextEngine.Evulator.ForEvulator = class ForEvulator extends TextEngine.Evulator.BaseEvulator
{
	constructor()
	{
		super();
	}
	Render(tag, vars)
    {
        let varname = tag.GetAttribute("var");
        let startAttr = tag.ElemAttr.Get("start");
        let start = (startAttr == null) ? 0 : startAttr.Value;
        let stepAttr = tag.ElemAttr.Get("step");
        let step = (stepAttr == null) ? 0 : stepAttr.Value;
        if (String.IsNullOrEmpty(start))
        {
            start = "0";
        }
        if (step == null || step == "0")
        {
            step = "1";
        }
        let toAttr = tag.ElemAttr.Get("to");
        if (String.IsNullOrEmpty(varname) && String.IsNullOrEmpty(step) && (toAttr == null || String.IsNullOrEmpty(toAttr.Value)))
        {
            return null;
        }
        let startres = null;
        if (startAttr != null)
        {
            if (startAttr.ParData == null)
            {
                startAttr.ParData = new ParDecoder.ParDecode(start);
                startAttr.ParData.Decode();
            }
            startres = this.EvulatePar(startAttr.ParData);
        }
        else
        {
            startres = 0;
        }
        let stepres = null;
        if (stepAttr != null)
        {
            if (stepAttr.ParData == null)
            {
                stepAttr.ParData = new ParDecoder.ParDecode(step);
                stepAttr.ParData.Decode();
            }
            stepres = this.EvulatePar(stepAttr.ParData);
        }
        else
        {
            stepres = 1;
        }
        let startnum = 0;
        let stepnum = 0;
        let tonum = 0;
		
        if (isNaN(stepres))
        {
            stepnum = 1;
        }
        else
        {
			stepnum = parseInt(stepres);
        }
        if (!isNaN(startres))
        {
            startnum = parseInt(startres);
        }

        let tores = this.EvulateAttribute(toAttr);
        if (isNaN(tores))
        {
            return null;
        }
        tonum = parseInt(tores);
        let result = new TextEngine.TextEvulateResult();
        this.CreateLocals();
        for (let i = startnum; i < tonum; i += stepnum)
        {

            this.SetLocal(varname, i);
            let cresult = tag.EvulateValue(0, 0, vars);
            if (cresult == null) continue;
            result.TextContent += cresult.TextContent;
            if (cresult.Result == TextEngine.TextEvulateResultEnum.EVULATE_RETURN)
            {
                result.Result = TextEngine.TextEvulateResultEnum.EVULATE_RETURN;
                this.DestroyLocals();
                return result;
            }
            else if (cresult.Result == TextEngine.TextEvulateResultEnum.EVULATE_BREAK)
            {
                break;
            }
        }
        this.DestroyLocals();
        result.Result = TextEngine.TextEvulateResultEnum.EVULATE_TEXT;
        return result;
    }
}
//End TextEngine/Evulator/ForEvulator.js

//Start TextEngine/Evulator/ForeachEvulator.js
TextEngine.Evulator.ForeachEvulator = class ForeachEvulator extends TextEngine.Evulator.BaseEvulator
{
	constructor()
	{
		super();
	}
	Render(tag, vars)
	{
		let varname = tag.GetAttribute("var");
		let list = this.EvulateAttribute(tag.ElemAttr.Get("in"));
		let skipFunction = tag.GetAttribute("skipfunction", false);
		let isOf = tag.ElemAttr.HasAttribute("of");
		if(!IsIterable(list)) return null;
		let isArray = is_array(list);
		let targCount = -1;
		if(isArray)
		{
			targCount = Object.keys(list).length;
		}
		this.CreateLocals();
		let result = new TextEngine.TextEvulateResult();
		let total = 0;
		let RES_RETURN = TextEngine.TextEvulateResultEnum.EVULATE_RETURN;
		let RES_BREAK = TextEngine.TextEvulateResultEnum.EVULATE_BREAK;
		let RES_NONE = 0;
		let iteratecur = function(item, sender)
		{
			if(skipFunction && is_callable(list[item])) return RES_NONE;
			this.SetLocal("loop_count", total++);
			this.SetLocal("loop_key", item);
			this.SetLocal(varname, list[item]);
			
			let cresult = tag.EvulateValue(0, 0, vars);
			if (cresult == null) return RES_NONE;
			result.TextContent += cresult.TextContent;
			if (cresult.Result == TextEngine.TextEvulateResultEnum.EVULATE_RETURN)
			{
				return RES_RETURN;
			}
			else if (cresult.Result == TextEngine.TextEvulateResultEnum.EVULATE_BREAK)
			{
				return RES_BREAK;
			}
			if(targCount >= 0 && total >= targCount) return RES_BREAK;
			return RES_NONE;
		}
		if(isOf)
		{
			for (let item of list)
			{
				let vresult = iteratecur.apply(this, [item]);
				if(vresult == RES_BREAK) break;
				if(vresult == RES_RETURN) 
				{
					this.DestroyLocals();
					return result;
				}
			}
		}
		else
		{
			for (let item in list)
			{
				let vresult = iteratecur.apply(this, [item]);
				if(vresult == RES_BREAK) break;
				if(vresult == RES_RETURN) 
				{
					this.DestroyLocals();
					return result;
				}
			}
		}

		this.DestroyLocals();
		result.Result = TextEngine.TextEvulateResultEnum.EVULATE_TEXT;
		return result;
	}
}
//End TextEngine/Evulator/ForeachEvulator.js

//Start TextEngine/Evulator/GeneralEvulator.js
TextEngine.Evulator.GeneralEvulator = class GeneralEvulator extends TextEngine.Evulator.BaseEvulator
{
	constructor()
	{
		super();
	}
    Render(tag, vars)
    {
		let result = new TextEngine.TextEvulateResult();
		result.Result = TextEngine.TextEvulateResultEnum.EVULATE_DEPTHSCAN;
        return result;
    }
}
//End TextEngine/Evulator/GeneralEvulator.js

//Start TextEngine/Evulator/IfEvulator.js
TextEngine.Evulator.IfEvulator = class IfEvulator extends TextEngine.Evulator.BaseEvulator
{
	constructor()
	{
		super();
	}
    Render(tag, vars)
    {
        if (this.Evulator.IsParseMode)
        {
            return Render_ParseMode(tag, vars);
        }
        return this.RenderDefault(tag, vars);
    }
    Render_ParseMode(tag, vars)
    {
        let result = new TextEngine.TextEvulateResult();
        let conditionok = this.ConditionSuccess(tag);
        let sil = false;
        for (let i = 0; i < tag.SubElementsCount; i++)
        {
            let sub = tag.SubElements.GetItem(i);
            if (!conditionok || sil)
            {
                if (!sil)
                {
                    if (sub.ElemName.toLowerCase() == "else")
                    {
                        conditionok = true;
                    }
                    else if (sub.ElemName.toLowerCase() == "elif")
                    {
                        conditionok = this.ConditionSuccess(sub);
                    }
                }

                tag.SubElements.RemoveAt(i);
                i--;
                continue;
            }
            else
            {
                if (sub.ElemName.toLowerCase() == "else" || sub.ElemName.toLowerCase() == "elif")
                {
                    sil = true;
                    i--;
                    continue;
                }
                //sub.EvulateValue(0, 0, vars);
                sub.Index = tag.Parent.SubElements.Count;
                sub.Parent = tag.Parent;
                tag.Parent.SubElements.Add(sub);
            }
        }
        tag.Parent.SubElements.Remove(tag);
        result.Result = TextEngine.TextEvulateResultEnum.EVULATE_NOACTION;
        return result;
    }
    RenderDefault(tag, vars)
    {
        let result = new TextEngine.TextEvulateResult();
        if (this.ConditionSuccess(tag))
        {
            let elseitem = tag.GetSubElement("elif", "else");
            if (elseitem != null)
            {
                result.End = elseitem.Index;
            }
            result.Result = TextEngine.TextEvulateResultEnum.EVULATE_DEPTHSCAN;
        }
        else
        {
            let elseitem = tag.GetSubElement("elif", "else");
            while (elseitem != null)
            {
                if (elseitem.ElemName.toLowerCase() == "else")
                {
                    result.Start = elseitem.Index + 1;
                    result.Result = TextEngine.TextEvulateResultEnum.EVULATE_DEPTHSCAN;
                    return result;
                }
                else
                {

                    if (this.ConditionSuccess(elseitem))
                    {
                        result.Start = elseitem.Index + 1;
                        let nextelse = elseitem.NextElementWN("elif", "else");
                        if (nextelse != null)
                        {
                            result.End = nextelse.Index;
                        }
                        result.Result = TextEngine.TextEvulateResultEnum.EVULATE_DEPTHSCAN;
                        return result;
                    }
                }
                elseitem = elseitem.NextElementWN("elif", "else");
            }
            if (elseitem == null)
            {
                return result;
            }
        }
        return result;
    }
}


//End TextEngine/Evulator/IfEvulator.js

//Start TextEngine/Evulator/IncludeEvulator.js
TextEngine.Evulator.IncludeEvulator = class IncludeEvulator extends TextEngine.Evulator.BaseEvulator
{
	constructor()
	{
		super();
	}
    GetLastDir()
    {
        let value = this.Evulator.LocalVariables.GetValue("_DIR_");
        if (value == null || String.IsNullOrEmpty(value.Value)) return "";
        return value.Value + "\\";
    }
    Render_Parse(tag, vars)
    {
        let loc = this.GetLastDir() + this.EvulateAttribute(tag.ElemAttr.Get("name"), vars);
        if (!this.ConditionSuccess(tag, "if") || !File.Exists(loc)) return null;
        this.SetLocal("_DIR_", File.GetDirName(loc));
        let xpath = tag.GetAttribute("xpath");
        let xpathold = false;
        if (String.IsNullOrEmpty(xpath))
        {
            xpath = tag.GetAttribute("xpath_old");
            xpathold = true;
        }

        let content = File.ReadAllText(loc);
        let result = new TextEngine.TextEvulateResult();

        result.Result = TextEngine.TextEvulateResultEnum.EVULATE_NOACTION;
        tag.Parent.SubElements.Remove(tag);
        if (String.IsNullOrEmpty(xpath))
        {
            this.Evulator.Parse(tag.Parent, content);
        }
        else
        {
            let tempitem = new TextEngine.TextElement();
            tempitem.ElemName = "#document";
            this.Evulator.Parse(tempitem, content);
            let elems = null;
            if (!xpathold)
            {
                elems = tempitem.FindByXPath(xpath);
            }
            else
            {
                elems = tempitem.FindByXPathOld(xpath);
            }
            for (let i = 0; i < elems.Count; i++)
            {
                elems.GetItem(i).Parent = tag.Parent;
                tag.Parent.SubElements.Add(elems[i]);
            }
        }
        return result;
    }
	Render_Default(tag, vars)
    {
        let loc = this.GetLastDir() + this.EvulateAttribute(tag.ElemAttr.Get("name"));
        let parse = tag.GetAttribute("parse", "true");
        if (!File.Exists(loc) || !this.ConditionSuccess(tag, "if")) return null;
        this.SetLocal("_DIR_", File.GetDirName(loc));
        let content = File.ReadAllText(loc);
        let result = new TextEngine.TextEvulateResult();
        if (parse == "false")
        {
            result.Result = TextEngine.TextEvulateResultEnum.EVULATE_TEXT;
            result.TextContent = content;
        }
        else
        {
            let tempelem = new TextEngine.TextElement();
			tempelem.ElemName = "#document";
			tempelem.BaseEvulator = this.Evulator;
			
			let tempelem2 = new TextEngine.TextElement();
			tempelem.ElemName = "#document";
			tempelem.BaseEvulator = this.Evulator;
            let xpath = tag.GetAttribute("xpath");
            let xpathold = false;
            if (String.IsNullOrEmpty(xpath))
            {
                xpath = tag.GetAttribute("xpath_old");
                xpathold = true;
            }
            this.Evulator.Parse(tempelem2, content);
            if (String.IsNullOrEmpty(xpath))
            {
                tempelem = tempelem2;
            }
            else
            {
                let elems = null;
                if (!xpathold)
                {
                    elems = tempelem2.FindByXPath(xpath);
                }
                else
                {
                    elems = tempelem2.FindByXPathOld(xpath);
                }
                for (let i = 0; i < elems.Count; i++)
                {
                    elems.GetItem(i).Parent = tempelem;
                    tempelem.SubElements.Add(elems.GetItem(i));
                }
            }
            let cresult = tempelem.EvulateValue(0, 0, vars);
            result.TextContent += cresult.TextContent;
            if (cresult.Result == TextEngine.TextEvulateResultEnum.EVULATE_RETURN)
            {
                result.Result = TextEngine.TextEvulateResultEnum.EVULATE_RETURN;
                return result;
            }
            result.Result = TextEngine.TextEvulateResultEnum.EVULATE_TEXT;
        }
        return result;
    }
    Render(tag, vars)
    {
        this.CreateLocals();
        if (this.Evulator.IsParseMode)
        {
            return this.Render_Parse(tag, vars);
        }
        return this.Render_Default(tag, vars);
    }
    RenderFinish(tag, vars, latestResult)
    {
        this.DestroyLocals();
    }
}
//End TextEngine/Evulator/IncludeEvulator.js

//Start TextEngine/Evulator/JSEvulator.js
TextEngine.Evulator.JSEvulator = class JSEvulator extends TextEngine.Evulator.BaseEvulator
{
	constructor()
	{
		super();
	}
    Render(tag, vars)
    {
        let conditionok = this.ConditionSuccess(tag, "if");
        let result = new TextEngine.TextEvulateResult();
		let istext = tag.GetAttribute("@text", false);
		result.Result = TextEngine.TextEvulateResultEnum.EVULATE_TEXT;
		let codeText = "";
		for(let i = 0; i < tag.ElemAttr.Count; i++)
		{
			let item = tag.ElemAttr.GetItem(i);
			if(item.Name[0] == "@" || item.Name == "if") continue;
			if(istext == "1" && item.Name == "@text") continue;
			codeText += "let " + item.Name + " = " + "this.EvulateAttribute(tag.ElemAttr.GetItem(" + i + "), vars);";
		}
		let inner = tag.InnerText();
		if(istext == "1")
		{
		
			eval(codeText + "result.TextContent = `" + inner + "`");
		}
		else
		{
			let text = "";
			eval(codeText + inner);
			result.TextContent = text;
		}
        return result;
    }
}
//End TextEngine/Evulator/JSEvulator.js

//Start TextEngine/Evulator/MacroEvulator.js
TextEngine.Evulator.MacroEvulator = class MacroEvulator extends TextEngine.Evulator.BaseEvulator
{
	constructor()
	{
		super();
	}
    Render(tag, vars)
    {
        let name = tag.GetAttribute("name");
        if (!String.IsNullOrEmpty(name))
        {
            this.Evulator.SavedMacrosList.SetMacro(name, tag);
        }
        return null;
    }
}
//End TextEngine/Evulator/MacroEvulator.js

//Start TextEngine/Evulator/NoPrintEvulator.js
TextEngine.Evulator.NoPrintEvulator = class NoPrintEvulator extends TextEngine.Evulator.BaseEvulator
{
	constructor()
	{
		super();
	}
    Render(tag, vars)
    {
		tag.EvulateValue(0, 0, vars);
        return null;
    }
}
//End TextEngine/Evulator/NoPrintEvulator.js

//Start TextEngine/Evulator/ParamEvulator.js
TextEngine.Evulator.ParamEvulator = class ParamEvulator extends TextEngine.Evulator.BaseEvulator
{
	constructor()
	{
		super();
	}
    Render(tag, vars)
    {
        let result = new TextEngine.TextEvulateResult();
        if (tag.ElementType != TextEngine.TextElementType.Parameter)
        {
            result.Result = TextEngine.TextEvulateResultEnum.EVULATE_NOACTION;
            return result;
        }
        if (tag.ParData == null)
        {
            tag.ParData = new ParDecoder.ParDecode(tag.ElemName);
            tag.ParData.Decode();
        }
        result.TextContent += this.EvulatePar(tag.ParData, vars);
        return result;
    }
}
//End TextEngine/Evulator/ParamEvulator.js

//Start TextEngine/Evulator/RepeatEvulator.js
TextEngine.Evulator.RepeatEvulator = class RepeatEvulator extends TextEngine.Evulator.BaseEvulator
{
	constructor()
	{
		super();
	}
    Render(tag, vars)
    {
        let toResult = this.EvulateAttribute(tag.ElemAttr.Get("count"), vars);
        if (toResult == null || isNaN(toResult))
        {
            return null;
        }
        let tonum = parseInt(toResult);
        if (tonum < 1) return null;
        let varname = tag.GetAttribute("current_repeat");
        let result = new TextEngine.TextEvulateResult();
        this.CreateLocals();
        for (let i = 0; i < tonum; i++)
        {
            this.SetLocal(varname, i);
            let cresult = tag.EvulateValue(0, 0, vars);
            if (cresult == null) continue;
            result.TextContent += cresult.TextContent;
            if (cresult.Result == TextEngine.TextEvulateResultEnum.EVULATE_RETURN)
            {
                result.Result = TextEngine.TextEvulateResultEnum.EVULATE_RETURN;
                this.DestroyLocals();
                return result;
            }
            else if (cresult.Result == TextEngine.TextEvulateResultEnum.EVULATE_BREAK)
            {
                break;
            }
        }
        this.DestroyLocals();
        result.Result = TextEngine.TextEvulateResultEnum.EVULATE_TEXT;
        return result;
    }
}
//End TextEngine/Evulator/RepeatEvulator.js

//Start TextEngine/Evulator/ReturnEvulator.js
TextEngine.Evulator.ReturnEvulator = class ReturnEvulator extends TextEngine.Evulator.BaseEvulator
{
	constructor()
	{
		super();
	}
    Render(tag, vars)
    {
		let cr = this.ConditionSuccess(tag, "if");
		if (!cr) return null;
		let result = new TextEngine.TextEvulateResult();
		result.Result = TextEngine.TextEvulateResultEnum.EVULATE_RETURN;
        return result;
    }
}
//End TextEngine/Evulator/ReturnEvulator.js

//Start TextEngine/Evulator/SetEvulator.js
TextEngine.Evulator.SetEvulator = class SetEvulator extends TextEngine.Evulator.BaseEvulator
{
	constructor()
	{
		super();
	}
    Render(tag, vars)
    {
        let conditionok = this.ConditionSuccess(tag, "if");
        let result = new TextEngine.TextEvulateResult();
		result.Result = TextEngine.TextEvulateResultEnum.EVULATE_NOACTION;
        if (conditionok)
        {
            let defname = tag.GetAttribute("name");
            if (String.IsNullOrEmpty(defname) || !String.IsLetterOrDigit(defname)) return result;
            this.Evulator.DefineParameters.Set(defname, this.EvulateAttribute(tag.ElemAttr.Get("value")));
        }
        return result;
    }
}
//End TextEngine/Evulator/SetEvulator.js

//Start TextEngine/Evulator/SwitchEvulator.js
TextEngine.Evulator.SwitchEvulator = class SwitchEvulator extends TextEngine.Evulator.BaseEvulator
{
	constructor()
	{
		super();
	}
    Render(tag, vars)
    {
        let result = new TextEngine.TextEvulateResult();
        let value = this.EvulateAttribute(tag.ElemAttr.Get("c"));
        let mdefault = null;
        let active = null;
        for (let i = 0; i < tag.SubElementsCount; i++)
        {
            let elem = tag.SubElements.GetItem(i);
            if (elem.ElemName.toLowerCase() == "default")
            {
                mdefault = elem;
                continue;
            }
            else if (elem.ElemName.toLowerCase() != "case")
            {
                continue;
            }
            if (this.EvulateCase(elem, value))
            {
                active = elem;
                break;
            }
        }
        if (active == null) active = mdefault;
        if (active == null) return result;
        let cresult = active.EvulateValue(0, 0, vars);
        result.TextContent += cresult.TextContent;
        if (cresult.Result == TextEngine.TextEvulateResultEnum.EVULATE_RETURN)
        {
            result.Result = TextEngine.TextEvulateResultEnum.EVULATE_RETURN;
            return result;
        }
        result.Result = TextEngine.TextEvulateResultEnum.EVULATE_TEXT;
        return result;
    }
    EvulateCase(tag, value)
    {
        let tagvalue = tag.GetAttribute("v");
        return tagvalue.split('|').Contains(value, true);
    }
}
//End TextEngine/Evulator/SwitchEvulator.js

//Start TextEngine/Evulator/TexttagEvulator.js
TextEngine.Evulator.TexttagEvulator = class TexttagEvulator extends TextEngine.Evulator.BaseEvulator
{
	constructor()
	{
		super();
	}
    Render(tag, vars)
    {
		let result = new TextEngine.TextEvulateResult();
		result.Result = TextEngine.TextEvulateResultEnum.EVULATE_TEXT;
		result.TextContent = tag.Value;
        return result;
    }
}
//End TextEngine/Evulator/TexttagEvulator.js

//Start TextEngine/Evulator/UnsetEvulator.js
TextEngine.Evulator.UnsetEvulator = class UnsetEvulator extends TextEngine.Evulator.BaseEvulator
{
	constructor()
	{
		super();
	}
    Render(tag, vars)
    {
        let conditionok = this.ConditionSuccess(tag, "if");
        let result = new TextEngine.TextEvulateResult();
		result.Result = TextEngine.TextEvulateResultEnum.EVULATE_NOACTION;
        if (conditionok)
        {
            let defname = tag.GetAttribute("name");
            if (String.IsNullOrEmpty(defname)) return result;
            this.Evulator.DefineParameters.Delete(defname);
        }
        return result;
    }
}
//End TextEngine/Evulator/UnsetEvulator.js

//Start TextEngine/Evulator/WhileEvulator.js
TextEngine.Evulator.WhileEvulator = class WhileEvulator extends TextEngine.Evulator.BaseEvulator
{
	constructor()
	{
		super();
	}
    Render(tag, vars)
    {
		if ((tag.NoAttrib && String.IsNullOrEmpty(tag.Value)) || (!tag.NoAttrib && String.IsNullOrEmpty(tag.GetAttribute("c")))) return null;
		this.CreateLocals();
		let loop_count = 0;
		let result = new TextEngine.TextEvulateResult();
		result.Result = TextEngine.TextEvulateResultEnum.EVULATE_TEXT;
		while (this.ConditionSuccess(tag))
		{
			this.SetLocal("loop_count", loop_count++);
			let cresult = tag.EvulateValue(0, 0, vars);
			if (cresult == null) continue;
			result.TextContent += cresult.TextContent;
			if (cresult.Result == TextEngine.TextEvulateResultEnum.EVULATE_RETURN)
			{
				result.Result = TextEngine.TextEvulateResultEnum.EVULATE_RETURN;
				this.DestroyLocals();
				return result;
			}
			else if (cresult.Result == TextEngine.TextEvulateResultEnum.EVULATE_BREAK)
			{
				break;
			}
		}
		this.DestroyLocals();
		return result;
    }
}
//End TextEngine/Evulator/WhileEvulator.js

//Start TextEngine/Misc/EvulatorTypes.js
TextEngine.Evulator.EvulatorTypes = class EvulatorTypes
{
	constructor()
	{
		this.types = new Object();
		this.Text = null;
		this.Param = null;
		this.GeneralType = null;
	}
    SetType(name, type)
    {
		this.types[name] = type;

    }
	GetTypeCall(name)
	{
		let type = this.GetType(name);
		if(type == null) return null;
		return type();
	}
    GetType(name)
    {
		for (const [key, value] of Object.entries(this.types)) {
			if(name.toLowerCase() == key.toLowerCase())
			{
				return value;
			}
		}
		return null;
    }
    Clear()
    {
        this.types = new Object();
    }
}
//End TextEngine/Misc/EvulatorTypes.js

//Start TextEngine/Misc/HtmlUtil.js
TextEngine.Utils.HtmlUtil = class HtmlUtil
{
	static ToAttribute(attributes, exclude = null)
	{
		if (attributes == null || attributes.Count == 0) return "";
		let sb = new Common.StringBuilder();
		for (let item in attributes)
		{
			if (exclude != null && exclude.indexOf(item.Name) >= 0) continue;
			if(item.Value == null)
			{
				sb.Append(" " + item.Name);
			}
			else
			{
				sb.Append(" " + item.Name + "=\"" + item.Value.Replace("\"", "\\\"") + "\"");
			}
		}
		return sb.ToString();
	}
}
//End TextEngine/Misc/HtmlUtil.js

//Start TextEngine/Misc/SavedMacros.js
TextEngine.SavedMacros = class SavedMacros
{
	constructor()
	{
		this.macros = [];
	}
    GetMacroIndex(name)
    {
        for (let i = 0; i < this.macros.length; i++)
        {
            if (this.macros[i].GetAttribute("name") == name) return i;
        }
        return -1;
    }
    GetMacro(name)
    {
        let index = this.GetMacroIndex(name);
        if (index == -1) return null;
        return this.macros[index];
    }
    SetMacro(name, tag)
    {
        let index = this.GetMacroIndex(name);
        if (index == -1)
        {
            this.macros.push(tag);
        }
        else
        {
            this.macros[index] = tag;
        }
    }
}
//End TextEngine/Misc/SavedMacros.js

//Start TextEngine/Misc/SpecialCharType.js
TextEngine.SpecialCharType =  {
        /// <summary>
        /// \ character disabled
        /// </summary>
        SCT_NotAllowed: 1,
        /// <summary>
        /// e.g(\test, result: test)
        /// </summary>
        SCT_AllowedAll: 2,
        /// <summary>
        /// e.g(\test\{} result: \test{ 
        /// </summary>
        SCT_AllowedClosedTagOnly: 3
}
//End TextEngine/Misc/SpecialCharType.js

//Start TextEngine/Text/TextElement.js
TextEngine.TextElement = class TextElement
{
	constructor()
	{
		//private
		this._elemName = "";
		this._closed = false;
		this._value = "";
		this._baseEvulator = null;
		this._tagInfo = null;
		//public
		this.ParData = null;
		this.ElementType = TextEngine.TextElementType.ElementNode;
		this.SubElements = new TextEngine.TextElements();
		this.ElemAttr = new TextEngine.TextElementAttributes();
		this.Parent = null;

		this.ElementType = TextEngine.TextElementFlags.TextNode;
		this.SlashUsed = false;
		this.DirectClosed = false;
		this.AutoAdded = false;
		this.AliasName = "";
		this.AutoClosed = false;
		this.NoAttrib = false;
		this.TagAttrib = "";

	}
	get BaseEvulator()
	{
		return this._baseEvulator;
	}
	set BaseEvulator(value)
	{
		this._baseEvulator = value;
		this._tagInfo = null;
	}
	get Depth()
	{
		let vparent = this.Parent;
		let total = 0;
		while ((vparent != null) && vparent.ElemName != "#document")
		{
			total++;
			vparent = vparent.Parent;
		}
		return total;
	}
    get ElemName()
	{
		return this._elemName;
	}
	set ElemName(value)
	{
		this._elemName = value;
		if(this.BaseEvulator != null)
		{
			this.NoAttrib = false;
			if ((this.GetTagFlags() & TextEngine.TextElementFlags.TEF_NoAttributedTag) != 0)
			{
				this.NoAttrib = true;
			}
                    
		}
		this._tagInfo = null;
	}
	get Closed()
	{
		return this._closed;
	}
	set Closed(value)
	{
		this._closed = value;
		if (this.BaseEvulator != null)
		{
			this.BaseEvulator.OnTagClosed(this);
		}
	}
	get Value()
	{
		return this._value;
	}
	set Value(value)
	{
		this._value = value;
		this.ParData = null;
	}
	get FirstChild()
	{
		if(this.SubElementsCount > 0)
		{
			return this.SubElements.GetItem(0);
		}
		return null;
	}
	get LastChild()
	{
		if(this.SubElementsCount > 0)
		{
			return this.SubElements.GetItem(this.SubElementsCount - 1);
		}
		return null;
	}
	get SubElementsCount()
	{
		return this.SubElements.Count;
	}
	get Index()
	{
		if(this.Parent == null) return -1;
		return this.Parent.SubElements.IndexOf(this);
	}
	set Index(value)
	{
	}
	get TagInfo()
	{
		if (this.BaseEvulator == null) return null;
		if (this._tagInfo == null && this.ElementType != TextEngine.TextElementType.Parameter)
		{
			if (this.BaseEvulator.TagInfos.HasTagInfo(this.ElemName)) this._tagInfo = this.BaseEvulator.TagInfos.Get(this.ElemName);
			else if (this.BaseEvulator.TagInfos.HasTagInfo("*")) this._tagInfo = this.BaseEvulator.TagInfos.Get("*");
		}
		return this._tagInfo;
	}
	get TagFlags()
	{
		if (this.TagInfo == null) return TextEngine.TextElementFlags.TEF_NONE;
		return this.TagInfo.Flags;
	}
	AddElement(_element)
	{
		//element.Index = this.SubElements.Count;
		this.SubElements.Add(_element);
	}
	GetAttribute(name, vdefault = null)
	{
		return this.ElemAttr.GetAttribute(name, vdefault);
	}
	SetAttribute(name, value)
	{
		this.ElemAttr.SetAttribute(name, value);
	}
    NameEquals(name, matchalias = false)
	{
		if (this.ElemName.toUpperCase() == name.toUpperCase()) return true;
		if (matchalias)
		{
			if (this.BaseEvulator.Aliasses[name] != undefined)
			{
				let alias = this.BaseEvulator.Aliasses[name];
				if (alias.toUpperCase() == this.ElemName.toUpperCase()) return true;
				return false;
			}
			else if(this.BaseEvulator.Aliasses[this.ElemName] != undefined)
			{
				let alias = this.BaseEvulator.Aliasses[this.ElemName];
				if (alias.toUpperCase() == name.toUpperCase()) return true;
				return false;
			}
		}
		return false;
	}
	SetInner(text)
	{
		this.SubElements.Clear();
		this.BaseEvulator.Parse(this, text);
		return this;
	}
	Outer(outputformat = false)
	{
		if (this.ElemName == "#document")
		{
			return this.Inner();
		}
		if (this.ElemName == "#text")
		{
			return this.value;
		}
		if (this.ElementType == TextEngine.TextElementType.CommentNode)
		{
			return this.BaseEvulator.LeftTag + "--" + this.Value + "--" + this.BaseEvulator.RightTag;
		}
		let text = new Common.StringBuilder();
		let additional = new Common.StringBuilder();
		if (!PhpFuctions.empty(this.TagAttrib))
		{
			additional.Append("=" + this.TagAttrib);
		}
		if (this.ElementType == TextEngine.TextElementType.Parameter)
		{
			text.Append(this.BaseEvulator.LeftTag + this.BaseEvulator.ParamChar + this.ElemName + TextEngine.Utils.HtmlUtil.ToAttribute(this.ElemAttr) + this.BaseEvulator.RightTag);
		}
		else
		{
			if (this.AutoAdded)
			{
				if (this.SubElementsCount == 0) return string.Empty;
			}
			text.Append(this.BaseEvulator.LeftTag + this.ElemName + additional.ToString() + ((this.NoAttrib && this.ElementType == TextEngine.TextElementType.ElementNode) ? ' ' + this.Value : TextEngine.Utils.HtmlUtil.ToAttribute(this.ElemAttr)));
			if (this.DirectClosed)
			{
				text.Append(" /" + this.BaseEvulator.RightTag);
			}
			else if (this.AutoClosed)
			{
				text.Append(this.BaseEvulator.RightTag);
			}
			else
			{
				text.Append(this.BaseEvulator.RightTag);
				text.Append(this.Inner(outputformat));
				let eName = this.ElemName;
				if (!empty(this.AliasName))
				{
					eName = this.AliasName;
				}
				text.Append(this.BaseEvulator.LeftTag + '/' + eName + this.BaseEvulator.RightTag);
			}
		}
		return text.ToString();
	}
	Header(outputformat = false)
	{
		if (this.AutoAdded && this.SubElementsCount == 0) return null;
		let text = new Common.StringBuilder();
		if (outputformat)
		{
			text.Append('\t', this.Depth);
		}
		if (this.ElementType == TextEngine.TextElementType.XMLTag)
		{
			text.Append(this.BaseEvulator.LeftTag + "?" + this.ElemName + TextEngine.Utils.HtmlUtil.ToAttribute(this.ElemAttr) + "?" + this.BaseEvulator.RightTag);
		}
		if (this.ElementType == TextEngine.TextElementType.Parameter)
		{
			text.Append(this.BaseEvulator.LeftTag + this.BaseEvulator.ParamChar.ToString() + this.ElemName + TextEngine.Utils.HtmlUtil.ToAttribute(this.ElemAttr) + this.BaseEvulator.RightTag);
		}
		else if (this.ElementType == TextEngine.TextElementType.ElementNode)
		{
			let additional = new Common.StringBuilder();
			if (!empty(this.TagAttrib))
			{
				additional.Append('=' + this.TagAttrib);
			}
			text.Append(this.BaseEvulator.LeftTag + this.ElemName + additional.ToString() + ((this.NoAttrib) ? ' ' + this.Value : TextEngine.Utils.HtmlUtil.ToAttribute(this.ElemAttr))   );
			if (this.DirectClosed)
			{
				text.Append(" /" + this.BaseEvulator.RightTag);
			}
			else if (this.AutoClosed)
			{
				text.Append(this.BaseEvulator.RightTag);
			}
			else
			{
				text.Append(this.BaseEvulator.RightTag);
			}
		}
		else if (this.ElementType == TextEngine.TextElementType.CDATASection)
		{
			text.Append(this.BaseEvulator.LeftTag + "![CDATA[" + this.Value + "]]" + this.BaseEvulator.RightTag);
		}
		else if (this.ElementType == TextEngine.TextElementType.CommentNode)
		{
			text.Append(this.BaseEvulator.LeftTag + "--" + this.Value + "--" + this.BaseEvulator.RightTag);
		}
            if (outputformat && (this.FirstChild == null || this.FirstChild.ElemName != "#text"))
            {
                text.Append("\r\n");
            }
            return text.ToString();
        }
        Footer(outputformat = false)
        {
            if (this.SlashUsed || this.DirectClosed || this.AutoClosed) return null;
            let text = new Common.StringBuilder();
            if (this.ElementType == TextEngine.TextElementType.ElementNode)
            {
                if (outputformat)
                {
                    if (this.LastChild == null || this.LastChild.ElemName != "#text")
                    {
                        text.Append('\t', this.Depth);
                    }
                }
                let eName = this.ElemName;
                if (!empty(this.AliasName))
                {
                    eName = this.AliasName;
                }
                text.Append(this.BaseEvulator.LeftTag + '/' + eName + this.BaseEvulator.RightTag);
            }
            if (outputformat)
            {
                text.Append("\r\n");
            }
            return text.ToString();
        }
		Inner(outputformat = false)
        {
            let text = new Common.StringBuilder();
            if (this.ElementType == TextEngine.TextElementType.CommentNode || this.ElementType == TextEngine.TextElementType.XMLTag)
            {
                return text.ToString();
            }
            if (this.ElemName == "#text" || this.ElementType == TextEngine.TextElementType.CDATASection)
            {
                if (this.ElementType == TextEngine.TextElementType.EntityReferenceNode)
                {
                    text.Append("&" + this.Value + ";");
                    return text.ToString();
                }
                text.Append(this.Value);
                return text.ToString();
            }
            if (this.SubElementsCount == 0) return text.ToString();
            for (let subElement of this.SubElements)
            {
                if (subElement.ElemName == "#text")
                {
                    text.Append(subElement.Inner(outputformat));
                }
                else if (subElement.ElementType == TextEngine.TextElementType.CDATASection)
                {
                    text.Append(subElement.Header());
                }
                else if (subElement.ElementType == TextEngine.TextElementType.CommentNode)
                {
                    text.Append(subElement.Outer(outputformat));
                }
                else if (subElement.ElementType == TextEngine.TextElementType.Parameter)
                {
                    text.Append(subElement.Header());
                }
                else
                {
                    text.Append(subElement.Header(outputformat));
                    text.Append(subElement.Inner(outputformat));
                    text.Append(subElement.Footer(outputformat));
                }

            }
            return text.ToString();
        }
        PreviousElementWN()
        {
            let prev = this.PreviousElement();
            while (prev != null)
            {
                if (prev.ElementType == TextEngine.TextElementType.Parameter || prev.ElemName == "#text")
                {
                    prev = prev.PreviousElement();
                    continue;
                }
                if (in_array(prev.ElemName, arguments))
                {
                    return prev;
                }
                prev = prev.PreviousElement();
            }
            return null;
        }
        NextElementWN()
        {
            let next = this.NextElement();			
            while (next != null)
            {
                if (next.ElementType == TextEngine.TextElementType.Parameter || next.ElemName == "#text")
                {
                    next = next.NextElement();
                    continue;
                }
                if (in_array(next.ElemName.toLowerCase(), arguments))
                {
                    return next;
                }
                next = next.NextElement();
            }
            return null;
        }
        PreviousElement()
        {
            if (this.Index - 1 >= 0)
            {
                return this.Parent.SubElements.GetItem(this.Index - 1);
            }
            return null;
        }
        NextElement()
        {
            if (this.Index + 1 < this.Parent.SubElementsCount)
            {
                return this.Parent.SubElements.GetItem(this.Index + 1);
            }
            return null;
        }
        GetSubElement()
        {
            for (let i = 0; i < this.SubElementsCount; i++)
            {
                if (in_array(this.SubElements.GetItem(i).ElemName.toLowerCase(), arguments))
                {
                    return this.SubElements.GetItem(i);
                }
            }
            return null;
        }
        InnerText()
        {
            if (this.ElemName == "#text" || this.ElementType == TextEngine.TextElementType.CDATASection)
            {
                if (this.ElementType == TextEngine.TextElementType.EntityReferenceNode)
                {
                    this.BaseEvulator.AmpMaps[nval];
                    return nval;
                }
                return this.Value;
            }
            let text = new Common.StringBuilder();
            if (this.SubElementsCount == 0) return text.ToString();
            for (let subElement of this.SubElements)
            {
                if (subElement.ElemName == "#text" || subElement.ElementType == TextEngine.TextElementType.CDATASection)
                {
                    if (subElement.ElementType == TextEngine.TextElementType.EntityReferenceNode)
                    {
                        this.BaseEvulator.AmpMaps[nval];
                        text.Append(nval);
                    }
                    else
                    {
                        text.Append(subElement.Value);
                    }
                }
                else
                {
                    text.Append(subElement.InnerText());
                }

            }
            return text.ToString();
        }
        EvulateValue(start = 0, end = 0, vars = null, senderstr = "")
        {
            let result = new TextEngine.TextEvulateResult();
            result.TextContent = senderstr;
            let handler = this.BaseEvulator.GetHandler();
            if (this.ElementType == TextEngine.TextElementType.CommentNode)
            {
                return null;
            }
            if (this.ElemName == "#text")
            {
                if(this.BaseEvulator.EvulatorTypes.Text != null)
                {
                    if (handler != null && !handler.OnRenderPre(this, vars)) return result;
                    let evulator = this.BaseEvulator.EvulatorTypes.Text();
                    evulator.SetEvulator(this.BaseEvulator);
                    let rResult = evulator.Render(this, vars);
                    if (handler == null || handler.OnRenderFinishPre(this, vars, rResult))
                    {
                        evulator.RenderFinish(this, vars, rResult);
                        if (handler != null) handler.OnRenderFinishPost(this, vars, rResult);
                    }
                    if(handler != null) handler.OnRenderPost(this, vars, rResult);
                    return rResult;
                }
                result.TextContent = this.Value;
                return result;
            }
            if (this.ElementType == TextEngine.TextElementType.Parameter)
            {
                if (this.BaseEvulator.EvulatorTypes.Param != null)
                {
                    if (handler != null && !handler.OnRenderPre(this, vars)) return result;
                    let evulator = this.BaseEvulator.EvulatorTypes.Param();
                    evulator.SetEvulator(this.BaseEvulator);
                    let vresult = evulator.Render(this, vars);
                    if(handler != null) handler.OnRenderPost(this, vars, vresult);
                    result.Result = vresult.Result;
                    if (handler == null || handler.OnRenderFinishPre(this, vars, vresult))
                    {
                        evulator.RenderFinish(this, vars, vresult);
                        if (handler != null) handler.OnRenderFinishPost(this, vars, vresult);
                    }

                    if (vresult.Result == TextEngine.TextEvulateResultEnum.EVULATE_TEXT)
                    {
                        result.TextContent += vresult.TextContent;
                    }
                    return result;
                }
            }
            if (end == 0 || end > this.SubElementsCount) end = this.SubElementsCount;
            for (let i = start; i < end; i++)
            {
                let subElement = this.SubElements.GetItem(i);
                let targetType = null;
                if (subElement.ElementType == TextEngine.TextElementType.Parameter)
                {
                    targetType = this.BaseEvulator.EvulatorTypes.Param;
                }
                else
                {
                    if (subElement.ElemName != "#text")
                    {
                        targetType = this.BaseEvulator.EvulatorTypes.GetType(subElement.ElemName);
                        if (targetType == null)
                        {
                            targetType = this.BaseEvulator.EvulatorTypes.GeneralType;
                        }
                    }
                }
                let vresult = null;
                if (handler != null && !handler.OnRenderPre(subElement, vars)) continue;
                if (targetType != null)
                {
					
                    let evulator = targetType();
                    evulator.SetEvulator(this.BaseEvulator);
                    vresult = evulator.Render(subElement, vars);
                    if(handler != null) handler.OnRenderPost(subElement, vars, vresult);
                    if (vresult == null)
                    {
                        if (handler != null && !handler.OnRenderFinishPre(subElement, vars, vresult)) continue;
                        evulator.RenderFinish(subElement, vars, vresult);
                        if(handler != null) handler.OnRenderFinishPost(subElement, vars, vresult);
                        continue;
                    }
                    if (vresult.Result == TextEngine.TextEvulateResultEnum.EVULATE_DEPTHSCAN)
                    {
                        vresult = subElement.EvulateValue(vresult.Start, vresult.End, vars, vresult.TextContent);
                    }
                    if (handler == null || handler.OnRenderFinishPre(subElement, vars, vresult))
                    {
                        evulator.RenderFinish(subElement, vars, vresult);
                        if (handler != null) handler.OnRenderFinishPost(subElement, vars, vresult);
                    }
                    if (vresult == null) continue;
                }
                else
                {
                    vresult = subElement.EvulateValue(0, 0, vars);
                    if (vresult == null) continue;
                }
                if (vresult.Result == TextEngine.TextEvulateResultEnum.EVULATE_TEXT)
                {
                    result.TextContent += vresult.TextContent;
                }
                else if (vresult.Result == TextEngine.TextEvulateResultEnum.EVULATE_RETURN || vresult.Result == TextEngine.TextEvulateResultEnum.EVULATE_BREAK || vresult.Result == TextEngine.TextEvulateResultEnum.EVULATE_CONTINUE)
                {
                    result.Result = vresult.Result;
                    result.TextContent += vresult.TextContent;
                    break;
                }
            }
            return result;
        }
        GetElementsHasAttributes(name, depthscan = false, limit = 0)
        {
            let elements = new TextEngine.TextElements();
            let lower = name.toLowerCase();
            for (let i = 0; i < this.subElements.Count; i++)
            {
                let elem = this.SubElements.GetItem(i);
                if (elem.ElemAttr.Count > 0 && lower == "*")
                {
                    elements.Add(elem);
                }
                else
                {
                    if (elem.ElemAttr.HasAttribute(lower))
                    {
                        elements.Add(elem);

                    }
                }

                if (depthscan && elem.SubElementsCount > 0)
                {
                    elements.AddRange(elem.GetElementsHasAttributes(name, depthscan));
                }

            }
            return elements;
        }
        GetElementsByTagName(name, depthscan = false, limit = 0)
        {
            let elements = new TextEngine.TextElements();
            let lower = name.toLowerCase();
            for (let i = 0; i < this.SubElements.Count; i++)
            {
                let elem = this.SubElements.GetItem(i);
                if (elem.ElemName.toLowerCase() == lower || lower == "*")
                {
                    elements.Add(elem);
                    if (limit > 0 && elements.Count >= limit)
                    {
                        break;
                    }
                }
                if (depthscan && elem.SubElementsCount > 0)
                {
                    elements.AddRange(elem.GetElementsByTagName(name, depthscan));
                }

            }
            return elements;
        }
        GetElementsByPath(block)
        {
            let elements = new TextEngine.TextElements();
            for (let i = 0; i < this.SubElementsCount; i++)
            {
                let subelem = this.SubElements.GetItem(i);
                if (subelem.ElementType != TextEngine.TextElementType.ElementNode) continue;
                for (let j = 0; j < block.Count; j++)
                {
                    let curblock = block[j];
                    if (curblock.IsAttributeSelector)
                    {
                        if (curblock.BlockName == "*")
                        {
                            if (subelem.ElemAttr.Count == 0)
                            {
                                continue;
                            }
                        }
                        else
                        {
                            if (!subelem.ElemAttr.HasAttribute(curblock.BlockName))
                            {
                                continue;
                            }
                        }
                    }
                    else
                    {
                        if (curblock.BlockName != "*" && curblock.BlockName != subelem.ElemName)
                        {
                            continue;
                        }
                    }
                    if (elements.Contains(subelem) || (curblock.XPathExpressions.Count == 0 || TextEngine.XPathClasses.XPathActions.XExpressionSuccess(subelem, curblock.XPathExpressions)))
                    {
                        elements.Add(subelem);
                        TextEngine.XPathClasses.XPathActions.Eliminate(elements, curblock);
                    }
                    break;

                }
            }
            return elements;
        }
        FindByXPathBlock(block)
        {
            let foundedElems = new TextEngine.TextElements();
            if (block.IsAttributeSelector)
            {
                foundedElems = this.GetElementsHasAttributes(block.BlockName, block.BlockType == TextEngine.XPathClasses.XPathBlockType.XPathBlockScanAllElem);
            }
            else
            {
                if (!String.IsNullOrEmpty(block.BlockName))
                {
                    if (block.BlockName == ".")
                    {
                        foundedElems.Add(this);
                        return foundedElems;
                    }
                    else if (block.BlockName == "..")
                    {
                        foundedElems.Add(this.Parent);
                        return foundedElems;

                    }
                    else
                    {
                        foundedElems = this.GetElementsByTagName(block.BlockName, block.BlockType == TextEngine.XPathClasses.XPathBlockType.XPathBlockScanAllElem);
                    }
                }
            }
            if (block.XPathExpressions.Count > 0 && foundedElems.Count > 0)
            {
                for (let i = 0; i < block.XPathExpressions.Count; i++)
                {
                    let exp = block.XPathExpressions.GetItem(i);
                    foundedElems = TextEngine.XPathClasses.XPathActions.Eliminate(foundedElems, exp);
                    if (foundedElems.Count == 0)
                    {
                        break;
                    }
                }


            }
            return foundedElems;
        }
        FindByXPath(xpath)
        {
            let elements = new TextEngine.TextElements();
            let XPathItem = TextEngine.XPathClasses.XPathItem.ParseNew(xpath);
            elements = this.FindByXPathByBlockContainer(XPathItem.XPathBlockList);
            elements.SortItems();
            return elements;
        }
        FindByXPathByBlockContainer(container, senderitems = null)
        {
            let elements = new TextEngine.TextElements();
            let inor = true;
            for (let i = 0; i < container.Count; i++)
            {
                let curblocks = container.GetItem(i);
                if(curblocks.IsOr())
                {
                    inor = true;
                    continue;
                }
                if(!inor)
                {

                    if (curblocks.IsBlocks())
                    {
                        elements  = this.FindByXPathBlockList(curblocks, elements);
                    }
                    else
                    {
                        elements.AddRange(this.FindByXPathPar(curblocks, senderitems));
                    }
                }
                else
                {
                    if (curblocks.IsBlocks())
                    {
                        elements.AddRange(this.FindByXPathBlockList(curblocks));
                    }
                    else
                    {
                        elements.AddRange(this.FindByXPathPar(curblocks));
                    }
                }

                inor = false;
            }
            
            return elements;
        }

        FindByXPathPar(xpar, senderitems = null)
        {
            let elements = new TextEngine.TextElements();
            elements = this.FindByXPathByBlockContainer(xpar.XPathBlockList, senderitems);
            if (xpar.XPathExpressions.Count > 0 && elements.Count > 0)
            {
                elements.SortItems();
                for (let j = 0; j < xpar.XPathExpressions.Count; j++)
                {
                    let exp = xpar.XPathExpressions[j];
                    elements = TextEngine.XPathClasses.XPathActions.Eliminate(elements, exp);
                    if (elements.Count == 0)
                    {
                        break;
                    }
                }
            }
            return elements;
        }
        FindByXPathBlockList(blocks, senderlist = null)
        {
            let elements = senderlist;
            for (let i = 0; i < blocks.Count; i++)
            {

                let xblock = blocks.GetItem(i);
                if (i == 0 && senderlist == null)
                {
                    elements = this.FindByXPathBlock(xblock);
                }
                else
                {
                    elements = elements.FindByXPath(xblock);
                }
            }
            return elements;
        }
        FindByXPathOld(xpath)
        {
            let elements = new TextEngine.TextElements();
            let fn = new TextEngine.XPathClasses.XPathFunctions();
            let XPathBlock = TextEngine.XPathClasses.XPathItem.Parse(xpath);
            let actions = new TextEngine.XPathClasses.XPathActions();
            actions.XPathFunctions = new TextEngine.XPathClasses.XPathFunctions();
            for (let i = 0; i < XPathblock.XPathBlocks.Count; i++)
            {
                let xblock = XPathblock.XPathBlocks.GetItem(i);
                if (i == 0)
                {
                    elements = this.FindByXPath(xblock);
                }
                else
                {
                    let newelements = new TextEngine.TextElements();
                    for (let j = 0; j < elements.Count; j++)
                    {
                        let elem = elements[j];
                        let nextelems = elem.FindByXPath(xblock);
                        for (let k = 0; k < nextelems.Count; k++)
                        {
                            if (newelements.Contains(nextelems[k])) continue;
                            newelements.Add(nextelems[k]);
                        }
                    }
                    elements = newelements;
                }
            }
            return elements;
        }
        XPathSuccessSingle(block)
        {
            if (this.ElementType != TextEngine.TextElementType.ElementNode || (block.BlockName != "*" && block.BlockName != this.ElemName)) return false;
            if(block.XPathExpressions.Count > 0)
            {
                let myIndex = this.Index;
                for (let i = 0; i < block.XPathExpressions.Count; i++)
                {
                    if (!TextEngine.XPathClasses.XPathActions.XExpressionSuccess(this, block.XPathExpressions[i], null, myIndex)) return false;
                }
            }
            return true;
        }
        XPathTest(xcontainer)
        {
            for (let i = 0; i < this.SubElements.Count; i++)
            {
                let elem = this.SubElements.GetItem(i);
                for (let j = 0; j < xcontainer.Count; j++)
                {
                    let blocks = xcontainer[j];
                    if(blocks.IsBlocks())
                    {

                    }
                }
            }

            return null;
        }
        GetTagInfo()
        {
            return this.TagInfo;;
        }
        GetTagFlags()
        {
           return this.TagFlags;
        }
		HasFlag(flag)
        {
            return (this.TagFlags & flag) != 0;
        }
        SetTextTag(closetag = false)
        {
            this.ElemName = "#text";
            this.ElementType = TextEngine.TextElementType.TextNode;
            if(closetag) this.Closed = true;
        }
}

//End TextEngine/Text/TextElement.js

//Start TextEngine/Text/TextElementAttribute.js
TextEngine.TextElementAttribute = class TextElementAttribute
{
	constructor()
	{
		this._name = "";
		this._value = "";
		this.ParData = null;
	}
	get Name()
	{
		return this._name;
	}
	set Name(value)
	{
		this._name = value;
	}
	get Value()
	{
		return this._value;
	}
	set Value(value)
	{
		this._value = value;
		this.ParData = null;
	}
}

//End TextEngine/Text/TextElementAttribute.js

//Start TextEngine/Text/TextElementAttributes.js
TextEngine.TextElementAttributes = class TextElementAttributes extends Common.CollectionBase
{
	constructor()
	{
		super();
		this.lastElement = null;
		this.AutoInitialize = true;

	}
	get FirstAttribute()
	{
		if(this.Count == 0) return null;
		return this.GetItem(0);
	}
	Get(offset) 
	{
		let item = null;
		let index = this.GetIndex(offset);
		if(index == -1) return item;
		item = this.inner[index];
        return item;
    }
    Set(offset, value) 
	{
		let index = this.IndexOf(offset);
		if(index < 0) return;
		if(value == null)
		{
			value = new TextEngine.TextElementAttribute();
			value.Name = offset;
		}
		this.inner[index] = value;
    }
	HasAttribute(name)
	{
		return this.Exists(name);
	}
	GetAttribute(name, vdefault = null)
	{
		let index = this.GetIndex(name);
		if(index == -1)
		{
			return vdefault;
		}
		let item = this.inner[index];
		return item.Value;
	}
	SetAttribute(name, value)
	{
		let index = this.GetIndex(name);
		if(index >= 0)
		{
			let item = this.inner[index];
			item.Value = value;
			return;
		}
		let item = new TextEngine.TextElementAttribute();
		item.Name = name;
		item.Value = value;
		this.inner.push(item);
	}
	RemoveAttribute(name)
	{
		let index = this.GetIndex(name);
		if(index < 0) return false;
		this.RemoveAt(index);
		return true;
	}
	GetFirstKey()
	{
		if(this.GetCount() > 0)
		{
			return this.inner[0].Name;
		}
		return null;
	}
	GetIndex(name)
	{
		for(let i = 0; i < this.GetCount(); i++)
		{
			let item = this.inner[i];
			if(name.toLowerCase() == item.Name.toLowerCase())
			{
				return i;
			}
		}
		return -1;
	}
}
//End TextEngine/Text/TextElementAttributes.js

//Start TextEngine/Text/TextElementEnum.js
TextEngine.TextElementType =  {
	ElementNode: 1,
	AttributeNode: 2,
	TextNode: 3,
	CDATASection: 4,
	EntityReferenceNode:  5,
	CommentNode:  8,
	Document:  9,
	Parameter:  16,
	XMLTag:  17
}
//End TextEngine/Text/TextElementEnum.js

//Start TextEngine/Text/TextElementFlags.js
TextEngine.TextElementFlags =  {
	TEF_NONE: 0,
	TEF_ConditionalTag:  1 << 0,
	TEF_NoAttributedTag:  1 << 1,
	TEF_AutoClosedTag:  1 << 2,
	/// <summary>
	/// E.G [TAG=ATTRIB=test atrribnext/], returns: ATTRIB=test atrribnext
	/// </summary>
	TEF_TagAttribonly:   1 << 3,
	/// <summary>
	/// if set [TAG/], tag not flagged autoclosed, if not set tag flagged autoclosed. 
	/// </summary>
	TEF_DisableLastSlash:  1 << 4,
	/// <summary>
	/// İşaretlenen tagın içeriğini ayrıştırmaz.
	/// </summary>
	TEF_NoParse:  1 << 5
}

//End TextEngine/Text/TextElementFlags.js

//Start TextEngine/Text/TextElementInfo.js
TextEngine.TextElementInfo = class TextElementInfo
{
	constructor()
	{
		this.ElementName = "";
		this.Flags = 0;
		//Object
		this.CustomData = null;
	}
}

//End TextEngine/Text/TextElementInfo.js

//Start TextEngine/Text/TextElementInfos.js
TextEngine.TextElementInfos = class TextElementInfos extends Common.CollectionBase
{
	constructor()
	{
		super();
		this.lastElement = null;
		this.AutoInitialize = true;
	}
	Get(name)
	{
		if (String.IsNullOrEmpty(name) || name == "#text") return null;
		if (this.lastElement != null && name.toLowerCase() == this.lastElement.ElementName)
		{
			return this.lastElement;
		}
		let info = null;
		info = this.inner.filter(e => e.ElementName == name.toLowerCase()).FirstOrDefault();
		if (info == null)
		{
			if (this.AutoInitialize)
			{
				info = new TextEngine.TextElementInfo();
				info.ElementName = name.toLowerCase();
				this.Add(info);
			}
		}
		this.lastElement = info;
		return info;
	}
	Set(name, value)
	{
		if (value == null) return;
		let info = null;
		info = inner.filter(e => e.ElementName == name.toLowerCase()).FirstOrDefault();
		if (info != null)
		{
			if (info == lastElement) lastElement = null;
			this.inner.Remove(info);
		}
		value.ElementName = name.toLowerCase();
		this.Add(value);
	}
    HasTagInfo(tagName)
    {
        let oldinfo = this.AutoInitialize;
        this.AutoInitialize = false;
        let result = this.Get(tagName) != null;
        this.AutoInitialize = oldinfo;
        return result;
    }
	GetElementFlags(tagName)
    {
        if (!this.HasTagInfo(tagName)) return TextEngine.TextElementFlags.TEF_NONE;
        return this.Get(tagName).Flags;
    }
}
//End TextEngine/Text/TextElementInfos.js

//Start TextEngine/Text/TextElements.js
TextEngine.TextElements = class TextElements extends Common.CollectionBase
{
	constructor()
	{
		super();
		this.AutoInitialize = true;

		
	}
	SortItems()
	{
		this.inner.sort(TextEngine.TextElements.CompareTextElements);
	}
	GetIndex(name)
	{
		for(let i = 0; i < this.GetCount(); i++)
		{
			let item = this.inner[i];
			if(name == item.ElemName)
			{
				return i;
			}
		}
		return -1;
	}
	FindByXPath(xblock)
	{
		let elements = new TextEngine.TextElements();
		for (let j = 0; j < this.Count; j++)
		{
			let elem = this.GetItem(j);
			let nextelems = elem.FindByTextEngine.XPathClasses.XPathBlock(xblock);
			for (let k = 0; k < nextelems.Count; k++)
			{
				if (elements.Contains(nextelems.GetItem(k))) continue;
				elements.Add(nextelems.GetItem(k));
			}
		}
		return elements;
	}
	static CompareTextElements(a, b)
	{
		if(a.Depth == b.Depth)
		{
			if(a.Index > b.Index)
			{
				return 1;
			}
			else if(b.Index > a.Index)
			{
				return -1;
			}
			return 0;
		}
		if(a.Depth > b.Depth)
		{
			let depthfark = Math.abs(a.Depth - b.Depth);
			let next = a;
			for (let i = 0; i < depthfark; i++)
			{
				next = next.Parent;
			}
			return CompareTextElements(next, b);
		}
		else
		{
			let depthfark = Math.Abs(a.Depth - b.Depth);
			let next = b;
			for (let i = 0; i < depthfark; i++)
			{
				next = next.Parent;
			}
			return CompareTextElements(a, next);
		}
	}
}
//End TextEngine/Text/TextElements.js

//Start TextEngine/Text/TextEvulateResult.js
TextEngine.TextEvulateResultEnum =
{
    "EVULATE_NOACTION": 0,
    "EVULATE_TEXT": 1,
    "EVULATE_CONTINUE": 2,
    "EVULATE_RETURN": 3,
    "EVULATE_DEPTHSCAN": 4,
    "EVULATE_BREAK": 5
}
TextEngine.TextEvulateResult  = class TextEvulateResult
{
	constructor()
	{
		this.TextContent = "";
		this.Result = TextEngine.TextEvulateResultEnum.EVULATE_TEXT;
		this.Start = 0;
		this.End = 0;
	}
}
//End TextEngine/Text/TextEvulateResult.js

//Start TextEngine/Text/TextEvulator.js
TextEngine.TextEvulator = class TextEvulator
{
	constructor(text = null, isfile = false)
	{
		this._text = "";
        this.Elements = new TextEngine.TextElement();
		this.Elements.ElemName = "#document";
		this.Elements.ElementType = TextEngine.TextElementType.Document;
		this.SurpressError = false;
		this.ThrowExceptionIFPrevIsNull = true;
		this.Depth = 0;
		this.LeftTag = '{';
		this.RightTag = '}';
		this.NoParseEnabled = true;
		this.ParamChar = '%';
		this.Aliasses = [];
		this.GlobalParameters = null;
		this.DefineParameters = new Common.KeyValues();
		this._localVariables = new Common.KeyValueGroup();
		this.LocalVariables.Add(this.DefineParameters);
		this.ParamNoAttrib = false;
		this.DecodeAmpCode = false;
		this.AllowParseCondition = false;
		this._EvulatorTypes = new TextEngine.Evulator.EvulatorTypes();
		this.SupportExclamationTag = false;
		this.SupportCDATA = false;
		this.AllowXMLTag = false;
		this.TrimMultipleSpaces = false;
		this.TrimStartEnd = false;
		this.AmpMaps = [];
		this._SavedMacrosList = new TextEngine.SavedMacros();
		this._tagInfos = new TextEngine.TextElementInfos();
		this._customDataDictionary = [];
		this.CustomDataSingle = null;
		this.CharMap = [];
		this.AllowCharMap = false;
		//Function
		this.EvulatorHandler = null;
		this.IsParseMode = false;
		if (isfile)
        {
            this.Text = File.ReadAllText(text);
        }
        else
        {
            this.Text = text;
        }
        this.InitAll();
        if (isfile)
        {
            this.SetDir(File.GetDirName(text));
        }
		this.NeedParse = true;
		this.SpecialCharOption = TextEngine.SpecialCharType.SCT_AllowedAll;
	}
	get Text()
	{
		return this._text;
	}
	set Text(value)
	{
		this._text = value;
		this.NeedParse = true;
	}
	get EvulatorTypes()
	{
		return this._EvulatorTypes;
	}
	get SavedMacrosList()
	{
		return this._SavedMacrosList;
	}
	get TagInfos()
	{
		return this._tagInfos;
	}
	get CustomDataDictionary()
	{
		return this._customDataDictionary;
	}
	get LocalVariables()
	{
		return this._localVariables;
	}
    GetHandler()
    {
        return (this.EvulatorHandler == null) ? null : this.EvulatorHandler();
    }
    ApplyXMLSettings()
    {
        this.SupportCDATA = true;
        this.SupportExclamationTag = true;
        this.LeftTag = '<';
        this.RightTag = '>';
        this.AllowXMLTag = true;
        this.TrimStartEnd = true;
        this.NoParseEnabled = false;
        this.DecodeAmpCode = true;
        this.TrimMultipleSpaces = true;

    }
   
    OnTagClosed(element)
    {
        if (!this.AllowParseCondition || !this.IsParseMode || ((element.GetTagFlags() & TextEngine.TextElementFlags.TEF_ConditionalTag) != 0)) return;
        element.Parent.EvulateValue(element.Index, element.Index + 1);
    }
    InitAll()
    {
        this.ClearAllInfos();
        this.InitEvulator();
        this.InitAmpMaps();
        this.InitStockTagOptions();
    }

    InitStockTagOptions()
    {
        //* default flags;
        this.TagInfos.Get("*").Flags = TextEngine.TextElementFlags.TEF_NONE;
        this.TagInfos.Get("elif").Flags = TextEngine.TextElementFlags.TEF_AutoClosedTag | TextEngine.TextElementFlags.TEF_NoAttributedTag;
        this.TagInfos.Get("else").Flags = TextEngine.TextElementFlags.TEF_AutoClosedTag;
        this.TagInfos.Get("return").Flags = TextEngine.TextElementFlags.TEF_AutoClosedTag;
        this.TagInfos.Get("break").Flags = TextEngine.TextElementFlags.TEF_AutoClosedTag;
        this.TagInfos.Get("continue").Flags = TextEngine.TextElementFlags.TEF_AutoClosedTag;
        this.TagInfos.Get("include").Flags = TextEngine.TextElementFlags.TEF_AutoClosedTag | TextEngine.TextElementFlags.TEF_ConditionalTag;
        this.TagInfos.Get("cm").Flags = TextEngine.TextElementFlags.TEF_AutoClosedTag;
        this.TagInfos.Get("set").Flags = TextEngine.TextElementFlags.TEF_AutoClosedTag | TextEngine.TextElementFlags.TEF_ConditionalTag;
        this.TagInfos.Get("unset").Flags = TextEngine.TextElementFlags.TEF_AutoClosedTag | TextEngine.TextElementFlags.TEF_ConditionalTag;
        this.TagInfos.Get("if").Flags = TextEngine.TextElementFlags.TEF_NoAttributedTag | TextEngine.TextElementFlags.TEF_ConditionalTag;
        this.TagInfos.Get("noparse").Flags = TextEngine.TextElementFlags.TEF_NoParse;
		this.TagInfos.Get("while").Flags = TextEngine.TextElementFlags.TEF_NoAttributedTag;
		this.TagInfos.Get("do").Flags = TextEngine.TextElementFlags.TEF_NoAttributedTag;
    }
    InitEvulator()
    {
        this.EvulatorTypes.Param = () => new TextEngine.Evulator.ParamEvulator();
        this.EvulatorTypes.GeneralType =  () => new TextEngine.Evulator.GeneralEvulator();
        this.EvulatorTypes.Text =  () => new TextEngine.Evulator.TexttagEvulator();
        this.EvulatorTypes.SetType("if", () => new TextEngine.Evulator.IfEvulator);
        this.EvulatorTypes.SetType("for", () => new TextEngine.Evulator.ForEvulator());
        this.EvulatorTypes.SetType("foreach",() => new  TextEngine.Evulator.ForeachEvulator());
        this.EvulatorTypes.SetType("switch",() => new  TextEngine.Evulator.SwitchEvulator());
        this.EvulatorTypes.SetType("return",() => new  TextEngine.Evulator.ReturnEvulator());
        this.EvulatorTypes.SetType("break",() => new  TextEngine.Evulator.BreakEvulator());
        this.EvulatorTypes.SetType("continue",() => new  TextEngine.Evulator.ContinueEvulator());
        this.EvulatorTypes.SetType("cm",() => new  TextEngine.Evulator.CallMacroEvulator());
        this.EvulatorTypes.SetType("macro",() => new  TextEngine.Evulator.MacroEvulator());
        this.EvulatorTypes.SetType("repeat",() => new  TextEngine.Evulator.RepeatEvulator());
        this.EvulatorTypes.SetType("noprint",() => new  TextEngine.Evulator.NoPrintEvulator());
        this.EvulatorTypes.SetType("set",() => new  TextEngine.Evulator.SetEvulator());
        this.EvulatorTypes.SetType("unset",() => new  TextEngine.Evulator.UnsetEvulator());
        this.EvulatorTypes.SetType("include",() => new  TextEngine.Evulator.IncludeEvulator());
		this.EvulatorTypes.SetType("while",() => new  TextEngine.Evulator.WhileEvulator());
		this.EvulatorTypes.SetType("do",() => new  TextEngine.Evulator.DoEvulator());
    }
    InitAmpMaps()
    {
        this.AmpMaps["nbsp"] = " ";
        this.AmpMaps["amp"] = "&";
        this.AmpMaps["quot"] = "\"";
        this.AmpMaps["lt"] = "<";
        this.AmpMaps["gt"] = ">";
    }
	Parse(baselement = undefined, text = undefined)
    {
		
        let parser = new TextEngine.TextEvulatorParser(this);
		if(baselement != undefined && text != undefined)
		{
			parser.Parse(baselement, text);
		}
		else
		{
			parser.Parse(this.Elements, this.Text);
			this.NeedParse = false;
		}
    }
    SetDir(dir)
    {
        this.LocalVariables.SetValue("_DIR_", dir);
    }
	ClearAllInfos()
    {
        this.TagInfos.Clear();
        this.EvulatorTypes.Clear();
        this.AmpMaps = [];
        this.EvulatorTypes.Param = null;
        this.EvulatorTypes.Text = null;
        this.EvulatorTypes.GeneralType = null;
    }
    ClearElements()
    {
        this.Elements.SubElements.Clear();
        this.Elements.ElemName = "#document";
        this.Elements.ElementType = TextEngine.TextElementType.Document;
    }
    EvulateValue(vars = null, autoparse = true)
	{
		if (autoparse && this.NeedParse) this.Parse();
		return this.Elements.EvulateValue(0, 0, vars);
	}
}
//End TextEngine/Text/TextEvulator.js

//Start TextEngine/Text/TextEvulatorParser.js
TextEngine.TextEvulatorParser = class TextEvulatorParser
{
	constructor(baseevulator)
	{
		this.Text = "";
		this.pos = 0;
		this.in_noparse = false;
		this.noparse_tag = "";
		this._evulator = baseevulator;
	}

    get TextLength()
    {
		return this.Text.length;
    }
	get Evulator()
	{
		return this._evulator;
	}
    Parse(baseitem, text)
    {
        this.Text = text;
        this.Evulator.IsParseMode = true;
        let currenttag = null;
        if (baseitem == null)
        {
            currenttag = this.Evulator.Elements;
        }
        else
        {
            currenttag = baseitem;
        }
        currenttag.BaseEvulator = this.Evulator;
        for (let i = 0; i < this.TextLength; i++)
        {
            let tag = this.ParseTag(i, currenttag);
            if (tag == null || String.IsNullOrEmpty(tag.ElemName))
            {
                i = this.pos;
                continue;
            }
            if (!tag.SlashUsed)
            {
                currenttag.AddElement(tag);
                if (tag.DirectClosed)
                {
                    this.Evulator.OnTagClosed(tag);
                }
            }
            if (tag.SlashUsed)
            {
                let prevtag = this.GetNotClosedPrevTag(tag);
                //$alltags = $this->GetNotClosedPrevTagUntil($tag, $tag->elemName);
                // int total = 0;
                /** @var TextEngine.TextElement $baseitem */
                let previtem = null;
                while (prevtag != null)
                {
                    if (!prevtag.NameEquals(tag.ElemName, true))
                    {
						let elem = new TextEngine.TextElement();
						elem.ElemName
						elem.ElemName = prevtag.ElemName;
						elem.ElemAttr = prevtag.ElemAttr.Clone();
						elem.AutoAdded = true;
						elem.BaseEvulator = this.Evulator;
                        prevtag.Closed = true;
                        if (previtem != null)
                        {
                            previtem.Parent = elem;
                            elem.AddElement(previtem);
                        }
                        else
                        {
                            currenttag = elem;
                        }
                        previtem = elem;

                    }
                    else
                    {
                        if (prevtag.ElemName != tag.ElemName)
                        {
                            prevtag.AliasName = tag.ElemName;
                            //Alias
                        }
                        if (previtem != null)
                        {
                            previtem.Parent = prevtag.Parent;
                            previtem.Parent.AddElement(previtem);
                        }
                        else
                        {
                            currenttag = prevtag.Parent;
                        }
                        prevtag.Closed = true;
                        break;
                    }
                    prevtag = this.GetNotClosedPrevTag(prevtag);


                }
                if (prevtag == null && this.Evulator.ThrowExceptionIFPrevIsNull && !this.Evulator.SurpressError)
                {
                    this.Evulator.IsParseMode = false;
                    throw new Error("Syntax Error");
                }
            }
            else if (!tag.Closed)
            {
                currenttag = tag;
            }
            i = this.pos;
        }
        this.pos = 0;
        this.in_noparse = false;
        this.noparse_tag = "";
        this.Evulator.IsParseMode = false;
    }
    GetNotClosedPrevTagUntil(tag, name)
    {
        let array = new TextEngine.TextElements();
        let stag = this.GetNotClosedPrevTag(tag);
        while (stag != null)
        {
            if (stag.ElemName == name)
            {
                array.Add(stag);
                break;
            }
            array.Add(stag);
            stag = this.GetNotClosedPrevTag(stag);
        }
        return array;
    }
    GetNotClosedPrevTag(tag)
    {
        let parent = tag.Parent;
        while (parent != null)
        {
            if (parent.Closed || parent.ElemName == "#document")
            {
                return null;
            }
            return parent;
        }
        return null;
    }
    GetNotClosedTag(tag, name)
    {
        let parent = tag.Parent;
        while (parent != null)
        {
            if (parent.Closed) return null;
            if (parent.NameEquals(name))
            {
                return parent;
            }
            parent = parent.Parent;
        }
        return null;
    }
    DecodeAmp(start, decodedirect = true)
    {
        let current = new Common.StringBuilder();
        for (let i = start; i < this.TextLength; i++)
        {
            let cur = this.Text[i];
            if (cur == ';')
            {
                this.pos = i;
                if (decodedirect)
                {
					let item = this.Evulator.AmpMaps[current.ToString()];
                    if (item != undefined)
                    {
                        return item;
                    }
                }
                else
                {
                    return current.ToString();
                }

                return null;
            }
            if (!String.IsLetterOrDigit(cur))
            {
                break;
            }
            current.Append(cur);
        }
        this.pos = this.TextLength;
        return '&' + current.ToString();
    }
    ParseTag(start, parent = null)
    {
        let inspec = false;
        let tagElement = new TextEngine.TextElement();
		tagElement.Parent = parent;
		tagElement.BaseEvulator = this.Evulator;
        let istextnode = false;
        let intag = false;
        for (let i = start; i < this.TextLength; i++)
        {
            if (this.Evulator.NoParseEnabled && this.in_noparse)
            {
                istextnode = true;
                tagElement.SetTextTag(true);
            }
            else
            {
                let cur = this.Text[i];
                if (!inspec)
                {
                    if (cur == this.Evulator.LeftTag)
                    {
                        if (intag)
                        {
                            if (this.Evulator.SurpressError)
                            {
                                tagElement.SetTextTag(true);
                                tagElement.Value = this.Text.Substring(start, i - start);
                                this.pos = i - 1;
                                return tagElement;
                            }
                            else
                            {
                                this.Evulator.IsParseMode = false;
                                throw new Error("Syntax Error");
                            }
                        }
                        intag = true;
                        continue;
                    }
                    else if (this.Evulator.DecodeAmpCode && cur == '&')
                    {
                        let ampcode = this.DecodeAmp(i + 1, false);
                        i = this.pos;
                        tagElement.SetTextTag(true);
                        tagElement.ElementType = TextEngine.TextElementType.EntityReferenceNode;
                        if (ampcode.StartsWith("&") && this.Evulator.SurpressError)
                        {
                            if (this.Evulator.SurpressError)
                            {
                                tagElement.ElementType = TextEngine.TextElementType.TextNode;
                            }
                            else
                            {
                                this.Evulator.IsParseMode = false;
                                throw new Error("Syntax Error");
                            }
                        }
                        tagElement.AutoClosed = true;
                        tagElement.Value = ampcode;
                        return tagElement;
                    }
                    else
                    {
                        if (!intag)
                        {
                            istextnode = true;
                            tagElement.SetTextTag(true);
                        }
                    }
                }
                if (!inspec && cur == this.Evulator.RightTag)
                {
                    if (!intag)
                    {
                        if (this.Evulator.SurpressError)
                        {
                            tagElement.SetTextTag(true);
                            tagElement.Value = this.Text.Substring(start, i - start);
                            this.pos = i - 1;
                            return tagElement;

                        }
                        this.Evulator.IsParseMode = false;
                        throw new Error("Syntax Error");
                    }
                    intag = false;
                }
            }
            this.pos = i;
            if (!intag || istextnode)
            {
                tagElement.Value = this.ParseInner();
                if (!this.in_noparse && tagElement.ElementType == TextEngine.TextElementType.TextNode && String.IsNullOrEmpty(tagElement.Value))
                {
                    return null;
                }
                intag = false;
                if (this.in_noparse)
                {
                    parent.AddElement(tagElement);
					let elem = new TextEngine.TextElement();
					elem.Parent = parent;
					elem.ElemName = this.noparse_tag;
					elem.SlashUsed = true;
                    this.noparse_tag = "";
                    this.in_noparse = false;
                    return elem;
                }
                return tagElement;
            }
            else
            {
                this.ParseTagHeader(tagElement);
                intag = false;
                if (String.IsNullOrEmpty(tagElement.ElemName)) return null;
                if (this.Evulator.NoParseEnabled && (tagElement.GetTagFlags() & TextEngine.TextElementFlags.TEF_NoParse) > 0)
                {
                    this.in_noparse = true;
                    this.noparse_tag = tagElement.ElemName;
                }
                return tagElement;

            }
        }
        return tagElement;
    }
    ParseTagHeader(tagElement)
    {
        let inquot = false;
        let inspec = false;
        let current = new Common.StringBuilder();
        let namefound = false;
        //bool inattrib = false;
        let firstslashused = false;
        let lastslashused = false;
        let currentName = new Common.StringBuilder();
        let quoted = false;
        let quotchar = '\0';
        let initial = false;
        let istagattrib = false;
        for (let i = this.pos; i < this.TextLength; i++)
        {
            let cur = this.Text[i];
            if (inspec)
            {
                inspec = false;
                current.Append(cur);
                continue;
            }
            let next = '\0';
            let next2 = '\0';
            if (i + 1 < this.TextLength)
            {
                next = this.Text[i + 1];
            }
            if (i + 2 < this.TextLength)
            {
                next2 = this.Text[i + 2];
            }
            if (tagElement.ElementType == TextEngine.TextElementType.CDATASection)
            {
                if (cur == ']' && next == ']' && next2 == this.Evulator.RightTag)
                {
                    tagElement.Value = current.ToString();
                    this.pos = i += 2;
                    return;
                }
                current.Append(cur);
                continue;
            }
            if (this.Evulator.AllowXMLTag && cur == '?' && !namefound && current.Length == 0)
            {
                tagElement.Closed = true;
                tagElement.AutoClosed = true;
                tagElement.ElementType = TextEngine.TextElementType.XMLTag;
                continue;

            }
            if (this.Evulator.SupportExclamationTag && cur == '!' && !namefound && current.Length == 0)
            {
                tagElement.Closed = true;
                tagElement.AutoClosed = true;
                if (i + 8 < this.TextLength)
                {
                    var mtn = this.Text.Substring(i, 8);
                    if (this.Evulator.SupportCDATA && mtn == "![CDATA[")
                    {
                        tagElement.ElementType = TextEngine.TextElementType.CDATASection;
                        tagElement.ElemName = "#cdata";
                        namefound = true;
                        i += 7;
                        continue;
                    }
                }
            }
            if (cur == '\\' && tagElement.ElementType != TextEngine.TextElementType.CommentNode)
            {
                if (!namefound && tagElement.ElementType != TextEngine.TextElementType.Parameter)
                {
                    if (this.Evulator.SurpressError) continue;
                    this.Evulator.IsParseMode = false;
                    throw new Error("Syntax Error");
                }
                inspec = true;
                continue;
            }
            if (!initial && cur == '!' && next == '-' && next2 == '-')
            {
                tagElement.ElementType = TextEngine.TextElementType.CommentNode;
                tagElement.ElemName = "#summary";
                tagElement.Closed = true;
                i += 2;
                continue;
            }
            if (tagElement.ElementType == TextEngine.TextElementType.CommentNode)
            {
                if (cur == '-' && next == '-' && next2 == this.Evulator.RightTag)
                {
                    tagElement.Value = current.ToString();
                    this.pos = i + 2;
                    return;
                }
                else
                {
                    current.Append(cur);
                }
                continue;
            }
            initial = true;
            if (this.Evulator.DecodeAmpCode && tagElement.ElementType != TextEngine.TextElementType.CommentNode && cur == '&')
            {
                current.Append(this.DecodeAmp(i + 1));
                i = this.pos;
                continue;
            }

            if ((tagElement.ElementType == TextEngine.TextElementType.Parameter && this.Evulator.ParamNoAttrib)
                 || (namefound && tagElement.NoAttrib) || (istagattrib && tagElement.HasFlag(TextEngine.TextElementFlags.TEF_TagAttribonly)))
            {
                if ((cur != this.Evulator.RightTag && tagElement.ElementType == TextEngine.TextElementType.Parameter) || cur != this.Evulator.RightTag && (cur != '/' && next != this.Evulator.RightTag || tagElement.HasFlag(TextEngine.TextElementFlags.TEF_DisableLastSlash) ))
                {
					
                    current.Append(cur);
                    continue;
                }
            }
            if (firstslashused && namefound)
            {
                if (cur != this.Evulator.RightTag)
                {
                    if (cur == ' ' && next != '\t' && next != ' ')
                    {
                        if (this.Evulator.SurpressError) continue;
                        this.Evulator.IsParseMode = false;
                        throw new Error("Syntax Error");
                    }
                }
            }
            if (cur == '"' || cur == '\'')
            {
                if (!namefound || currentName.Length == 0)
                {
                    if (this.Evulator.SurpressError) continue;
                    this.Evulator.IsParseMode = false;
                    throw new Error("Syntax Error");
                }
                if (inquot && cur == quotchar)
                {
                    if (istagattrib)// if (currentName.ToString() == "##set_TAG_ATTR##")
                    {
                        tagElement.TagAttrib = current.ToString();
                        istagattrib = false;

                    }
                    else if (currentName.Length > 0 && !tagElement.HasFlag(TextEngine.TextElementFlags.TEF_TagAttribonly))
                    {

                        tagElement.ElemAttr.SetAttribute(currentName.ToString(), current.ToString());
                    }
                    currentName.Clear();
                    current.Clear();
                    inquot = false;
                    quoted = true;
                    continue;
                }
                else if (!inquot)
                {
                    quotchar = cur;
                    inquot = true;
                    continue;
                }


            }
            if (!inquot)
            {
                if (cur == this.Evulator.ParamChar && !namefound && !firstslashused)
                {
                    tagElement.ElementType = TextEngine.TextElementType.Parameter;
                    tagElement.Closed = true;
                    continue;
                }
                if (cur == '/')
                {
                    if (!namefound && current.Length > 0)
                    {
                        namefound = true;
                        tagElement.ElemName = current.ToString();
                        current.Clear();
                    }
                    if (namefound)
                    {
                        if (next == this.Evulator.RightTag && (curFlags & !tagElement.HasFlag(TextEngine.TextElementFlags.TEF_DisableLastSlash)))
                        {
                            lastslashused = true;
                        }

                    }
                    else
                    {
                        firstslashused = true;
                    }
                    if (tagElement.HasFlag(TextEngine.TextElementFlags.TEF_DisableLastSlash))
                    {
                        current.Append(cur);
                    }
                    continue;
                }
                if (cur == '=')
                {
                    if (namefound)
                    {
                        if (istagattrib)
                        {
                            current.Append(cur);
                        }
                        else
                        {
                            if (current.Length == 0)
                            {
                                if (this.Evulator.SurpressError) continue;
                                this.Evulator.IsParseMode = false;
                                throw new Error("Syntax Error");
                            }
                            currentName.Clear();
                            currentName.Append(current.ToString());
                            current.Clear();
                        }
                    }
                    else
                    {
                        namefound = true;
                        tagElement.ElemName = current.ToString();
                        current.Clear();
                        currentName.Clear();
                        istagattrib = true;
                    }
                    continue;
                }
                if (tagElement.ElementType == TextEngine.TextElementType.XMLTag)
                {
                    if (cur == '?' && next == this.Evulator.RightTag)
                    {
                        cur = next;
                        i++;
                    }
                }

                if (cur == this.Evulator.LeftTag)
                {
                    if (this.Evulator.SurpressError) continue;

                    this.Evulator.IsParseMode = false;
                    throw new Error("Syntax Error");
                }
                if (cur == this.Evulator.RightTag)
                {
                    if (!namefound)
                    {
                        tagElement.ElemName = current.ToString();
                        current.Clear();
                    }
                    if (tagElement.NoAttrib)
                    {
                        tagElement.Value = current.ToString();
                    }
                    else if (istagattrib) //(currentName.ToString() == "##set_TAG_ATTR##")
                    {
                        tagElement.TagAttrib = current.ToString();
                        istagattrib = false;
                    }
                    else if (currentName.Length > 0 && !tagElement.HasFlag(TextEngine.TextElementFlags.TEF_TagAttribonly))
                    {
                        tagElement.SetAttribute(currentName.ToString(), current.ToString());
                    }
                    else if (current.Length > 0 && !tagElement.HasFlag(TextEngine.TextElementFlags.TEF_TagAttribonly))
                    {
                        tagElement.SetAttribute(current.ToString(), null);
                    }
                    tagElement.SlashUsed = firstslashused;
                    if (lastslashused)
                    {
                        tagElement.DirectClosed = true;
                        tagElement.Closed = true;
                    }
                    let elname = tagElement.ElemName.toLowerCase();
                    if ((this.Evulator.TagInfos.GetElementFlags(elname) & TextEngine.TextElementFlags.TEF_AutoClosedTag) != 0)
                    {

                        tagElement.Closed = true;
                        tagElement.AutoClosed = true;
                    }
                    this.pos = i;
                    return;
                }
                if (cur == ' ')
                {
	
                    if (next == ' ' || next == '\t' || next == this.Evulator.RightTag) continue;
                    if (!namefound && !empty(current.ToString()))
                    {
		
                        namefound = true;
                        tagElement.ElemName = current.ToString();
                        current.Clear();


                    }
                    else if (namefound)
                    {
                        if (istagattrib) //(currentName.ToString() == "##set_TAG_ATTR##")
                        {
                            tagElement.TagAttrib = current.ToString();
                            quoted = false;
                            currentName.Clear();
                            current.Clear();
                            istagattrib = false;
                        }
                        else if (!empty(currentName) && !tagElement.HasFlag(TextEngine.TextElementFlags.TEF_TagAttribonly))
                        {
                            tagElement.SetAttribute(currentName.ToString(), current.ToString());
                            currentName.Clear();
                            current.Clear();
                            quoted = false;
                        }
                        else if (!empty(current) && !tagElement.HasFlag(TextEngine.TextElementFlags.TEF_TagAttribonly))
                        {
                            tagElement.SetAttribute(current.ToString(), null);
                            current.Clear();
                            quoted = false;
                        }
                    }
                    continue;
                }
            }
            current.Append(cur);
        }
        this.pos = this.TextLength;
    }
    ParseInner()
    {
        let text = new Common.StringBuilder();
        let inspec = false;
        let nparsetext = new Common.StringBuilder();
        let parfound = false;
        let waitspces = new Common.StringBuilder();

        for (let i = this.pos; i < this.TextLength; i++)
        {
            let cur = this.Text[i];
            let next = (i + 1 < this.TextLength) ? this.Text[i + 1] : '\0';
            if (inspec)
            {
                inspec = false;
                text.Append(cur);
                continue;
            }
            if (cur == '\\')
            {
				if (this.Evulator.SpecialCharOption == TextEngine.SpecialCharType.SCT_AllowedAll ||  (this.Evulator.SpecialCharOption == TextEngine.SpecialCharType.SCT_AllowedClosedTagOnly && next == this.Evulator.RightTag))
				{
					inspec = true;
					continue;
				}
            }
            if (this.Evulator.AllowCharMap && cur != this.Evulator.LeftTag && cur != this.Evulator.RightTag && this.Evulator.CharMap.Keys.Count > 0)
            {
				let map = this.Ev.CharMap[cur];
				if(map != undefined)
				{
					if (parfound)
                    {
                        nparsetext.Append(str);
                    }
                    else
                    {
                        text.Append(str);
                    }
				}
            }
            if (this.Evulator.NoParseEnabled && this.in_noparse)
            {
                if (parfound)
                {
                    if (cur == this.Evulator.LeftTag || cur == '\r' || cur == '\n' || cur == '\t' || cur == ' ')
                    {
                        text.Append(this.Evulator.LeftTag + nparsetext.ToString());
                        parfound = (cur == this.Evulator.LeftTag);
                        nparsetext.Clear();
                    }
                    else if (cur == this.Evulator.RightTag)
                    {
                        if (nparsetext.ToString().toLowerCase() == '/' + this.noparse_tag.toLowerCase())
                        {
                            parfound = false;
                            this.pos = i;
                            if (this.Evulator.TrimStartEnd)
                            {
                                return text.ToString().Trim();
                            }
                            return text.ToString();
                        }
                        else
                        {
                            text.Append(this.Evulator.LeftTag + nparsetext.ToString() + cur);
                            parfound = false;
                            nparsetext.Clear();
                        }
                        continue;
                    }

                }
                else
                {
                    if (cur == this.Evulator.LeftTag)
                    {
                        parfound = true;
                        continue;
                    }
                }
            }
            else
            {
                if (!inspec && cur == this.Evulator.LeftTag || this.Evulator.DecodeAmpCode && cur == '&')
                {
                    this.pos = i - 1;
                    if (this.Evulator.TrimStartEnd)
                    {
                        return text.ToString().Trim();
                    }
                    return text.ToString();
                }
            }
            if (parfound)
            {
                nparsetext.Append(cur);
            }
            else
            {
                if (this.Evulator.TrimMultipleSpaces)
                {
                    if (cur == ' ' && next == ' ') continue;
                }
                text.Append(cur);
            }
        }
        this.pos = this.TextLength;
        if (this.Evulator.TrimStartEnd)
        {
            return text.ToString().Trim();
        }
        return text.ToString();
    }
}
//End TextEngine/Text/TextEvulatorParser.js

//Start TextEngine/XPathClasses/IXPathBlockContainer.js
﻿TextEngine.XPathClasses.IXPathBlockContainer = class IXPathBlockContainer
{
	constructor()
	{
		this.XPathBlockList = null;
		this.Parent = null;
	}
	IsXPathPar()
	{
		return false;
	}
}

//End TextEngine/XPathClasses/IXPathBlockContainer.js

//Start TextEngine/XPathClasses/IXPathExpressionItem.js
﻿TextEngine.XPathClasses.IXPathExpressionItem = class IXPathExpressionItem 
{
	constructor()
	{

	}
}


//End TextEngine/XPathClasses/IXPathExpressionItem.js

//Start TextEngine/XPathClasses/IXPathExpressionItems.js
﻿TextEngine.XPathClasses.IXPathExpressionItems = class IXPathExpressionItems extends TextEngine.XPathClasses.IXPathExpressionItem
{
	constructor()
	{
		super();
		this.XPathExpressions = null;
	}
}

//End TextEngine/XPathClasses/IXPathExpressionItems.js

//Start TextEngine/XPathClasses/IXPathList.js
﻿TextEngine.XPathClasses.IXPathList = class IXPathList extends Common.CollectionBase
{
	constructor()
	{
		super();
	}
	IsBlocks() {return false;}
	Any()  {return false;}
	IsOr() {return false;}
}

//End TextEngine/XPathClasses/IXPathList.js

//Start TextEngine/XPathClasses/XPathActions.js
﻿TextEngine.XPathClasses.XPathActions = class XPathActions
{
	constructor()
	{
		this.XPathFunctions = null;
	}
    static XExpressionSuccess(item, expressions, baselist = null, curindex = -1, totalcounts = -1)
    {
		let actions = new TextEngine.XPathClasses.XPathActions();
		actions.XPathFunctions = new TextEngine.XPathClasses.XPathFunctions();
        actions.XPathFunctions.BaseItem = item;
        if (totalcounts != -1)
        {
            actions.XPathFunctions.TotalItems = totalcounts;
        }
        else
        {
            if (baselist != null)
            {
                actions.XPathFunctions.TotalItems = baselist.Count;
            }
            else
            {
                actions.XPathFunctions.TotalItems = item.Parent.SubElementsCount;
            }
        }

        if (curindex != -1)
        {
            actions.XPathFunctions.ItemPosition = curindex;
        }
        else
        {
            actions.XPathFunctions.ItemPosition = item.Index;
        }
        let result = null;
        if (expressions instanceof TextEngine.XPathClasses.XPathExpression)
        {
            result = actions.EvulateActionSingle(expressions);

        }
        else if (expressions instanceof ITextEngine.XPathClasses.IXPathExpressionItems)
        {
            result = actions.EvulateAction(expressions);

        }
        if (result.GetItem(0) == null || (is_bool(result.GetItem(0))) && !result.GetItem(0))
        {
            return false;
        }
        else if (!isNaN(result[0]))
        {
            let c =  parseInt(result[0]);
            let totalcount = 0;
            if (totalcounts != -1)
            {
                totalcount = totalcounts;
            }
            else
            {
                if (baselist != null)
                {
                    totalcount = baselist.Count;

                }
                else
                {
                    totalcount = item.Parent.SubElementsCount;
                }
            }
            if (c < -1 || c >= totalcount)
            {
                return false;
            }
            else
            {
                return c == actions.XPathFunctions.ItemPosition;
            }

        }
        return true;
    }
    static Eliminate(items, expressions, issecondary = true)
    {
        let total = 0;
        let totalcount = items.Count;
        for (let i = 0; i < items.Count; i++)
        {
            let result = false;
            if (issecondary)
            {
                result = TextEngine.XPathClasses.XPathActions.XExpressionSuccess(items.GetItem(i), expressions, items, total, totalcount);
            }
            else
            {
                result = TextEngine.XPathClasses.XPathActions.XExpressionSuccess(items.GetItem(i), expressions);
            }
            if (!result)
            {
                items.RemoveAt(i);
                i--;
                total++;
                continue;
            }
            total++;

        }
        return items;
    }

    EvulateActionSingle(item, sender = null)
    {
        let curvalue = null;
        let previtem = null;
        let xoperator = null;
        let waitvalue = null;
        let waitop = null;
        let values = new Common.CollectionBase();
        for (let j = 0; j < item.XPathExpressionItems.Count; j++)
        {
            let curitem = item.XPathExpressionItems.GetItem(j);
            let nextitem = (j + 1 < item.XPathExpressionItems.Count) ? item.XPathExpressionItems.GetItem(j + 1) : null;
            let nextop = null;
            let nextExp = null;
            if (nextitem != null && !nextitem.IsSubItem)
            {
				if(nextitem instanceof TextEngine.XPathClasses.XPathExpressionItem)
				{
					nextExp = nextitem;
				}
				else
				{
					nextExp = null;
				}
                nextop = (nextExp != null && nextExp.IsOperator) ? nextExp.Value : null;
            }
            let expvalue = null;
            if (curitem.IsSubItem)
            {
                expvalue = EvulateAction(curitem);
                if (!previtem.IsSubItem)
                {
                    let prevexp = previtem;
                    if (prevexp.IsOperator)
                    {
                        expvalue = expvalue.GetItem(0);
                    }
                    else
                    {
                        if (this.XPathFunctions != null)
                        {
                            if (curitem.ParChar == '[')
                            {
                                let xitems = this.XPathFunctions.BaseItem.FindByXPath(prevexp.Value);
                                if (xitems.Count > 0)
                                {
                                    xitems = Eliminate(xitems, curitem);
                                }
                                if (xitems.Count > 0)
                                {
                                    expvalue = true;
                                }
                                else
                                {
                                    expvalue = false;
                                }
                                if (curvalue == null)
                                {
                                    curvalue = expvalue;
                                    previtem = curitem;
                                    continue;
                                }
                            }
                            else if (curitem.ParChar == '(')
                            {
                                let method = this.XPathFunctions.GetMetohdByName(prevexp.Value);
                                if (method != null)
                                {
                                    expvalue = Common.ComputeActions.CallMethodSingle(method, null, expvalue);
                                    if (curvalue == null)
                                    {
                                        curvalue = expvalue;
                                        previtem = curitem;
                                        continue;
                                    }
                                }
                            }
                        }

                    }
                }
            }
            else
            {
                let expItem = null;
				if(curitem instanceof TextEngine.XPathClasses.XPathExpressionItem)
				{
					expItem = curitem;
				}
                if (nextitem != null && nextitem.IsSubItem)
                {
                    previtem = curitem;
                    continue;
                }
                if (expItem.IsOperator)
                {
                    if (expItem.Value == ",")
                    {
                        if (waitop != null)
                        {
                            curvalue = Common.ComputeActions.OperatorResult(waitvalue, curvalue, waitop);
                            waitvalue = null;
                            waitop = null;
                        }
                        values.Add(curvalue);
                        curvalue = null;
                        xoperator = null;
                        continue;
                    }
                    let opstr = expItem.Value;
                    if (opstr == "||" || opstr == "|" || opstr == "or" || opstr == "&&" || opstr == "&" || opstr == "and")
                    {
                        if (waitop != null)
                        {
                            curvalue = Common.ComputeActions.OperatorResult(waitvalue, curvalue, waitop);
                            waitvalue = null;
                            waitop = null;
                        }
                        state = !empty(curvalue);
                        if (opstr == "||" || opstr == "|" || opstr == "or")
                        {
                            if (state)
                            {
                                values.Add(true);
                                return values;
                            }
                            else curvalue = null;
                        }
                        else
                        {
                            if (!state)
                            {
                                values.Add(false);
                                return values;
                            }
                            else curvalue = null;
                        }
                        xoperator = null;
                    }
                    else
                    {
                        xoperator = expItem;
                    }

                    previtem = curitem;
                    continue;
                }
                else
                {
                    if (expItem.IsVariable)
                    {
                        if (expItem.Value.startsWith("@"))
                        {
                            let s = expItem.Value.SubString(1);

                            if ((nextExp == null || !nextExp.IsOperator) && (sender == null || !sender.IsSubItem || sender.ParChar != '('))
                            {
                                expvalue = this.XPathFunctions.BaseItem.ElemAttr.HasAttribute(s);
                            }
                            else
                            {
                                expvalue = this.XPathFunctions.BaseItem.GetAttribute(s);
                            }
                            if (expvalue == null) expvalue = false;
                        }
                        else
                        {
                            let items = this.XPathFunctions.BaseItem.FindByXPath(expItem.Value);
                            if (items.Count == 0)
                            {
                                expvalue = false;
                            }
                            else
                            {
                                expvalue = items.GetItem(0).Inner();
                            }
                        }
                    }
                    else
                    {
                        expvalue = expItem.Value;

                    }
                    if (curvalue == null)
                    {
                        curvalue = expvalue;
                        previtem = curitem;
                        continue;
                    }


                }
            }
            if (xoperator != null)
            {
                if (TextEngine.XPathClasses.XPathExpression.priotirystop.Contains(xoperator.Value))
                {
                    if (waitop != null)
                    {
                        curvalue = Common.ComputeActions.OperatorResult(waitvalue, curvalue, waitop);
                        waitvalue = null;
                        waitop = null;
                    }
                }
                if ((xoperator.Value != "+" && xoperator.Value != "-") || nextop == null || TextEngine.XPathClasses.XPathExpression.priotirystop.Contains(nextop))
                {
                    curvalue = Common.ComputeActions.OperatorResult(curvalue, expvalue, xoperator.Value);

                }
                else
                {
                    waitvalue = curvalue;
                    waitop = xoperator.Value;
                    curvalue = expvalue;
                }
                xoperator = null;
            }
            previtem = curitem;
        }
        if (waitop != null)
        {
            curvalue = Common.ComputeActions.OperatorResult(waitvalue, curvalue, waitop);
            waitvalue = null;
            waitop = null;
        }
        values.Add(curvalue);
        return values;
    }
    EvulateAction(item)
    {
		let values = new Common.CollectionBase();
        for (let i = 0; i < item.XPathExpressions.Count; i++)
        {
            let curExp = item.XPathExpressions.GetItem(i);
            let results = EvulateActionSingle(curExp, item);
            values.AddRange(results);
        }
        return values;
    }
}

//End TextEngine/XPathClasses/XPathActions.js

//Start TextEngine/XPathClasses/XPathBlock.js
﻿TextEngine.XPathClasses.XPathBlock = class XPathBlock extends TextEngine.XPathClasses.IXPathExpressionItems
{
	constructor()
	{
		super();
		this.XPathExpressions = new TextEngine.XPathClasses.XPathExpressions();
		this.IsAttributeSelector = false;
		this.BlockType = 0;
		this.BlockName = "";
		this.Parent = null;
	}
	get IsSubItem()
	{
		return true;
	}
	get ParChar()
	{
		return "\0";
	}
    IsXPathPar()
    {
        return false;
    }
}
//End TextEngine/XPathClasses/XPathBlock.js

//Start TextEngine/XPathClasses/XPathBlocks.js
﻿TextEngine.XPathClasses.XPathBlocks = class XPathBlocks extends TextEngine.XPathClasses.IXPathList
{
    constructor()
	{
        super();
    }
    IsBlocks()
	{
        return true;
    }
    Any()
        {
        return this.Count > 0;
    }
    IsOr()
	{
        return false;
    }
}
//End TextEngine/XPathClasses/XPathBlocks.js

//Start TextEngine/XPathClasses/XPathBlocksContainer.js
﻿TextEngine.XPathClasses.XPathBlockContainer = class XPathBlockContainer extends Common.CollectionBase
{
	constructor()
	{
		super();
	}
    Last()
    {
        if (this.Count == 0) return null;
        return this.GetItem(this.Count - 1);
    }
}
//End TextEngine/XPathClasses/XPathBlocksContainer.js

//Start TextEngine/XPathClasses/XPathEnum.js
﻿TextEngine.XPathClasses.XPathBlockType =
{
	XPathBlockScanRootElem: 0,
	XPathBlockScanAllElem: 1
};

//End TextEngine/XPathClasses/XPathEnum.js

//Start TextEngine/XPathClasses/XPathExpression.js
﻿TextEngine.XPathClasses.XPathExpression = class XPathExpression
{
	constructor()
	{
		this.XPathExpressionItems = new TextEngine.XPathClasses.XPathExpressionItems();
		this.Parent = null;
	}
    static priotirystop =
	[
            "and",
            "&&",
            "||",
            "|",
            "==",
            "=",
            ">",
            "<",
            ">=",
            "<=",
            "or",
            "+",
            "-",
            ","
	];
    static operators =
	[
            "and",
            "mod",
            "div",
            "or",
            "!=",
            "==",
            ">=",
            "<=",
            "&&",
            "||",
            "+",
            "-",
            "*",
            "/",
            "%",
            "=",
            "<",
            ">",
            ","
	];
    static Parse(input, istate, istateOut = null)
    {
		if(istateOut != null)
		{
			istateOut.state = istate;
		}
        let inquot = false;
        let quotchar = '\0';
        let inspec = false;
        let curstr = new Common.StringBuilder();
        let elem = new TextEngine.XPathClasses.XPathExpression();
        if (input[istate] == '[' || input[istate] == '(')
        {
            istate++;
			if(istateOut != null)
			{
				istateOut.state = istate;
			}
        }
        for (let i = istate; i < input.Length; i++)
        {
            let cur = input[i];
            let next = (i + 1 < input.Length) ? input[i + 1] : '\0';
            if (inspec)
            {
                inspec = false;
                curstr.Append(cur);
                continue;
            }
            if (!inquot && cur == '\'' || cur == '"')
            {
                if (curstr.Length > 0 || quotchar != '\0')
                {
					let item = new TextEngine.XPathClasses.XPathExpressionItem();
					item.QuotChar = quotchar;
					item.IsOperator = quotchar == '\0' && TextEngine.XPathClasses.XPathExpression.operators.Contains(curstr.ToString());
					item.Value = curstr.ToString();
                    elem.XPathExpressionItems.Add(item);
                }
                curstr.Clear();
                inquot = true;
                quotchar = cur;
                //curstr.Clear();
                continue;
            }
            if (inquot)
            {
                if (cur == quotchar)
                {
                    inquot = false;
                }
                else
                {
                    curstr.Append(cur);
                }
                continue;
            }

            if (cur == '\\')
            {
                inspec = true;
                continue;
            }
            if (cur == ' ' && next == ' ') continue;

            if (cur == '-' || cur == '/')
            {

                if (curstr.Length > 0 && !curstr.ToString().IsNumeric())
                {
                    curstr.Append(cur);
                    continue;
                }
            }
            if (cur != ' ' && curstr.Length > 0)
            {
                if (!TextEngine.XPathClasses.XPathExpression.operators.Contains(cur) && TextEngine.XPathClasses.XPathExpression.operators.Contains(curstr.ToString()) || TextEngine.XPathClasses.XPathExpression.operators.Contains(cur) && !TextEngine.XPathClasses.XPathExpression.operators.Contains(curstr.ToString()))
                {
                    if (curstr.Length > 0 || quotchar != '\0')
                    {
						
						let item = new TextEngine.XPathClasses.XPathExpressionItem();
						item.QuotChar = quotchar;
						item.IsOperator = quotchar == '\0' && TextEngine.XPathClasses.XPathExpression.operators.Contains(curstr.ToString());
						item.Value = curstr.ToString();
                        elem.XPathExpressionItems.Add(item);
                    }
                    curstr.Clear();
                }
            }
            if (cur == ' ' || cur == ':' || cur == ']' || cur == ')')
            {

                if (curstr.Length > 0 || quotchar != '\0')
                {
					let item = new TextEngine.XPathClasses.XPathExpressionItem();
					item.QuotChar = quotchar;
					item.IsOperator = quotchar == '\0' && TextEngine.XPathClasses.XPathExpression.operators.Contains(curstr.ToString());
					item.Value = curstr.ToString();
					elem.XPathExpressionItems.Add(item);
                }
                quotchar = '\0';
                curstr.Clear();

                if (cur == ']' || cur == ')')
                {
                    istate = i;
					if(istateOut != null)
					{
						istateOut.state = istate;
					}

                    break;
                }
                continue;
            }

            if (cur == '(' || cur == '[')
            {

                if (curstr.Length > 0 || quotchar != '\0')
                {
					let item = new TextEngine.XPathClasses.XPathExpressionItem();
					item.QuotChar = quotchar;
					item.IsOperator = quotchar == '\0' && TextEngine.XPathClasses.XPathExpression.operators.Contains(curstr.ToString());
					item.Value = curstr.ToString();
					elem.XPathExpressionItems.Add(item);
                    curstr.Clear();
                }
				let stateout = new Object();
				stateout.state = i;
                let subElem = TextEngine.XPathClasses.XPathExpression.Parse(input, i, stateout);
				i = stateout.state;
                let subitem = new TextEngine.XPathClasses.XPathExpressionSubItem();
                subitem.ParChar = cur;
                subElem.Parent = elem;
                subitem.XPathExpressions.Add(subElem);
                elem.XPathExpressionItems.Add(subitem);
                continue;
            }

            curstr.Append(cur);
        }
        if (curstr.Length > 0 || quotchar != '\0')
        {
			let item = new TextEngine.XPathClasses.XPathExpressionItem();
			item.QuotChar = quotchar;
			item.IsOperator = quotchar == '\0' && TextEngine.XPathClasses.XPathExpression.operators.Contains(curstr.ToString());
			item.Value = curstr.ToString();
            elem.XPathExpressionItems.Add(item);
        }
        return elem;
    }
}
//End TextEngine/XPathClasses/XPathExpression.js

//Start TextEngine/XPathClasses/XPathExpressionItem.js
﻿TextEngine.XPathClasses.XPathExpressionItem = class XPathExpressionItem extends TextEngine.XPathClasses.IXPathExpressionItem
{
	constructor()
	{
		super();
		this._value = null;
		this.QuotChar = "\0";
		this._isNumeric = false;
		this._isBool = false;
		this.IsOperator = false;
	}
	get IsBool()
	{
		return this._isBool;
	}
	get IsNumeric()
	{
		return this._isNumeric;
	}
	get Value()
	{
		return this._value;
	}
	set Value(value)
	{
		this._isNumeric = false;
		this._isBool = false;
		if (!this.IsOperator && this.QuotChar == '\0' && is_string(value))
		{
			if (value.IsNumeric())
			{
				value = parseFloat(value);
				this._isNumeric = true;
			}
			else if (value.IsBool())
			{
				value = value.ToBool();
				this._isBool = true;
			}
		}
		this._value = value;	
	}
	get IsVariable()
	{
		return !this.IsOperator && !this.IsNumeric && !this.IsBool && this.QuotChar == '\0';
	}
	get IsSubItem()
	{
		return false;
	}
	get ParChar()
	{
		return "\0";
	}
}
//End TextEngine/XPathClasses/XPathExpressionItem.js

//Start TextEngine/XPathClasses/XPathExpressionItems.js
﻿TextEngine.XPathClasses.XPathExpressionItems = class XPathExpressionItems extends Common.CollectionBase
{
	constructor()
	{
		super();
	}
}
//End TextEngine/XPathClasses/XPathExpressionItems.js

//Start TextEngine/XPathClasses/XPathExpressionSubItem.js
﻿TextEngine.XPathClasses.XPathExpressionSubItem = class XPathExpressionSubItem extends TextEngine.XPathClasses.IXPathExpressionItems
{
	constructor()
	{
		super();
		this.XPathExpressions = new TextEngine.XPathClasses.XPathExpressions();
		this.ParChar = '(';
	}
	get IsSubItem()
	{
		return true;
	}
}
//End TextEngine/XPathClasses/XPathExpressionSubItem.js

//Start TextEngine/XPathClasses/XPathExpressions.js
﻿TextEngine.XPathClasses.XPathExpressions = class XPathExpressions extends Common.CollectionBase
{
	constructor()
	{
		super();
	}
}

//End TextEngine/XPathClasses/XPathExpressions.js

//Start TextEngine/XPathClasses/XPathFunctions.js
﻿TextEngine.XPathClasses.XPathFunctions = class XPathFunctions
{
	constructor()
	{
		this.BaseItem = null;
		this.TotalItems = 0;
		this.ItemPosition = 0;
		this.functions = [];
	}
	SetMap(name, fn)
	{
		this.functions[name] = fn;
	}
	InitFunctionMaps()
	{
		this.SetMap("contains", this.Contains);
		this.SetMap("lower-case", this.LowerCase);
		this.SetMap("upper-case", this.UpperCase);
		this.SetMap("text", this.Text);
		this.SetMap("starts-with", this.StartsWith);
		this.SetMap("ends-with", this.EndsWith);
		this.SetMap("position", this.Position);
		this.SetMap("last", this.Last);
	}
    Contains(x, y)
    {
        return x.Contains(y);
    }
    LowerCase(x)
    {
        return x.toLowerCase();
    }
    UpperCase(x)
    {
        return x.toUpperCase();
    }
    Text()
    {
        return this.BaseItem.InnerText();
    }
    StartsWith(x, y)
    {
        return x.startsWith(y);
    }
    EndsWith(x, y)
    {
        return x.endsWith(y);
    }
    Position()
    {
        return this.BaseItem.Index;
    }
	Last()
    {
        return this.TotalItems;
    }
    GetMetohdByName(callname)
    {
		let item = this.functions[callname];
		if(item == undefined) return null;
        return item;
    }
}


//End TextEngine/XPathClasses/XPathFunctions.js

//Start TextEngine/XPathClasses/XPathItem.js
﻿TextEngine.XPathClasses.XPathItem = class XPathItem extends TextEngine.XPathClasses.IXPathBlockContainer
{
	constructor()
	{
		super();
		this.XPathBlocks = new TextEngine.XPathClasses.XPathBlocks();
		this.XPathBlockList = new TextEngine.XPathClasses.XPathBlockContainer();
		this.Parent = null;
	}
    static ParseNew(xpath)
    {
        let expisparexp = false;
        let pathitem = new TextEngine.XPathClasses.XPathItem();
        let curblock = new TextEngine.XPathClasses.XPathBlock();
        let curstr = new Common.StringBuilder();
        let current = pathitem;
        let blocks = new TextEngine.XPathClasses.XPathBlocks();
		let stateobj = new Object();
        current.XPathBlockList.Add(blocks);
        let curexp = curblock.XPathExpressions;
        for (let i = 0; i < xpath.Length; i++)
        {
            let cur = xpath[i];
            let next = (i + 1 < xpath.Length) ? xpath[i + 1] : '\0';
            if (cur == '|' || cur == ')' || cur == '(')
            {
                if (String.IsNullOrEmpty(curblock.BlockName))
                {
                    curblock.BlockName = curstr.ToString();
                }
                if (!String.IsNullOrEmpty(curblock.BlockName) || curblock.IsAttributeSelector)
                {
                    blocks.Add(curblock);
                }
                curstr.Clear();
            }
            if (cur == '[')
            {
                if (curblock.XPathExpressions.Count == 0)
                {
                    curblock.BlockName = curstr.ToString();
                    curstr.Clear();
                }
                let newexp = null;
				stateobj.state = i;
                newexp = TextEngine.XPathClasses.XPathExpression.Parse(xpath, i, stateobj);
				i = stateobj.state;
                if (!String.IsNullOrEmpty(curblock.BlockName))
                {
                    curblock.XPathExpressions.Add(newexp);
                }
                else
                {
                    curexp.Add(newexp);
                }
                continue;
            }
            else if (cur == '|' || cur == '(')
            {
                let lastitem = current.XPathBlockList.Last();
                if (lastitem != null)
                {
                    if (!lastitem.Any())
                    {
                        current.XPathBlockList.RemoveAt(current.XPathBlockList.Count - 1);
                    }
                }
                curblock = new TextEngine.XPathClasses.XPathBlock();
                curexp = curblock.XPathExpressions;
                if (cur == '(')
                {
                    let xpar = new TextEngine.XPathClasses.XPathPar();
                    xpar.Parent = current;
                    current.XPathBlockList.Add(xpar);
                    current = xpar;
                }
                else
                {
                    current.XPathBlockList.Add(new TextEngine.XPathClasses.XPathOrItem());
                }
                blocks = new TextEngine.XPathClasses.XPathBlocks();
                current.XPathBlockList.Add(blocks);
                continue;
            }
            else if (cur == ')')
            {
                let lastitem = current.XPathBlockList.Last();
                if (lastitem != null)
                {
                    if (!lastitem.Any())
                    {
                        current.XPathBlockList.RemoveAt(current.XPathBlockList.Count - 1);
                    }
                }
                curexp = current.XPathExpressions;
                current = current.Parent;
                expisparexp = true;
                if (current == null)
                {
                    throw new Error("Syntax error");
                }
                blocks = new TextEngine.XPathClasses.XPathBlocks();
                current.XPathBlockList.Add(blocks);
                // current.XPathBlockList.Add(blocks);
                curblock = new TextEngine.XPathClasses.XPathBlock();
                continue;
            }
            else if (cur == '/')
            {

                if (String.IsNullOrEmpty(curblock.BlockName))
                {
                    curblock.BlockName = curstr.ToString();
                }
                if (String.IsNullOrEmpty(curblock.BlockName))
                {
                    if (next == '/')
                    {
                        curblock.BlockType = TextEngine.XPathClasses.XPathBlockType.XPathBlockScanAllElem;
                        i += 1;
                    }
                }
                else
                {
                    blocks.Add(curblock);
                    curblock = new TextEngine.XPathClasses.XPathBlock();
                    if (next == '/')
                    {
                        curblock.BlockType = TextEngine.XPathClasses.XPathBlockType.XPathBlockScanAllElem;
                    }
                    curstr.Clear();
                }
                if (expisparexp)
                {
                    curexp = curblock.XPathExpressions;
                    expisparexp = false;
                }
                continue;
            }
            else if (cur == '@')
            {
                if (String.IsNullOrEmpty(curblock.BlockName))
                {
                    curblock.IsAttributeSelector = true;
                }
                else
                {
                    throw new Error("Syntax Error");
                }
                continue;
            }
            else
            {

            }
            curstr.Append(cur);
        }
        if (String.IsNullOrEmpty(curblock.BlockName))
        {
            curblock.BlockName = curstr.ToString();

        }
        if (!String.IsNullOrEmpty(curblock.BlockName) || curblock.IsAttributeSelector)
        {
            blocks.Add(curblock);
            //current.XPathBlockList.Add(curblock);
        }
        let sonitem = current.XPathBlockList.Last();
        if (sonitem != null)
        {
            if (!sonitem.Any())
            {
                current.XPathBlockList.RemoveAt(current.XPathBlockList.Count - 1);
            }
        }
        return pathitem;
    }
    static Parse(xpath)
    {
        let pathitem = new TextEngine.XPathClasses.XPathItem();
        let curblock = new TextEngine.XPathClasses.XPathBlock();
        let curexp = null;
        let curstr = new Common.StringBuilder();
		let stateobj = new Object();
		
        for (let i = 0; i < xpath.Length; i++)
        {
            let cur = xpath[i];
            let next = (i + 1 < xpath.Length) ? xpath[i + 1] : '\0';
            if (cur == '[')
            {
                if (curblock.XPathExpressions.Count == 0)
                {
                    curblock.BlockName = curstr.ToString();
                    curstr.Clear();
                }
				stateobj.state = i;
                curexp = TextEngine.XPathClasses.XPathExpression.Parse(xpath, i, stateobj);
				i = stateobj.state;
                curblock.XPathExpressions.Add(curexp);
                curexp = null;
                continue;
            }
            else if (cur == '/')
            {
                if (String.IsNullOrEmpty(curblock.BlockName))
                {
                    curblock.BlockName = curstr.ToString();
                }
                if (String.IsNullOrEmpty(curblock.BlockName))
                {
                    if (next == '/')
                    {
                        curblock.BlockType = TextEngine.XPathClasses.XPathBlockType.XPathBlockScanAllElem;
                        i += 1;
                    }
                }
                else
                {
                    pathitem.XPathBlocks.Add(curblock);
                    curblock = new TextEngine.XPathClasses.XPathBlock();
                    if (next == '/')
                    {
                        curblock.BlockType = TextEngine.XPathClasses.XPathBlockType.XPathBlockScanAllElem;
                    }
                    curstr.Clear();
                }
                continue;
            }
            else if (cur == '@')
            {
                if (String.IsNullOrEmpty(curblock.BlockName))
                {
                    curblock.IsAttributeSelector = true;
                }
                else
                {
                    throw new Error("Syntax Error");
                }
                continue;
            }
            curstr.Append(cur);
        }
        if (String.IsNullOrEmpty(curblock.BlockName))
        {
            curblock.BlockName = curstr.ToString();

        }
        if (!String.IsNullOrEmpty(curblock.BlockName) || curblock.IsAttributeSelector)
        {
            pathitem.XPathBlocks.Add(curblock);
        }
        return pathitem;
    }
    IsXPathPar()
    {
        return true;
    }
}
//End TextEngine/XPathClasses/XPathItem.js

//Start TextEngine/XPathClasses/XPathOrItem.js
﻿TextEngine.XPathClasses.XPathOrItem = class XPathOrItem extends TextEngine.XPathClasses.IXPathList
{
	constructor()
	{
		super();
	}
	get XPathBlockList()
	{
		return null;
	}
	get Parent()
	{
		return null;
	}
 
    Any()
    {
        return true;
    }
	IsBlocks()
    {
        return false;
    }
    IsOr()
    {
        return true;
    }
    IsXPathPar()
    {
        return false;
    }
}
//End TextEngine/XPathClasses/XPathOrItem.js

//Start TextEngine/XPathClasses/XPathPar.js
﻿TextEngine.XPathClasses.XPathPar = class XPathPar extends TextEngine.XPathClasses.IXPathList
{
	constructor()
	{
		super();
		this.Parent = null;
        this.XPathExpressions = new TextEngine.XPathClasses.XPathExpressions();
        this.XPathBlockList = new TextEngine.XPathClasses.XPathBlockContainer();
	}
	get IsSubItem()
	{
		return false;
	}
	get ParChar()
	{
		return "\0";
	}
    IsXPathPar()
    {
        return true;
    }
    IsBlocks()
    {
        return false;
    }
    Any()
    {
        return this.XPathBlockList.Count > 0 || this.XPathExpressions.Count > 0;
    }
    IsOr()
    {
        return false;
    }
}

//End TextEngine/XPathClasses/XPathPar.js

//Start TextEngine\te_end.js
if(typeof module != "undefined") module.exports = TextEngine;
//End TextEngine\te_end.js


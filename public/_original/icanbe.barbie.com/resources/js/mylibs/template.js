/**
 * @author Jasper Palfree
 * 
 * usage:
 * var filter = function(w){
 * 	return w.replace(/([^c])ei/g,'$1ie');
 * };
 * var obj = {name: 'jasper', drink: 'coffee', word: 'weird'};
 * var tpl = 'Hi,<br/>my name is {{name}} and I like to drink {{drink}}. Here is something: {{{word}}}';
 * var str = template(tpl,obj,filter);
 * document.querySelectorAll('#hello')[0].innerHTML = str;
 */


var template = function(t, d, filter) {
	var data = d;
	var ret = t;

	var segments = ret.match(/\{?\{\{[a-zA-Z$_][a-zA-Z0-9_.$]*\}\}\}?/g);
	for(var x = 0, len = segments.length; x < len; x++) {
		var tags = segments[x].replace(/[\{\}]*/g, '').split('.');
		var id = tags.shift();
		var repl = (tags.length > 0) ? arguments.callee('{{' + tags.join('.') + '}}', data[id], filter) : '' + data[id];
		if(segments[x].match(/^\{\{\{/) && typeof filter === 'function') {
			repl = filter(repl);
		}
		ret = ret.replace(segments[x], repl);
	}

	return ret;
};
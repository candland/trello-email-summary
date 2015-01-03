#!/usr/local/bin node

var path = require("path");
var pkg = require( path.join(__dirname, 'package.json') );
var program = require('commander');
var Q = require('q');
var fs = require('fs');

var TrelloBoard = require('./lib/trelloBoard.js');
var template = require('./lib/htmlTemplates.js');

function list(val) { return val.split(','); }

program
    .version(pkg.version)
    .option('-k, --key <key>', 'Trello API Key')
    .option('-t, --token <token>', 'Trello API User Token')
    .option('-b, --board <board>', 'Trello Board ID')
		.option('-l, --lists <listid[,listid]>', 'Include these lists', list)
		.option('-j, --json', 'Output in JSON')
    .parse(process.argv);

p = TrelloBoard(program.key, program.token, program.board, program.lists).board()
//p = Q.nfcall(fs.readFile, "board.json", "utf-8").then(function(json) { // load stored file
	//return JSON.parse(json);
//})
if (program.json) {
	p.then(function(board) {  // Store file to tweak template
		console.log(JSON.stringify(board));
	})
	.catch(function(err) {
		console.error("ERROR");
		console.error(err);
	})
	.done();
} else {
	p.then(template.appendRenderMemberFn)
	.then(template.appendLabelNameFn)
	.then(template.appendFormatFns)
	.then(template.renderMail)
	.then(console.log)
	.catch(function(err) {
		console.error("ERROR");
		console.error(err);
	})
	.done();
}

#!/usr/local/bin node

var path = require("path");
var pkg = require( path.join(__dirname, 'package.json') );
var program = require('commander');
var Q = require('q');
var fs = require('fs');

var TrelloBoard = require('./lib/TrelloBoard.js');
var template = require('./lib/htmlTemplates.js');

program
    .version(pkg.version)
    .option('-k, --key <key>', 'Trello API Key')
    .option('-t, --token <token>', 'Trello API User Token')
    .option('-b, --board <board>', 'Trello Board ID')
    .parse(process.argv);

TrelloBoard(program.key, program.token, program.board).board()
//.then(function(board) {  // Store file to tweak template
	//console.log(JSON.stringify(board));
//})
//Q.nfcall(fs.readFile, "board.json", "utf-8").then(function(json) { // load stored file
	//return JSON.parse(json);
//})
.then(template.appendRenderMemberFn)
.then(template.appendFormatFns)
.then(template.renderMail)
.then(console.log)
.catch(function(err) {
	console.error("ERROR");
	console.error(err);
})
.done();


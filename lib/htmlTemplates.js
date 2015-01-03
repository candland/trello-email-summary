var Q = require('q');
var Mustache = require('../vendor/mustache.js');
var fs = require('fs');

exports.appendRenderMemberFn = function(board) {
	return Q.nfcall(fs.readFile, "./templates/member.html", "utf-8")
	.then(function(template) {
		board.renderMember = function() {
			return Mustache.render(template, board.members[this]);
		};
		return board;
	});
};

exports.appendLabelNameFn = function(board) {
	board.labelName = function() {
		return (board.labelNames[this] || "&nbsp;&nbsp;&nbsp;")
	};
	return board;
};

exports.appendFormatFns = function(board) {
	board.dateFmt = function() {
		return (new Date(this)).toDateString();
	};
	return board;
};

exports.renderMail = function(board) {
	return Q.nfcall(fs.readFile, "./templates/mail.html", "utf-8")
	.then(function(tmp) {
		return Mustache.render(tmp, board);	
	});
};

var Trello = require('node-trello');
var Q = require('q');
var _ = require('underscore');

module.exports = function(key, token, boardId, listIds) {
	var t = new Trello(key, token);

	var get = Q.nbind(t.get, t);

	var board = {};

	var includeList = function(list) {
		return !listIds || listIds.length === 0 || listIds.indexOf(list.id) > -1
	}

	var getBoard = function(board) {
		return get("/1/boards/" + boardId)
			.then(function(result) {		
				_.extend(board, result);
				return board;
			});
	}

	var getLists = function(board) {
  	return get("/1/boards/" + boardId + "/lists/open")
			.then(function(lists) {
				return Q.all(
					_.chain(lists).filter(includeList).map(function(l) {
						return get("/1/lists/" + l.id + "/cards?filter=open&actions=commentCard").then(function(cards) {
							l.cards = cards;
							return l;
						})
					}).value())
				.then(function(lists) {
					board.lists = lists;
					return board;
				});
			});
	}

	var getMembers = function(board) {
		return get("/1/boards/" + boardId + "/members?fields=fullName,initials,url,avatarHash")
			.then(function(members) {		
				board.members = _.reduce(members, function(m, member) {
					m[member.id] = member;
					return m;
				}, {});
				return board;
			})
	}

	return { 
		board: function() {
			return getBoard({}).then(getMembers).then(getLists);
		}
	}
}


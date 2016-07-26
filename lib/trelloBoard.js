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
  
  var getCovers = function(l, cards) {
    return Q.all(
      _.chain(cards).map(function(c) {
        if (c.idAttachmentCover !== null) {
          return get("/1/cards/" + c.id + "/attachments/" + c.idAttachmentCover).then(function(attachment) {
            var coverUrl = _.find(attachment.previews, function(p) { return p.width === 600 });
            c.cover = coverUrl;
            return c;
          });
        } else {
          return c;
        }
      }).value()
    ).then(function(cards) {
      l.cards = cards;
      return l;
    });
  }


	var getLists = function(board) {
  	return get("/1/boards/" + boardId + "/lists/open")
			.then(function(lists) {
				return Q.all(
					_.chain(lists).filter(includeList).map(function(l) {
						return get("/1/lists/" + l.id + "/cards?filter=open&actions=commentCard").then(function(cards) {
              //l.cards = cards;
							return getCovers(l, cards);
            });
          }).value()
        ).then(function(lists) {
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

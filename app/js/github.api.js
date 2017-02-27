var Github = function(options) {

	// this.clientId = clientid;
	// this.clientSecret = clientSecret;
	// this.token = token;
	this.options = options || {};
}

// NOT WORKING - FUCKING GITHUB API THAT DO CROSS DOMAIN SHIT
// Github.prototype.Oauth = function(callback = function(){}) {
// 	if(this.options.token == undefined || this.options.token == "") {
// 		if(this.getUrlParameter("code") == "" || this.getUrlParameter("code") == undefined) {
// 			window.location.href = "https://github.com/login/oauth/authorize?client_id="+this.options.clientId+"&scope=user%20repo";
// 		} else if(this.options.token == "" || this.options.token == undefined) {
// 			var getCode = this.getUrlParameter("code");

// 			// window.location.href = "https://github.com/login/oauth/access_token?client_id="+this.options.clientId+"&client_secret="+this.options.clientSecret+"&code="+code+"&scope=user%20repo";
// 			$.ajax({
// 				header: {
// 					Accept: "application/json"
// 				},
// 				url: "https://github.com/login/oauth/access_token?client_id="+this.options.clientId+"&client_secret="+this.options.clientSecret+"&code="+getCode+"&scope=user%20repo",
// 				type: "POST",
// 				crossDomain: true,
// 				dataType: "json"
// 			}).done(function(data) {
// 				console.log(data);
// 			}).fail(function(data) {
// 				console.log(data);
// 			});
// 		}
// 	}
// }

// Github.prototype.getUrlParameter = function (sParam) {
//     var sPageURL = decodeURIComponent(window.location.search.substring(1)),
//         sURLVariables = sPageURL.split('&'),
//         sParameterName,
//         i;

//     for (i = 0; i < sURLVariables.length; i++) {
//         sParameterName = sURLVariables[i].split('=');

//         if (sParameterName[0] === sParam) {
//             return sParameterName[1] === undefined ? true : sParameterName[1];
//         }
//     }
// };

Github.prototype.getUser = function(user, callback = function(){}) {
	$.ajax({
		url: "https://api.github.com/users/"+user+"?access_token="+this.options.token,
		dataType: "jsonp",
	}).done(function(res) {
		callback(res.data);
	});
}
	
Github.prototype.getUserRepos = function(user, callback = function(){}) {
	$.ajax({
		url: "https://api.github.com/users/"+user+"/repos?affiliation=owner,collaborator&access_token="+this.options.token,
		dataType: "jsonp",
	}).done(function(res) {
		callback(res.data);
	});
}

Github.prototype.getRepoLangages = function(link, callback) {
	if(!link.match("https://api.github.com/repos/")) {
		link = "https://api.github.com/repos"+link;
	}

	$.ajax({
		url: link+"/languages?access_token="+this.options.token,
		dataType: "jsonp",
	}).done(function(res) {
		callback(res.data);
	});
}

Github.prototype.getRepoContributors = function(link, callback) {
	if(!link.match("https://api.github.com/repos/")) {
		link = "https://api.github.com/repos"+link;
	}

	$.ajax({
		url: link+"/contributors?access_token="+this.options.token,
		dataType: "jsonp",
	}).done(function(res) {
		callback(res.data);
	});
}

Github.prototype.getUserLangages = function(user, callback = function(){}) {
	var _this = this;
	this.getUserRepos(user, function(res) {
		var tab_temp_lang = [];
		var tab_lang = [];
		var tab_total = [];
		var tab_return = {"data": "", "total": 0};
		var total = 0;

		for (var d = 0; d <= res.length - 1; d++) {
			var countRepo = 0;
			// récupération des langs du repo
			_this.getRepoLangages(res[d].url, function(result) {
				// chacune des lang du repo
				$.each(result, function(index, val) {
					var tempVal = {};
					tempVal["lang"] = index;
					tempVal["val"] = val;
					tab_temp_lang.push(tempVal);
				});

				if(res.length-1 == countRepo) {
					$.each(tab_temp_lang, function(i, val) {
						var inTable = false;
						$.each(tab_lang, function(index, value) {
							total += val.val;
							if(value.lang == val.lang) {
								inTable = true;
								value.val += val.val;
							}
						});
						if(!inTable) {
							var tempLang = {};
							tempLang["lang"] = val.lang;
							tempLang["val"] = val.val;
							tab_lang.push(tempLang);
						}
					});
					tab_return["data"] = tab_lang;
					tab_return["total"] = total;
					callback(tab_return);
				}
				countRepo += 1;
			});
		}
	});
}
	
Github.prototype.getUserContributors = function(user, callback = function(){}) {
	var _this = this;

	this.getUserRepos(user, function(res) {
		var tab_temp_contrib = [];
		var tab_contrib = [];

		console.log(res);

		_this.shuffle(res);

		for (var d = 0; d <= res.length - 1; d++) {
			var countRepo = 0;
			// récupération des langs du repo
			_this.getRepoContributors(res[d].url, function(result) {
				// chacune des lang du repo
				$.each(result, function(index, val) {
					if(val.login != user) {
						var tempVal = {};
						tempVal["login"] = val.login;
						tempVal["avatar"] = val.avatar_url;
						tempVal["url"] = val.html_url;
						tab_temp_contrib.push(tempVal);
					}
				});

				if(res.length-1 == countRepo) {
					$.each(tab_temp_contrib, function(i, val) {
						var inTable = false;
						$.each(tab_contrib, function(index, value) {
							if(value.login == val.login) {
								inTable = true;
							}
						});
						if(!inTable) {
							var tempVal = {};
							tempVal["login"] = val.login;
							tempVal["avatar"] = val.avatar;
							tempVal["url"] = val.url;
							tab_contrib.push(tempVal);
						}
					});
					callback(tab_contrib);
				}
				countRepo += 1;
			});
		}
	});
}

Github.prototype.shuffle = function (array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

	// Pick a remaining element...
	randomIndex = Math.floor(Math.random() * currentIndex);
	currentIndex -= 1;

	// And swap it with the current element.
	temporaryValue = array[currentIndex];
	array[currentIndex] = array[randomIndex];
	array[randomIndex] = temporaryValue;
	}

	return array;
}




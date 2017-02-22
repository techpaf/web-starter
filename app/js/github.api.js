var Github = function(options) {

	// this.clientId = clientid;
	// this.clientSecret = clientSecret;
	// this.token = token;
	this.options = options || {"token": ""};
}

Github.prototype.getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

Github.prototype.getUser =	function(user, callback = function(){}) {
	$.ajax({
		url: "https://api.github.com/users/"+user+"?access_token="+this.options.token,
		dataType: "jsonp",
	}).done(function(res) {
		callback(res.data);
	});
}
	
Github.prototype.getUserRepos =	function(user, callback = function(){}) {
	$.ajax({
		url: "https://api.github.com/users/"+user+"/repos?type=all&access_token="+this.options.token,
		dataType: "jsonp",
	}).done(function(res) {
		callback(res.data);
	});
}

Github.prototype.getRepoLangages =	function(link, callback) {
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
	
Github.prototype.getUserLangages =	function(user, callback = function(){}) {
	var _this = this;
	$.ajax({
		url: "https://api.github.com/users/"+user+"/repos?type=all&access_token="+this.options.token,
		dataType: "jsonp",
	}).done(function(res) {
		var tab_repos = [];
		var tab_temp_lang = [];
		var tab_lang = [];

		$.each(res.data, function(i, val) {
			tab_repos.push(this);
			// récupération des langs du repo
			_this.getRepoLangages(this.url, function(result) {
				// chacune des lang du repo
				$.each(result, function(index, val) {
					var tempVal = {};
					tempVal["lang"] = index;
					tempVal["val"] = val;
					tab_temp_lang.push(tempVal);
				});

				if(res.data.length == i + 1) {
					$.each(tab_temp_lang, function(i, val) {
						var inTable = false;
						$.each(tab_lang, function(index, value) {
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
					callback(tab_lang);
				}
			});
		});
	});
}




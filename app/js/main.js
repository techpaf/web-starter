$(function(){

	// Test if touch device
    var touch = (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));

	// INIT CLASS GIT
	var git = new Github({
		"token": "a60ad21d9a1bf7e6470cd1aa150cfff130e3c4b3"
	});

	//===============================================================================
	// LOGIN DE L'UTILISATEUR -- Marche pas, code retourné par GITHUB pas fonctionnel
	//===============================================================================

	// if(git.getUrlParameter("code") == "" || git.getUrlParameter("code") == undefined) {
	// 	$(".js-oauth").bind("click", function(e) {
	// 		e.preventDefault();
	// 		window.location.href = "https://github.com/login/oauth/authorize?client_id=bcc78630a3a4f8b2220e&scope=user%20repo";
	// 	});
	// } else {
		// $(".js-beforeCo").addClass("u-hide");
		// git.getLanguages("/AdFabConnect/quickfr");
		// git.getUser("emoc11");
	// }



	//==========================
	// LOGIN PAR MON TOKEN PERSO
	//==========================
	var tab_repos,
		tab_lang,
		tab_user,
		tab_contrib;

	var res_repo,
		res_lang,
		res_user,
		res_contrib;

	// Toutes les data d'un utilisateur
	git.getUser("emoc11", function(res){
		res_user = res;
		console.log(res);

		$('.user_infos img').attr({"src": res_user.avatar_url});
		$('.user_infos .nom').text(res_user.name);
		$('.user_infos .localisation').text(res_user.location);
		$('.user_infos .site').attr("href", res_user.blog).text(res_user.blog);
	});

	// Tous les repos d'un utilisateur
	git.getUserRepos("emoc11", function(res) {
		res_repo = res;
	});

	// Tous les langages des repos d'un utilisateur
	git.getUserLangages("emoc11", function(res) {
		res_lang = res;

		// PIE CHART
		var w = h = $(window).innerHeight() / 2;
		var r = w/2;
		var maxV = d3.max(res, function(d) { return +d.val;} );
		var minV = d3.min(res, function(d) { return +d.val;} );
		var color = d3.scaleLinear().domain([minV, maxV]).range(["#5D32B0", "#C7182F"]);

		var vis = d3.select(".user-lang-round")
			.append("svg:svg")
			.data([res])
			    .attr("width", w)
			    .attr("height", h)
			.append("svg:g")
		    	.attr("transform", "translate(" + r + "," + r + ")");

		var arc = d3.arc()
			.innerRadius(0)
       		.outerRadius(r);

   		var pie = d3.pie()
			.value(function(d) { return d.val; });

       	var arcs = vis.selectAll("g.slice")
	        .data(pie)
	        .enter()
	            .append("svg:g")
	                .attr("class", function(d) { return "slice "+d.data.lang})
	                .attr("data-target", function(d) { return d.data.lang});
	        arcs.append("svg:path")
	        		.attr("stroke-width", 2)
	        		.attr("stroke", "#FFF")
	                .attr("fill", function(d, i) {
	                	$(".user-lang-legend").append("<div data-target='"+d.data.lang+"' class='"+d.data.lang+"' style='background: "+color(d.data.val)+"'>"+d.data.lang+"</div>");
	                	return color(d.data.val);
	                })
	                .attr("d", arc);
	        arcs.append("svg:text")
	                .attr("transform", "translate("+ r*1.5 +", 0)")
		            .attr("text-anchor", "middle")
		            // .text(function(d, i) {return res[i].lang+" : "+res[i].val+" lignes"; });
		            .text(function(d, i) {return res[i].val+" lignes"; });

		function pieEvents() {
			if(touch) {
				$(".user-lang-legend div").unbind("mouseenter mouseleave");

				$(".user-lang-legend div").bind("click",function() {
					var targClass = $(this).attr("data-target");
					$(".user-lang-round svg .click").removeClass("click active");
					$(".user-lang-round").removeClass("click");
					
					$(".user-lang-round svg ."+targClass).addClass("click active");
					$(".user-lang-round").addClass("click");
				});
			} else {
				$(".user-lang-legend div").unbind("click");

				$(".user-lang-legend div").bind("mouseenter",function() {
					var targClass = $(this).attr("data-target");
					$(".user-lang-round svg ."+targClass).addClass("active");
				});
				$(".user-lang-legend div").bind("mouseleave",function() {
					var targClass = $(this).attr("data-target");
					$(".user-lang-round svg ."+targClass).removeClass("active")
				});
			}
		}
		pieEvents();
	});
	
	// Les langages d'un repo unique
	// git.getRepoLangages("/AdFabConnect/quickfr", function(res) {
	// });
});
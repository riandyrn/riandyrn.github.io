var baseUrl = "";

var menuObj = [
	{
		type: "single",
		title: "Dashboard",
		link: "dashboard.html"
	},
	{
		type: "dropdown",
		title: "Driver management", 
		submenu: [
			"<span class='glyphicon glyphicon-plus'>&nbsp;</span>" + "Add driver", 
			"<span class='glyphicon glyphicon-search'>&nbsp;</span>" + "Find driver"
		],
		links: ["add_driver.html", "find_driver.html"]
	},
	{
		type: "dropdown",
		title: "Sender management", 
		submenu: [
			"<span class='glyphicon glyphicon-search'>&nbsp;</span>" + "Find sender"
		],
		links: ["find_sender.html"]
	},
	{
		type: "single",
		title: "Request monitoring",
		link: "requests.html"
	},
	{
		type: "dropdown", 
		title: "Rating monitoring", 
		submenu: ["Driver ratings", "Sender ratings"],
		links: ["driver_ratings.html", "sender_ratings.html"]
	},
	{
		type: "divider"
	},
	{
		type: "single",
		title: "Log out",
		link: "login.html"
	}
];

function buildMenu(menuObj) {
	
	for(var i = 0; i < menuObj.length; i++) {
		var type = menuObj[i].type;
		var title = menuObj[i].title;
	
		if(type == "dropdown") {
			var submenu = menuObj[i].submenu;
			var links = menuObj[i].links;

			var el = $(getDropdownTemplate(title));
			var dropdownEl = $(el).find(".dropdown-menu");

			for(var j = 0; j < submenu.length; j++) {
				console.log("hello " + j);
				$(dropdownEl).append(getItemTemplate(submenu[j], getLinkPath(links[j])));
			}

			$(".nav-content").append(el);
		} else if(type == "single") {

			var link = menuObj[i].link;
			$(".nav-content").append(getItemTemplate(title, getLinkPath(link)));
		} else if(type == "divider") {
			$(".nav-content").append(getDividerTemplate());
		}
	}
}

function getDropdownTemplate(caption) {

	var ret = '<li class="dropdown"> <a href="" tabindex="0" data-toggle="dropdown" data-submenu> ' + caption + ' <span class="caret"></span> </a> <ul class="dropdown-menu"> </ul> </li>';
	return ret;
}

function getItemTemplate(caption, link) {
	
	var ret = '<li><a href="' + link + '" tabindex="0">' + caption + '</a></li>';
	return ret;
}

function getDividerTemplate() {
	return '<li class="divider"></li>';
}

function getLinkPath(link) {

	return link;
}

function setTitle(title) {

	$(".navbar-brand").text(title);
}

buildMenu(menuObj);
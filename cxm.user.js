// ==UserScript==
// @name        Simplify CXM
// @namespace   sethreno
// @include     http://cxm.rosnet.com:8080/CXM/*
// @include     http://192.168.0.68:8080/CXM/*
// @description Make CXM UI bearable.
// @updateURL   https://github.com/sethreno/cxm_grease/raw/master/cxm.user.js
// @version     4
// @grant       none
// @require     https://cdn.rawgit.com/showdownjs/showdown/1.2.2/dist/showdown.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.7/highlight.min.js
// @require     https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js
// @run-at      document-start
// ==/UserScript==

// this has to run before cxm scripts run
var showdownConverter = new showdown.Converter();

function hackForStringLiteral(f) {
  return f.toString().
      replace(/^[^\/]+\/\*!?/, '').
      replace(/\*\/[^\/]+$/, '');
}

var css = hackForStringLiteral(function() {/*!
#cxm_grease {
	padding: 10px;
	font-family: Helvetica;
	font-size: 140%;
}

#cxm_grease .menu {
	padding: 5px;
	margin: 10px;
	background-color: #2e4272;
	color: white;
}

#cxm_grease .ticket, #cxm_grease .note {
	margin: 10px;
	border: 1px solid;
}

#cxm_grease .ticket > h3, #cxm_grease .note > h3 {
	padding: 5px;
	background-color: #2e4272;
	color: white;
}

#cxm_grease .ticket p, #cxm_grease .note p, #cxm_grease .ticket .attachments a {
	padding: 5px;
}

#cxm_grease .ticket .attachments {
	margin: 5px;
}

#cxm_grease .ticket h3 span:first-child {
	display: block;
}
#cxm_grease .ticket h3 span:not(:first-child):not(:last-child):after {
	content: " :: ";
}

#cxm_grease .menu span:not(:last-child):after {
	content: " :: ";
}

#cxm_grease .note h3 span:not(:last-child):after {
	content: " :: ";
}

#cxm_grease .menu a, #cxm_grease .ticket h3 a, #cxm_grease .note h3 a {
	color: white;
}


#cxm_grease .note p h1 { font-size: 200%; }
#cxm_grease .note p h2 { font-size: 175%; }
#cxm_grease .note p h3 { font-size: 150%; }
#cxm_grease .note p h4 { font-size: 125%; }
#cxm_grease .note p h5 { font-size: 100%; }

#cxm_grease .note p em { font-style: italic; }
#cxm_grease .note p strong { font-weight: bold; }
#cxm_grease .note p ul li {
    list-style-type: disc;
}

#cxm_grease .note p ol li {
    list-style-type: decimal;
}

#cxm_grease .note p blockquote {
    margin-bottom: 18px;
    border-left: 5px solid #EEE;
    padding-left: 15px;
}
#cxm_grease .note p img {
    display: inline-block;
}
*/});

var $div = [];

document.onreadystatechange = function () {
	var state = document.readyState
	console.log("ready state: " + state);
	if (state == 'interactive') {
		supportTicketLink();
	}
}

function loadComplete() {
    if ($('#loadingOverlay').is(':visible') || $("#ticketID").val() === undefined) return; // sill loading
    clearInterval(timer);

    var id = $("#ticketID").val();
    if (id === undefined) {
        console.log("couldn't find ticket id, aborting");
        $('.appLayout').show();
        return;
    }
    $('<style type="text/css">' + css + '</style>').appendTo('head');
    $('<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.7/styles/zenburn.min.css">').appendTo('head');
    $div = $('<div id="cxm_grease" />').prependTo('body');
    $('.appLayout').hide();

    createMenuDiv();
    createTicketDiv(id);
    createNoteDivs();

    // show ticket url
    var url = "http://" + window.location.hostname + ":8080/CXM/entity/#ticket=" + id;
    window.history.pushState("", "", url);
}

var timer = setInterval(loadComplete, 100);

function supportTicketLink(){
	//http://192.168.0.68:8080/CXM/entity/#ticket=15-19162
	//http://cxm.rosnet.com:8080/CXM/entity/#ticket=19162
	if (!window.location.hash) return;
	if (window.location.hash.indexOf("#ticket=") != 0) return;

	console.log("handling ticket link");
	var id = window.location.hash.split("=")[1];
	if (id.indexOf("-") != -1){
		id = id.split("-")[1];
	}

	$("<form/>")
		.attr("action", "/CXM/entity/getEntityDetails")
		.attr("method", "POST")
		.append($("<input/>").attr("type", "hidden").attr("name", "entityId").attr("value", id))
		.append($("<input/>").attr("type", "hidden").attr("name", "moduleUname").attr("value", "Ticket"))
		.append($("<input/>").attr("type", "hidden").attr("name", "forView").attr("value", "false"))
		.append($("<input/>").attr("type", "hidden").attr("name", "parentModName").attr("value", ""))
		.append($("<input/>").attr("type", "hidden").attr("name", "parentInstanceId").attr("value", "0"))
		.append($("<input/>").attr("type", "hidden").attr("name", "extendedFromModuleUName").attr("value", ""))
		.append($("<input/>").attr("type", "hidden").attr("name", "extendeFromModuleInstanceId").attr("value", "0"))
		.appendTo($(document.body))
		.submit();
}

function createMenuDiv(){
	$div.append($("<div/>")
		.addClass("menu")
		.append($("<span/>").append($("<a/>")
			.attr("href", "#").text("toggle cxm ui")
			.click(function(){ $(".appLayout").toggle(); })))
		.append($("<span/>").append($("<a/>")
			.attr("href", "#").text("refresh")
			.click(refreshEntity)))
		.append($("<span/>").append($("<a/>")
			.attr("href", "#").text("add note")
			.click(function(){
				$("span[widgetid='ticketLineItemBtn']").find("input").click();
			})))
		.append($("<span/>").append($("<a/>")
			.attr("href", "#").text("assign")
			.click(function(){ alert("not implemented yet"); })))
		);
}

function createTicketDiv(id){
	var title = $("#ticketTitle").val();
	var recieved = $("#recdDate").val() + ' ' + $("#recdTime").val();
	var account = $("#skipaccount").val();
	var site = $("#skipsite").val();
	var location = $("#skiplocation").val();

	openSubmodule('attachments',true); // make attachments available

	$div.append($("<div />")
		.addClass("ticket")
		.append($("<h3/>")
			.append($("<span/>").text(id + " " + title))
			.append($("<span/>").text(recieved))
			.append($("<span/>").text(account + " " + site + " " + location))
		)
		.append($("<div/>").addClass("attachments")
			.append($("td.field-attachmentName").find("a")))
		.append($("<p/>").append(
			$("#probDesc_iframe").contents().find("#dijitEditorBody")
			.clone()
			.attr('contenteditable','false')
			.attr('id', 'dijitEditorBodyClone')
		))
	);

	$(".btnCloseAttachment").find("input").click(); // back to default tab
}

function createNoteDivs(){
	var notes = [];
	// gt(0) - the first element is a header row
	$('.field-ttproblem:gt(0)').each(function(index) {
		var note = { text: $(this).text() };
		notes.push(note);
	});
	$('.field-ttresolution:gt(0)').each(function(index) {
		var note = notes[index];
		if (note.text.length > 0 && $(this).text().length > 0){
			note.text += "\n";
		}
		note.text += $(this).text();
	});
	$('.field-ttworkby:gt(0)').each(function(index) {
		notes[index].user = $(this).text();
	});
	$('.field-ttdate:gt(0)').each(function(index) {
		notes[index].date = $(this).text();
	});
	$('.field-ttstart:gt(0)').each(function(index) {
		notes[index].date += " " + $(this).text();
	});
	$('.field-ttid:gt(0)').each(function(index) {
		notes[index].id = $(this).text();
	});

	for(var i=0; i<notes.length; i++){
		var text = notes[i].text;
		text = text.replace(/\n/g, "  \n");
		var onclick = "clickEditFormtroubleViewGrid(" + notes[i].id + ",'edit')";
		$div.append($("<div/>")
			.addClass("note")
			.append($("<h3/>")
				.append($("<span/>").text(notes[i].date))
				.append($("<span/>").text(notes[i].user))
				.append($("<span/>")
					.append($('<a onclick="' + onclick + '"/>')
						.attr("href","#").text("edit")
					)))
			.append($("<p/>")
				.html(showdownConverter.makeHtml(text)))
		);
	}

	$('pre code').each(function(i, block) {
		hljs.highlightBlock(block);
	});
}


// ==UserScript==
// @name        Simplify CXM
// @namespace   sethreno
// @include     http://cxm.rosnet.com:8080/CXM/*
// @include     http://192.168.0.68:8080/CXM/*
// @description Make CXM UI bearable.
// @version     2
// @grant       none
// @require     https://cdn.rawgit.com/showdownjs/showdown/1.2.2/dist/showdown.min.js
// ==/UserScript==

function hackForStringLiteral(f) {
  return f.toString().
      replace(/^[^\/]+\/\*!?/, '').
      replace(/\*\/[^\/]+$/, '');
}

var css = hackForStringLiteral(function() {/*!
#cxm_grease {
	padding: 10px;
	font-family: consolas;
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

#cxm_grease .ticket h3, #cxm_grease .note h3 {
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
*/});
$('<style type="text/css">' + css + '</style>').appendTo('head');

var timer = setInterval(loadComplete, 100);
var $div = $('<div id="cxm_grease" />').prependTo('body');


function loadComplete(){
	if ($('#loadingOverlay').is(':visible')) return; // sill loading
	clearInterval(timer);

	var id = $("#ticketID").val();
	if (id === undefined){
		console.log("couldn't find ticket id, aborting");
		$('.appLayout').show();
		return;
	}
	$('.appLayout').hide();

	createMenuDiv();
	createTicketDiv(id);
	createNoteDivs();
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
			.attr('contenteditable','false')
			.clone()
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

	var converter = new showdown.Converter();
	for(var i=0; i<notes.length; i++){
		var onclick = "clickEditFormtroubleViewGrid(" + notes[i].id + ",'view')";
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
				.html(converter.makeHtml(notes[i].text)))
		);
	}
}


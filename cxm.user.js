// ==UserScript==
// @name        Simplify CXM
// @namespace   sethreno
// @include     http://cxm.rosnet.com:8080/CXM/*
// @include     http://192.168.0.68:8080/CXM/*
// @description Make CXM UI bearable.
// @version     2
// @grant       none
// ==/UserScript==

var timer = setInterval(loadComplete, 100);
var $div = $('<div id="cxm_grease_container" />').prependTo('body');

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

	$('head').append("<link rel='stylesheet' href='https://raw.githubusercontent.com/sethreno/cxm_grease/master/cxm.user.css' type='text/css' >");

	createMenuDiv();
	createTicketDiv(id);
	createNoteDivs();
}

function createMenuDiv(){
	var $menu = $('<div id="cxm_grease_menu" />');
	var $toggle = createButton("", "toggle cxm ui");
	$toggle.click(function(){
		$('.appLayout').toggle();
	});
	$menu.append($toggle);
	$menu.append(" :: ");
	$menu.append(createButton("refreshEntity()", "refresh"));

	$menu.append(" :: ");
	$addNote = createButton("", "add note");
	$addNote.click(function(){
		$("span[widgetid='ticketLineItemBtn']").find("input").click();
	});
	$menu.append($addNote);

	$menu.append(" :: ");
	$menu.append(createButton("alert('not implemented yet')", "assign"));
	// simulate save button click, needed for assign feature
	//$("span[widgetid='dijit_form_Button_1']").find("input").click();
	$div.append($menu);
}

function createTicketDiv(id){
	var title = $("#ticketTitle").val();
	var recieved = $("#recdDate").val() + ' ' + $("#recdTime").val();
	var account = $("#skipaccount").val();
	var site = $("#skipsite").val();
	var location = $("#skiplocation").val();

	var $ticketDiv = $('<div class="cxm_grease_ticket" />');
	var $header = $('<h3/>');
	$header.html(id + " " + title + "<br />" + recieved + " :: " + account + " " + site + " " + location);
	$ticketDiv.append($header);

	var $p = $("<p />");
	$ticketDiv.append($p);

	var $iframeContent = $("#probDesc_iframe").contents().find("#dijitEditorBody").clone();
	$iframeContent.id = "dijitEditorBodyClone";
	$iframeContent.attr('contenteditable','false');
	$p.append($iframeContent);

	$div.append($ticketDiv);
}

function createNoteDivs(){
	var notes = [];
	$('.field-ttproblem').each(function(index) {
		var note = { text: $(this).text() };
		notes.push(note);
	});
	$('.field-ttresolution').each(function(index) {
		var note = notes[index];
		if (note.text.length > 0 && $(this).text().length > 0){
			note.text += "\n";
		}
		note.text += $(this).text();
	});
	$('.field-ttworkby').each(function(index) {
		notes[index].user = $(this).text();
	});
	$('.field-ttdate').each(function(index) {
		notes[index].date = $(this).text();
	});
	$('.field-ttstart').each(function(index) {
		notes[index].date += " " + $(this).text();
	});
	$('.field-ttid').each(function(index) {
		notes[index].id = $(this).text();
	});
	for(var i=1; i<notes.length; i++){
		var $note = $('<div class="cxm_grease_note" />');
		var $header = $('<h3/>');
		var $text = $('<p/>');
		var edit = "<a href=\"#\" onclick=\"clickEditFormtroubleViewGrid(" + notes[i].id + ",'view')\" '>edit</a>";
		$header.html(notes[i].date + ' :: ' + notes[i].user + " :: " + edit);
		$text.html(notes[i].text.replace(/\n/g, "<br />"));
		$note.append($header);
		$note.append($text);
		$div.append($note);
	}
}

function createButton(onclick, text){
	return $("<a href=\"#\" onclick=\"" + onclick + "\">" + text + "</a>");
}


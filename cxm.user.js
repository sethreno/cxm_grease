// ==UserScript==
// @name        Simplify CXM
// @namespace   sethreno
// @include     http://cxm.rosnet.com:8080/CXM/*
// @include     http://192.168.0.68:8080/CXM/*
// @description Make CXM UI bearable.
// @version     1
// @grant       none
// @require		https://code.jquery.com/jquery-2.1.4.min.js
// ==/UserScript==

var timer = setInterval(loadComplete, 1000);
var $div = $('<div style="padding: 10px; font-family: consolas; font-size: 140%;" />').prependTo('body');

$(function(){
	$('.appLayout').hide();
});

function loadComplete(){
	if ($('#loadingOverlay').is(':visible')) return; // sill loading
	clearInterval(timer);

	var id = $("#ticketID").val();
	if (id === undefined){
		console.log("couldn't find ticket id, aborting");
		$('.appLayout').show();
		return;
	}

	createMenuDiv();
	createTicketDiv(id);
	createNoteDivs();
}

function createMenuDiv(){
	var $menu = $('<div style="padding: 5px; margin: 10px; background-color: #2e4272; color: white;" />');
	var $toggle = createButton("", "toggle cxm ui");
	$toggle.click(function(){
		$('.appLayout').toggle();
	});
	$menu.append($toggle);
	$menu.append(" :: ");
	$menu.append(createButton("refreshEntity()", "refresh"));
	$menu.append(" :: ");
	$menu.append(createAddNoteButton());
	$menu.append(" :: ");
	$menu.append(createButton("alert('not implemented yet')", "assign"));
	$div.append($menu);
}

function createTicketDiv(id){
	var title = $("#ticketTitle").val();
	var recieved = $("#recdDate").val() + ' ' + $("#recdTime").val();
	var account = $("#skipaccount").val();
	var site = $("#skipsite").val();
	var location = $("#skiplocation").val();

	var $ticketDiv = $('<div style="margin: 10px; border: 1px solid;" />');
	var $header = $('<div style="padding: 5px; background-color: #2e4272; color: white;" />');
	$header.html(id + " " + title + "<br />" + recieved + " :: " + account + " " + site + " " + location);
	var $iframeContent = $("#probDesc_iframe").contents().find("#dijitEditorBody").clone();
	$iframeContent.css('padding', '10px');
	$iframeContent.attr('contenteditable','false');

	$ticketDiv.append($header);
	$ticketDiv.append($iframeContent);
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
		var $note = $('<div style="margin: 10px; border: 1px solid;" />');
		var $header = $('<div style="padding: 5px; background-color: #2e4272; color: white;" />');
		var $text = $('<div style="padding: 10px;" />');
		var edit = "<a href=\"#\" onclick=\"clickEditFormtroubleViewGrid(" + notes[i].id + ",'view')\" style='color: white;'>edit</a>";
		$header.html(notes[i].date + ' :: ' + notes[i].user + " :: " + edit);
		$text.html(notes[i].text.replace(/\n/g, "<br />"));
		$note.append($header);
		$note.append($text);
		$div.append($note);
	}
}

function createButton(onclick, text){
	return $("<a href=\"#\" onclick=\"" + onclick + "\" style='color: white;'>" + text + "</a>");
}

function createAddNoteButton(){
	var $button = createButton("alert('This only works if a task exists on the ticket.')", 'add note');
	var taskId = $(".field-TaskId:last").text();
	if (taskId !== undefined){
		$edit = createButton("clickEditFormtasksViewGrid(" + taskId + ",'view')", "add note");
	}
	return $edit;
}


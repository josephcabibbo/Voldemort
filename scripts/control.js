/*  -------------------------------------------------
 *	Filename: control.js
 *	Author: Joey Cabibbo
 *	Description: The "controller" if you will..
 *		     Initializes and responds to the page
 *	------------------------------------------------- */

$(document).ready(function() {

	//
	// Initalization
	//
	$("#languageGrammer").hide();
	$("#testCases").hide();

	displayGrammerTable();

	//
	// Click Events
	//
	$(".button").click(function() {

		// Compile code if necessary
		if(this.innerText === "Compile Source Code")
		{
			// Compile
		}

		displayCorrectElement(this);
		dispayCorrectLabel();
		displayCorrectButton();
	});

	//
	// Helper Functions
	//
	function displayCorrectElement(button)
	{
		if(button.id === "btnCompile")
		{
			// Show source code
			$("#sourceCode").show("slow");
			// Hide others
			$("#languageGrammer").hide();
			$("#testCases").hide();
		}
		else if(button.id === "btnShowGrammar")
		{
			// Show grammar
			$("#languageGrammer").show("slow");
			// Hide others
			$("#sourceCode").hide();
			$("#testCases").hide();
		}
		else if(button.id === "btnShowTestCases")
		{
			// Show test cases
			$("#testCases").show("slow");
			// Hide others
			$("#sourceCode").hide();
			$("#languageGrammer").hide();

		}
	}

	function dispayCorrectLabel()
	{
		if( $("#sourceCode").is(":visible") && $("#interactionPanelLabel").text() != "Source Code" )
		{
			$("#interactionPanelLabel").fadeOut(400, function() {
				$("#interactionPanelLabel").text("Source Code").fadeIn(400);
			});
		}
		else if( $("#languageGrammer").is(":visible") && $("#interactionPanelLabel").text() != "Language Grammar" )
		{
			$("#interactionPanelLabel").fadeOut(400, function() {
				$("#interactionPanelLabel").text("Language Grammar").fadeIn(400);
			});
		}
		else if( $("#testCases").is(":visible") && $("#interactionPanelLabel").text() != "Test Cases" )
		{
			$("#interactionPanelLabel").fadeOut(400, function() {
				$("#interactionPanelLabel").text("Test Cases").fadeIn(400);
			});
		}
	}

	// Only applies to compile / show source code button
	function displayCorrectButton()
	{
		if( $("#sourceCode").is(":visible") )
			$("#btnCompile").text("Compile Source Code");
		else
			$("#btnCompile").text("Show Source Code");
	}

	function displayGrammerTable()
	{
		// Build table to show the language grammer
		$("#grammarTable").html("<tr>" + "<td>Program</td><td>::== Statement $</td>" 						 + "</tr>" +
								"<tr>" + "<td>Statement</td><td>::== P ( Expr )</td>" 						 + "</tr>" +
								"<tr>" + "<td></td><td>::== ID = Expr</td>" 								 + "</tr>" +
								"<tr>" + "<td></td><td>::== { StatementList }</td>" 						 + "</tr>" +
								"<tr>" + "<td>Statement List</td><td>::== Statement StatementList</td>" 	 + "</tr>" +
								"<tr>" + "<td></td><td>::== ε</td>" 										 + "</tr>" +
								"<tr>" + "<td>Expr</td><td>::== IntExpr</td>" 								 + "</tr>" +
								"<tr>" + "<td></td><td>::== CharExpr</td>" 									 + "</tr>" +
								"<tr>" + "<td></td><td>::== Id</td>" 										 + "</tr>" +
								"<tr>" + "<td>IntExpr</td><td>::== digit op Expr</td>" 						 + "</tr>" +
								"<tr>" + "<td></td><td>::== digit</td>" 									 + "</tr>" +
								"<tr>" + "<td>CharExpr</td><td>::== \" CharList \"</td>" 					 + "</tr>" +
								"<tr>" + "<td>CharList</td><td>::== Char CharList</td>" 					 + "</tr>" +
								"<tr>" + "<td></td><td>::== ε</td>" 										 + "</tr>" +
								"<tr>" + "<td>VarDecl</td><td>::== Type Id</td>" 							 + "</tr>" +
								"<tr>" + "<td>Type</td><td>::== int | char</td>" 							 + "</tr>" +
								"<tr>" + "<td>Id</td><td>::== Char</td>" 									 + "</tr>" +
								"<tr>" + "<td>Char</td><td>::== a | b | c ... z</td>" 						 + "</tr>" +
								"<tr>" + "<td>digit</td><td>::== 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0</td>" + "</tr>" +
								"<tr>" + "<td>op</td><td>::== + | -</td>" 									 + "</tr>");
	}
});

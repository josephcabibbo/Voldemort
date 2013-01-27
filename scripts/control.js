/*  ------------------------------------------------- 
 *	Filename: control.js
 *	Author: Joey Cabibbo
 *	Description: The "controller" if you will..
 *				 Initializes and responds to the page 
 *	------------------------------------------------- */

$(document).ready(function() {

	//
	// Initalization
	//
	$("#title").text("Source Code");

	$("#grammarContainer").hide();
	$("#testCaseContainer").hide();

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
		dispayCorrectTitle();
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
			$("#sourceCodeContainer").show("slow");
			// Hide others
			$("#grammarContainer").hide();
			$("#testCaseContainer").hide();
		}
		else if(button.id === "btnShowGrammar")
		{
			// Show grammar
			$("#grammarContainer").show("slow");
			// Hide others
			$("#sourceCodeContainer").hide();
			$("#testCaseContainer").hide();
		}
		else if(button.id === "btnShowTestCases")
		{
			// Show test cases
			$("#testCaseContainer").show("slow");
			// Hide others
			$("#sourceCodeContainer").hide();
			$("#grammarContainer").hide();

		}
	}

	function dispayCorrectTitle()
	{
		if( $("#sourceCodeContainer").is(":visible") && $("#title").text() != "Source Code" )
		{
			$("#title").fadeOut(400, function() {
				$("#title").text("Source Code").fadeIn(400);
			});
		}
		else if( $("#grammarContainer").is(":visible") && $("#title").text() != "Language Grammar" )
		{
			$("#title").fadeOut(400, function() {
				$("#title").text("Language Grammar").fadeIn(400);
			});
		}
		else if( $("#testCaseContainer").is(":visible") && $("#title").text() != "Test Cases" )
		{
			$("#title").fadeOut(400, function() {
				$("#title").text("Test Cases").fadeIn(400);
			});
		}
	}

	// Only applies to compile / show source code button
	function displayCorrectButton()
	{
		if( $("#sourceCodeContainer").is(":visible") )
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
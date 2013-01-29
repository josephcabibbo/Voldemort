/*  -------------------------------------------------
 *	Filename: control.js
 *	Author: Joey Cabibbo
 *	Description: The "controller" if you will..
 *		     Initializes and responds to the page
 *	------------------------------------------------- */

$(document).ready(function() {

	//
	// General Initalization
	//
	$("#languageGrammer").hide();
	$("#testCases").hide();

	$("#errors div").hide();
	$("#trace div").hide();
	$("#symbolTable div").hide();
	$("#output div").hide();
	$("#btnRestore").hide();

	displayGrammerTable();

	//
	// Interaction Panel Events
	//
	$(".button").click(function() {

		// Compile code if necessary
		if(this.innerText === "Compile Source Code")
		{
			// Compile
		}

		displayCorrectElement(this);
		dispayCorrectInteractionLabel();
		displayCorrectButton();
	});

	//
	// Results Panel Events
	//
	$(".resultBox").hover(function() {

		// Perform actions only if targeted result box it is not enlarged
		if($(this).height() === RESULTBOX_DEF_HEIGHT && $(this).width() === RESULTBOX_DEF_WIDTH)
		{
			$(this).toggleClass("resultBoxHighlight");
			$(this).children().fadeToggle(400);
		}
	});

	$(".resultBox").click(function() {

		// Perform actions only if targeted result box it is not already enlarged
		if($(this).height() === RESULTBOX_DEF_HEIGHT && $(this).width() === RESULTBOX_DEF_WIDTH)
		{
			// Enlarge the selected box
			enlargeResultBox($(this));
			// Change title to reflect the currently enlarged box
			displayCorrectResultsLabel($(this)[0].id);
		}
	});

	$("#btnRestore").click(function() {

		// Perform actions only if targeted result box it is already enlarged
		if($(this).height() !== RESULTBOX_DEF_HEIGHT && $(this).width() !== RESULTBOX_DEF_WIDTH)
		{
			// Restore the enlarged box to default size
			restoreResultBox();
			// Change title back to general label
			displayCorrectResultsLabel($(this)[0].id);
		}
	});


	//
	// Interaction Panel Helper Functions
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

	function dispayCorrectInteractionLabel()
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

	//
	// Results Panel Helper Functions
	//
	function enlargeResultBox(targetBox)
	{
		// Change the box's z-index before animating in order to cover the other boxes
		targetBox.css("z-index", "2");

	    var targetBoxId = targetBox[0].id;

	    // Perform animation on the targeted box
	    switch(targetBoxId)
	    {
		    case "errors": targetBox.animate({
								width: "417px",
								height: "322px",
								borderWidth: "4px"
								}, 400, function() {
									$("#btnRestore").show();
								});
							break;
			case "trace":	targetBox.animate({
								left: "0px",
								width: "417px",
								height: "322px",
								borderWidth: "4px"
								}, 400, function() {
									$("#btnRestore").show();
								});
							break;
			case "symbolTable":	targetBox.animate({
									top: "49px",
									left: "0px",
									width: "417px",
									height: "322px",
									borderWidth: "4px"
									}, 400, function() {
										$("#btnRestore").show();
									});
								break;
			case "output":	targetBox.animate({
								top: "49px",
								left: "0px",
								width: "417px",
								height: "322px",
								borderWidth: "4px"
								}, 400, function() {
									$("#btnRestore").show();
								});
							break;
	    }

	    // Remove label and highlight hover event when enlarged
		targetBox.removeClass("resultBoxHighlight");
		targetBox.children().hide();
	}

	function restoreResultBox()
	{
		var targetBox = null;
		var targetBoxId = "";

	    // Determine which box is enlarged
	    if($("#errors").height() !== RESULTBOX_DEF_HEIGHT)
	    {
	    	targetBox = $("#errors");
	    	targetBoxId = "errors";
	    }
	    else if($("#trace").height() !== RESULTBOX_DEF_HEIGHT)
	    {
	    	targetBox = $("#trace");
	    	targetBoxId = "trace";
	    }
	    else if($("#symbolTable").height() !== RESULTBOX_DEF_HEIGHT)
	    {
	    	targetBox = $("#symbolTable");
	    	targetBoxId = "symbolTable";
	    }
	    else if($("#output").height() !== RESULTBOX_DEF_HEIGHT)
	    {
	    	targetBox = $("#output");
	    	targetBoxId = "output";
	    }

	    // Do i need to check each case bc all boxes are doing the same thing?
	    // Perform animation on the targeted box
	    switch(targetBoxId)
	    {
		    case "errors": targetBox.animate({
								width: RESULTBOX_DEF_WIDTH.toString(),
								height: RESULTBOX_DEF_HEIGHT.toString(),
								borderWidth: "2px"
								}, 400, function() {
									// Change the box's z-index back to original value after restoring
									targetBox.css("z-index", "1");
								});

								$("#btnRestore").hide();
							break;
			case "trace":	targetBox.animate({
								left: "220px",
								width: RESULTBOX_DEF_WIDTH.toString(),
								height: RESULTBOX_DEF_HEIGHT.toString(),
								borderWidth: "2px"
								}, 400, function() {
									// Change the box's z-index back to original value after restoring
									targetBox.css("z-index", "1");
								});

								$("#btnRestore").hide();
							break;
			case "symbolTable":	targetBox.animate({
									top: "221px",
									width: RESULTBOX_DEF_WIDTH.toString(),
									height: RESULTBOX_DEF_HEIGHT.toString(),
									borderWidth: "2px"
									}, 400, function() {
									// Change the box's z-index back to original value after restoring
									targetBox.css("z-index", "1");
								});

								$("#btnRestore").hide();
								break;
			case "output":	targetBox.animate({
								top: "221px",
								left: "220px",
								width: RESULTBOX_DEF_WIDTH.toString(),
								height: RESULTBOX_DEF_HEIGHT.toString(),
								borderWidth: "2px"
								}, 400, function() {
									// Change the box's z-index back to original value after restoring
									targetBox.css("z-index", "1");
								});

								$("#btnRestore").hide();
							break;
	    }
	}

	function displayCorrectResultsLabel(boxId)
	{
		// Change title to reflect the currently enlarged box
		switch(boxId)
		{
			case "errors": $("#resultsPanelLabel").fadeOut(400, function() {
								$("#resultsPanelLabel").text("Errors").fadeIn(400);
							}); break;
			case "trace": $("#resultsPanelLabel").fadeOut(400, function() {
								$("#resultsPanelLabel").text("Trace").fadeIn(400);
							}); break;
			case "symbolTable": $("#resultsPanelLabel").fadeOut(400, function() {
								$("#resultsPanelLabel").text("Symbol Table").fadeIn(400);
							}); break;
			case "output": $("#resultsPanelLabel").fadeOut(400, function() {
								$("#resultsPanelLabel").text("Generated Output").fadeIn(400);
							}); break;

			default: $("#resultsPanelLabel").fadeOut(400, function() {
								$("#resultsPanelLabel").text("Results").fadeIn(400);
							}); break;
		}
	}
});

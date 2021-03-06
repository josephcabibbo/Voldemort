/*  -------------------------------------------------
 *	Filename: control.js
 *	Author: Joey Cabibbo
 *	Requires: globals.js, outputManager.js, ast.js
 *	Description: The "controller" if you will..
 *		     Initializes and responds to the page
 *	------------------------------------------------- */

$(document).ready(function() {

	//
	// General Initalization
	//

	// Initialize Global Variables in globals.js
	initializeGlobalVariables();
	// Build an HTML table to display the language grammar
	createGrammerTable();
	// Write the test cases in the testCase div
	writeTestCases();

	_OutputManager.addTraceEvent("Compiler is initialized and ready...", "green");

	//
	// Interaction Panel Events
	//

	// Click event to show the appropriate interaction element and compile if necessary
	$(".button").click(function() {

		// Compile code
		if(this.innerText === "Compile Source Code")
		{
		    // Clear all result boxes
		    _OutputManager.clearAllOutput();
		    // Clear the symbol table list
		    _SymbolTableList = [];
		    // Add trace start-up message
		    _OutputManager.addTraceEvent("Compiler is initialized and ready...", "green");

			// Lexical analysis
			var isLexSuccessful = _Lexer.lex();
			// Parse
			if(isLexSuccessful)
				var isParseSuccessful = _Parser.parse();
			// CST, AST, and semantic analysis
			if(isParseSuccessful)
			{
				createCST();
				createSymbolTableAndAST();
				var isSemanticAnalysisSuccessful = checkSemantics();
			}
			// Code generation
			if(isSemanticAnalysisSuccessful)
			{
				generateCode();
				// Great success
				_OutputManager.denoteSuccess();
			}
		}

		displayCorrectElement(this);
		dispayCorrectInteractionLabel();
		displayCorrectButton();
	});

	// Keydown event for the source code area to allow tabs
	$("#sourceCode").keydown(function(event) {

		// Tab event
		if(event.which === 9)
		{
			// Get the start and end position
		    var start = this.selectionStart;
            var end   = this.selectionEnd;

            // Set the textarea value to [text before tab] + tab + [text after tab]
	        $(this).val($(this).val().substring(0, start) + "\t" + $(this).val().substring(end));

	        // Put cursor at right position again
	        this.selectionStart = this.selectionEnd = start + 1;

			// Prevent the default action which is tab away and lose focus
			event.preventDefault();
		}
	});

	//
	// Results Panel Events
	//

	// Click event to enlarge the selected result box
	$(".resultBox").click(function() {

		// Perform actions only if targeted result box it is not already enlarged
		if($(this).height() === RESULTBOX_DEF_HEIGHT && $(this).width() === RESULTBOX_DEF_WIDTH)
		{
			// Enlarge the selected box
			enlargeResultBox($(this));
			// Change title to reflect the currently enlarged box
			displayCorrectResultsLabel($(this)[0].id);

			// Toggle the highlight class matching the target box
			var targetBoxId = $(this)[0].id;
			$(this).removeClass(targetBoxId + "BoxHighlight");

			// Show text within div so it shows when clicking
			$(this).children().show();
		}
	});

	// Click event to restore the enlarged result box
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

	// Hover event to color the result box and show its title
	$(".resultBox").hover(
		// Hover on
		function() {
			// Perform actions only if targeted result box it is not enlarged
			if($(this).height() === RESULTBOX_DEF_HEIGHT && $(this).width() === RESULTBOX_DEF_WIDTH)
			{
				// Add the highlight class matching the target box
				var targetBoxId = $(this)[0].id;
				$(this).addClass(targetBoxId + "BoxHighlight");

				// Change to the pointer cursor to show it is clickable
				$(this).css("cursor", "pointer");

				// Hide text within div so it doesnt obstruct the label
				$(this).children().hide();
			}
		},
		// Hover off
		function() {
			// Perform actions only if targeted result box it is not enlarged
			if($(this).height() === RESULTBOX_DEF_HEIGHT && $(this).width() === RESULTBOX_DEF_WIDTH)
			{
				// Remove the highlight class matching the target box
				var targetBoxId = $(this)[0].id;
				$(this).removeClass(targetBoxId + "BoxHighlight");

				// Show text when hover animation is over
				$(this).children().show();
			}
		});

	//
	//	General Helper Functions
	//

	// Helper function to initialize the global variables
	function initializeGlobalVariables()
	{
    	_OutputManager = new OutputManager(); // Object responsible for all output to user
		_Lexer = new Lexer();	              // Object responsible for lexical analysis
		_Parser = new Parser();               // Object responsible for parsing
		_SymbolTableList = [];  			  // Array that contains each scope's hash symbol table object
	}

	//
	// Interaction Panel Helper Functions
	//

	// Display the selected interaction element
	function displayCorrectElement(button)
	{
		if(button.id === "btnCompile")
		{
			// Show source code
			$("#sourceCode").show(400);
			// Hide others
			$("#languageGrammar").hide();
			$("#testCases").hide();
		}
		else if(button.id === "btnShowGrammar")
		{
			// Show grammar
			$("#languageGrammar").show(400);
			// Hide others
			$("#sourceCode").hide();
			$("#testCases").hide();
		}
		else if(button.id === "btnShowTestCases")
		{
			// Show test cases
			$("#testCases").show(400);
			// Hide others
			$("#sourceCode").hide();
			$("#languageGrammar").hide();

		}
	}

	// Display an interaction label to reflect the currently showing interaction element
	function dispayCorrectInteractionLabel()
	{
		if( $("#sourceCode").is(":visible") && $("#interactionPanelLabel").text() != "Source Code" )
		{
			$("#interactionPanelLabel").fadeOut(400, function() {
				$("#interactionPanelLabel").text("Source Code").fadeIn(400);
			});
		}
		else if( $("#languageGrammar").is(":visible") && $("#interactionPanelLabel").text() != "Language Grammar" )
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
		// If the source code is visible give the user the option to compile the code
		if($("#sourceCode").is(":visible"))
			$("#btnCompile").text("Compile Source Code");
		else
			$("#btnCompile").text("Show Source Code");
	}

	// Create and show the table containing the language grammar
	function createGrammerTable()
	{
		// Build table to show the language grammer
		var newContent = "<table id='grammarTable'>" +
                            "<tr>" + "<td>Program</td><td>::== Statement $</td>"                          + "</tr>" +
                            "<tr>" + "<td>Statement</td><td>::== print ( Expr )</td>"                     + "</tr>" +
                            "<tr>" + "<td></td><td>::== Id = Expr</td>"                                   + "</tr>" +
                            "<tr>" + "<td></td><td>::== VarDecl</td>"                                     + "</tr>" +
                            "<tr>" + "<td></td><td>::== { StatementList }</td>"                           + "</tr>" +
                            "<tr>" + "<td></td><td>::== WhileStatement</td>"                           	  + "</tr>" +
                            "<tr>" + "<td></td><td>::== IfStatement</td>"                           	  + "</tr>" +
                            "<tr>" + "<td>WhileStatement</td><td>::== while BooleanExpr { StatementList }</td>" + "</tr>" +
                            "<tr>" + "<td>IfStatement</td><td>::== if BooleanExpr { StatementList }</td>" + "</tr>" +
                            "<tr>" + "<td>Statement List</td><td>::== Statement StatementList</td>"       + "</tr>" +
                            "<tr>" + "<td></td><td>::== ε</td>"                                           + "</tr>" +
                            "<tr>" + "<td>Expr</td><td>::== IntExpr</td>"                                 + "</tr>" +
                            "<tr>" + "<td></td><td>::== StringExpr</td>"                                  + "</tr>" +
                            "<tr>" + "<td></td><td>::== BooleanExpr</td>"                                 + "</tr>" +
                            "<tr>" + "<td></td><td>::== Id</td>"                                          + "</tr>" +
                            "<tr>" + "<td>IntExpr</td><td>::== digit op Expr</td>"                        + "</tr>" +
                            "<tr>" + "<td></td><td>::== digit</td>"                                       + "</tr>" +
                            "<tr>" + "<td>StringExpr</td><td>::== \" CharList \"</td>"                    + "</tr>" +
                            "<tr>" + "<td>BooleanExpr</td><td>::== ( Expr == Expr )</td>"                 + "</tr>" +
                            "<tr>" + "<td></td><td>::== boolVal</td>"                       		 	  + "</tr>" +
                            "<tr>" + "<td>CharList</td><td>::== Char CharList</td>"                       + "</tr>" +
                            "<tr>" + "<td></td><td>::== Space CharList</td>"                       		  + "</tr>" +
                            "<tr>" + "<td></td><td>::== ε</td>"                                           + "</tr>" +
                            "<tr>" + "<td>VarDecl</td><td>::== Type Id</td>"                              + "</tr>" +
                            "<tr>" + "<td>Type</td><td>::== int | string | boolean</td>"                  + "</tr>" +
                            "<tr>" + "<td>Id</td><td>::== Char</td>"                                      + "</tr>" +
                            "<tr>" + "<td>Char</td><td>::== a | b | c ... z</td>"                         + "</tr>" +
                            "<tr>" + "<td>Space</td><td>::== the space character</td>"                    + "</tr>" +
                            "<tr>" + "<td>digit</td><td>::== 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0</td>"  + "</tr>" +
                             "<tr>" + "<td>boolval</td><td>::== false | true</td>"  				 	  + "</tr>" +
                            "<tr>" + "<td>op</td><td>::== + | -</td>"                                     + "</tr>" +
                         "</table>";

		  $("#languageGrammar").html(newContent);
	}

	function writeTestCases()
	{
    	var testCase1 = "Valid Programs:<br />{<br />int a<br />a = 5<br />print ( a )<br />int b<br />b = 1 + 2 + 3 + 4 + a<br />print ( b )<br />print ( \"done\" )<br />}<br />$<br />";

    	var testCase2 = "Scope Tests:<br />{<br />int b<br />b = 2<br />print ( \"in scope zero b is \" )<br />print ( b )<br />{<br />int b<br />b = 9<br />print ( \"in scope one b is \" )<br />print ( b )<br />{<br />int b <br />b = 7<br />print ( \"in scope two b is \" )<br />print ( b )<br />}<br />}<br />print ( \"make changes to scope zero b and it is \" )<br />b = 3<br />print ( b )<br />}<br />$<br />";

    	var testCase3 = "{<br/>int a<br/>int b<br/>a = 5<br/>b = 2<br/>print(a)<br/>{<br/>print(b)<br/>int a<br/>a = 1<br/>print(a)<br/>}<br/>print(a)<br/>}<br/>$<br/>";

    	var testCase4 = "Conditional Tests:<br />{<br />int a<br />a = 5 + 3 + 4<br />int b<br />b = 3<br />if ( b == 3 )<br />{<br />print ( a )<br />}<br />print ( \"done\" )<br />}<br />$<br />";

    	var testCase5 = "{<br />int a<br />a = 5<br />while( a == 5 )<br />{<br />print ( 1 )<br />print ( 1 + 1 )<br />print ( 1 + 1 + 1 )<br />a = 1<br />}<br />print ( \"done\" )<br />}<br />$<br />";

    	var testCase6 = "This will cause lex to fail:<br/>{<br/>int a<br/>a = #<br/>hello<br/>string s<br/>s=\"LETTERS\"<br/>}<br/>$<br/>";

    	var testCase7 = "This will pass lex but cause parse to fail:<br/>{<br/>int a<br/>a = int<br/>print { 2 + a }<br/>{<br/>string s<br/>s = \"hello\"<br/>print ( + )<br/>}" +
    					"<br/>int k<br/>k = 7<br/>int x<br/>x = 3 - k<br/>print(k)<br/>}<br/>$<br/>";

    	var proTip	  = "Pro Tip: If you leave the EOF token ($) out of the source code, the lexer will warn you and add it for you."

    	$("#testCases").html(testCase1 + "<br/>" + testCase2 + "<br/>" + testCase3 + "<br/>" + testCase4 + "<br/>" + testCase5 + "<br/>" + testCase6 + "<br/>" +  testCase7 + "<br/>" + proTip);
	}

	//
	// Results Panel Helper Functions
	//

	// Enlarge the selected result box and perform necessary back-end work
	function enlargeResultBox(targetBox)
	{
    	// Change the box's z-index before animating in order to cover the other boxes
		targetBox.css("z-index", "2");

		// Change to the defualt cursor when enlarged
		targetBox.css("cursor", "default");

		// Get the id name of the currect target
		var targetBoxId = targetBox[0].id;

	    // Perform enlarge animation on the targeted box and show the restore button
	    switch(targetBoxId)
	    {
		    case "errors": targetBox.animate({
    		                  width: "417px",
    		                  height: "322px",
    		                  "font-size": RESULTBOX_ENL_FONTSIZE,
    		                  borderWidth: "4px",
    		                  }, 400, function() {
        		                  $("#btnRestore").show();
        		              });
        		           break;

			case "trace":  targetBox.animate({
    			              left: "0px",
    			              width: "417px",
    			              height: "322px",
    			              "font-size": RESULTBOX_ENL_FONTSIZE,
    			              borderWidth: "4px",
    			              }, 400, function() {
        			              $("#btnRestore").show();
        			          });
        			       break;

			case "symbolTable":	targetBox.animate({
    			                   top: "49px",
    			                   left: "0px",
    			                   width: "417px",
    			                   height: "322px",
    			                   "font-size": RESULTBOX_ENL_FONTSIZE,
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
    			               "font-size": RESULTBOX_ENL_FONTSIZE,
    			               borderWidth: "4px"
    			               }, 400, function() {
        			               $("#btnRestore").show();
        			           });
							break;
	    }
	}

	// Restore the currently enlarged result box and perform necessary back-end work
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

	    // Perform restore animation on the targeted box and hide the restore button
	    switch(targetBoxId)
	    {
		    case "errors": targetBox.animate({
								width: RESULTBOX_DEF_WIDTH.toString(),
								height: RESULTBOX_DEF_HEIGHT.toString(),
								"font-size": RESULTBOX_DEF_FONTSIZE,
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
								"font-size": RESULTBOX_DEF_FONTSIZE,
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
									"font-size": RESULTBOX_DEF_FONTSIZE,
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
								"font-size": RESULTBOX_DEF_FONTSIZE,
								borderWidth: "2px"
								}, 400, function() {
									// Change the box's z-index back to original value after restoring
									targetBox.css("z-index", "1");
								});

								$("#btnRestore").hide();
							break;
	    }
	}

	// Display a result label to reflect the currently showing result box (if any)
	function displayCorrectResultsLabel(boxId)
	{
		// Change title to reflect the currently enlarged box
		switch(boxId)
		{
			case "errors": 		$("#resultsPanelLabel").fadeOut(400, function()
						   		{
							   		$("#resultsPanelLabel").text("Errors").fadeIn(400);
							   	});
							   	break;

			case "trace": 		$("#resultsPanelLabel").fadeOut(400, function()
						  		{
							  		$("#resultsPanelLabel").text("Trace").fadeIn(400);
							  	});
							  	break;

			case "symbolTable": $("#resultsPanelLabel").fadeOut(400, function()
								{
    			                    $("#resultsPanelLabel").text("Symbol Table").fadeIn(400);
    			                });
    			                break;

			case "output": 		$("#resultsPanelLabel").fadeOut(400, function()
						   		{
							   		$("#resultsPanelLabel").text("Generated Output").fadeIn(400);
							   	});
							   	break;

			default: 		 	$("#resultsPanelLabel").fadeOut(400, function()
					 			{
						 			$("#resultsPanelLabel").text("Results").fadeIn(400);
						 		});
						 		break;
		}
	}
});

/*  -------------------------------------------------
 *	Filename: logHandler.js
 *	Author: Joey Cabibbo
 *	Requires: globals.js
 *	Description: Responsible for all logging events such as
 *				 errors, warnings, trace, symbol table, and
 *				 output.
 *	------------------------------------------------- */

function OutputManager()
{
	// Add an error to the results panel
	this.addError = function(message)
	{
		if(message)
		{
			// Normal case for adding errors (content exists already)
			if($("#errors").html())
			{
				var newContent = "<tr>" +
									"<td><span class='errorText'>Error:</span></td>" +
									"<td><span class='regularText'>" + message + "</span></td>" +
								 "</tr>";

				$("#errorsTable").append(newContent);
			}
			else
			{
				// First add, creates the table
				var newContent = "<table id='errorsTable'>" +
									"<tr>" +
									"<td><span class='errorText'>Error:</span></td>" +
									"<td><span class='regularText'>" + message + "</span></td>" +
									"</tr>" +
								 "</table>";

				$("#errors").html(newContent);
			}
		}
	}

	// Add a warning to the results panel
	this.addWarning = function(message)
	{
		if(message)
		{
			// Normal case for adding warnings (content exists already)
			if($("#errors").html())
			{
				var newContent = "<tr>" +
									"<td><span class='warningText'>Warning:</span></td>" +
									"<td><span class='regularText'>" + message + "</span></td>" +
								 "</tr>";

				$("#errorsTable").append(newContent);
			}
			else
			{
				// First add, creates the table
				var newContent = "<table id='errorsTable'>" +
									"<tr>" +
									"<td><span class='warningText'>Warning:</span></td>" +
									"<td><span class='regularText'>" + message + "</span></td>" +
									"</tr>" +
								 "</table>";

				$("#errors").html(newContent);
			}
		}
	}

	// Add a trace event to the results panel (Provide optional color)
	this.addTraceEvent = function(message, color)
	{
		if(message)
		{
		    // Set color class
		    var colorClass;

		    switch(color)
		    {
    		    case "red":   colorClass = "errorText";   break;
    		    case "green": colorClass = "successText"; break;
    		    default:      colorClass = "regularText"; break;
		    }

			// Normal case for adding trace events (content exists already)
			if($("#trace").html())
			{
				var newContent = $("#trace").html() + "<br/>" + "<span class=" + colorClass + ">" + message + "</span>";
				$("#trace").html(newContent);
			}
			else
			{
				// No need to add old content and a line break if there is no content yet
				var newContent = "<span class=" + colorClass + ">" + message + "</span>";
				$("#trace").html(newContent);
			}
		}
	}

	// Take the _SymbolList of symbol-value pairs and display it
	this.updateSymbolTable = function()
	{
	   // Clear symbolTable
	   $("#symbolTable").html("");

	   // Iterate symbol tables by scope
	   for(var i = 0; i < _SymbolTableList.length; i++)
	   {
	   	   // Display the table title (scope 0, 1, 2, ...)
	   	   // Do not put a line break if it is the first thing added to the result box
	   	   if($("#symbolTable").html())
	   	       $("#symbolTable").append("<br/><div>------------------- Scope " + i.toString() + " -------------------</div>");
	   	   else
	   	   	   $("#symbolTable").append("<div>------------------- Scope " + i.toString() + " -------------------</div>");

		   // Concatenate the appropriate id for this scopes table
		   var tableId = "symbolTable" + i.toString();
		   // Create a table for this scope
		   var newTable = "<table id='" + tableId + "'>" +
			                    "<tr>" +
								    "<th><span class='regularText'>Id</span></th>" +
								    "<td>&nbsp;</td>" +
								    "<th><span class='regularText'>Value</span></th>" +
								    "<td>&nbsp;</td>" +
								    "<th><span class='regularText'>Type</span></th>" +
								    "<td>&nbsp;</td>" +
								    "<th><span class='regularText'>Scope</span></th>" +
								    "<td>&nbsp;</td>" +
								    "<th><span class='regularText'>Line</span></th>" +
								"</tr>"
					       "</table>";

			// Add the table to the symbolTable result box
			$("#symbolTable").append(newTable);

			// Get the scope's corresponding symbol table
			var currentSymbolTable = _SymbolTableList[i];

			// Iterate symbols and add it to the appropriate table
			for(var symbol in currentSymbolTable)
			{
				// Filter out keys from the Object.prototype (if any) and do not display the parentScope attribute
				if(currentSymbolTable.hasOwnProperty(symbol) && symbol !== "parentScope")
				{
					var newContent = "<tr>" +
        								"<td><span class='regularText'>" + symbol + "</span></td>" +
        								"<td>&nbsp;</td>" +
    								    "<td><span class='regularText'>" + currentSymbolTable[symbol].value + "</span></td>" +
    								    "<td>&nbsp;</td>" +
    								    "<td><span class='regularText'>" + currentSymbolTable[symbol].type  + "</span></td>" +
    								    "<td>&nbsp;</td>" +
    								    "<td><span class='regularText'>" + currentSymbolTable[symbol].scope  + "</span></td>" +
    								    "<td>&nbsp;</td>" +
    								    "<td><span class='regularText'>" + currentSymbolTable[symbol].line + "</span></td>" +
        							 "</tr>";

        			$("#" + tableId).append(newContent);
				}
			}
	   }
	}

	// Take the opcodeList and display it
	this.displayOutput = function(opcodeList)
	{
		// TODO
	}

	// Log the appropriate success messages
	this.denoteSuccess = function()
	{
		// Error Box
		if($("#errors").html())
		{
			// Use this only if context already exists
			var newContent = $("#errors").html() + "<span class='successText'>No errors found!</span>";
			$("#errors").html(newContent);
		}
		else
		{
			var newContent = "<span class='successText'>No errors found!</span>";
			$("#errors").html(newContent);
		}

		// Trace Box
		if($("#trace").html())
		{
			// Use this only if context already exists
			var newContent = $("#trace").html() + "<br/><span class='successText'>Compilation Successful!</span>";
			$("#trace").html(newContent);
		}
		else
		{
			// No need to add old content and a line break if there is no content yet
			var newContent = "<span class='successText'>Compilation Successful!</span>";
			$("#trace").html(newContent);
		}
	}

	this.clearAllOutput = function()
	{
    	$("#errors").html("");
    	$("#trace").html("");
    	$("#symbolTable").html("");
    	$("#output").html("");
	}
}
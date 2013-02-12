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
									"<td><span class='warningText'>Error:</span></td>" +
									"<td><span class='regularText'>" + message + "</span></td>" +
									"</tr>" +
								 "</table>";

				$("#errors").html(newContent);
			}
		}
	}

	// Add a trace event to the results panel
	this.addTraceEvent = function(message)
	{
		if(message)
		{
			// Normal case for adding trace events (content exists already)
			if($("#trace").html())
			{
				var newContent = $("#trace").html() + "<br />" + "<span class='regularText'>" + message + "</span>";
				$("#trace").html(newContent);
			}
			else
			{
				// No need to add old content and a line break if there is no content yet
				var newContent = "<span class='regularText'>" + message + "</span>";
				$("#trace").html(newContent);
			}
		}
	}

	// Take the symbolList of key:value pairs and display it
	this.displaySymbolTable = function(symbolList)
	{
		// TODO
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
			var newContent = $("#trace").html() + "<br /><span class='successText'>Compilation Successful!</span>";
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
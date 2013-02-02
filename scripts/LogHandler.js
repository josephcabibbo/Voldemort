/*  -------------------------------------------------
 *	Filename: logHandler.js
 *	Author: Joey Cabibbo
 *	Requires: globals.js
 *	Description: Responsible for all logging events such as
 *				 errors, warnings, trace, symbol table, and
 *				 output.
 *	------------------------------------------------- */

function Logger()
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
									"<td><span class='errorText'>Error:</td>" +
									"<td><span class='regularText'>" + message + "</td>" +
								 "</tr>";

				$("#errorsTable").append(newContent);
			}
			else
			{
				// First add, creates the table
				var newContent = "<table id='errorsTable'>" +
									"<tr>" +
									"<td><span class='errorText'>Error:</td>" +
									"<td><span class='regularText'>" + message + "</td>" +
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
									"<td><span class='warningText'>Warning:</td>" +
									"<td><span class='regularText'>" + message + "</td>" +
								 "</tr>";

				$("#errorsTable").append(newContent);
			}
			else
			{
				// First add, creates the table
				var newContent = "<table id='errorsTable'>" +
									"<tr>" +
									"<td><span class='warningText'>Error:</td>" +
									"<td><span class='regularText'>" + message + "</td>" +
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
}
/*  --------------------------------------------------------------------------
 *	Filename: lexer.js
 *	Author: Joey Cabibbo
 *  Requires: globals.js, tokenIntrospection.js
 *	Description: Lexical analysis of source code (Produces a stream of tokens)
 *	-------------------------------------------------------------------------- */

function Lexer()
{
 	// Array of tokens
	this.tokenList = [];
	// Reference to the number of errors found
	this.errorCount = 0;

	// Lexically analyze the user submitted source code and produce an array of tokens if successful
	this.lex = function()
	{
		// Reset lex's members
		this.tokenList = [];
		this.errorCount = 0;

		// Information needed to construct token objects
		var kind;
		var name;
		var value;
		var type;
		var lineNum;
		var scope;

		// Grab the "trimmmed" source code text
		var sourceCode = $("#sourceCode").val().trim();

		// Return if source code is empty and display error
		if(sourceCode === "")
		{
		   _OutputManager.addError("There is no source code...")
		   return;
		}

		// Split the source code into individual lines
		var lineArray = splitSourceByLines(sourceCode);

		// Iterate lines
		for(var i = 0; i < lineArray.length; i++)
		{
		   // Split the current line into proper tokens using the ugliest regular expression in the world
		   //var tokenArray = lineArray[i].match(/"[^"]*"|[^$\s=\(\)\"\{\}+-]+|[$=\(\)\"\{\}+-]/g);
		   var tokenArray = lineArray[i].match(/"[^"]*"|==|[^$\s=)(}{+-]+|[$=)(}{+-]/g);
		   /*
		    * "[^"]*"        - match a string (double quote followed by anything but a double quote followed by a double quote)
		    * |              - OR
		    * ==             - equality operator
		    * |              - OR
		    * [^$\s=)(}{+-]+ - match sets of substrings NOT containing these characters (everything else except the symbols)
		    * |              - OR
		    * [$=)(}{+-]	 - match these characters
		    * g              - global match
		    */

		    // Iterate tokens on the line
		    for(var x = 0; x < tokenArray.length; x++)
		    {
		        // Fill token characteristics
			    kind    = getTokenKind(tokenArray[x]);
			    name    = getTokenName(tokenArray[x]);
			    value   = getTokenValue(tokenArray[x]);
			    type    = getTokenType(tokenArray[x]);
			    lineNum = i + 1;
			    scope	= null;

			    // If any token is not recognized, invalid token lex error
			    if(kind === undefined)
			    {
			       _OutputManager.addError("Lex Error: invalid token, " + tokenArray[x] + ", on line " + (i+1));
		    	   this.errorCount++;
			    }

			    // Check to see if there is code after the EOF token
			    if(kind === TOKEN_EOF)
			    {
			    	// If there are lines after EOF or tokens after EOF, remove them from being lexed
			    	if(lineArray.length > lineNum || tokenArray.indexOf("$") + 1 < tokenArray.length)
			    	{
		        	    // Provide warning and trace
		        	    _OutputManager.addWarning("Content exists after the EOF token. I will ignore it, dont worry.");
		        	    _OutputManager.addTraceEvent("Removing content after EOF token from stream of tokens...");

		        	    // Additional tokens exist after the line containing the EOF token, remove them
		        	    if(lineArray.length > lineNum)
		        	    	lineArray.splice(lineNum , lineArray.length);

		        	    // Additional tokens exist on the same line after the EOF token, remove them
		        	    if(tokenArray.indexOf("$") + 1 < tokenArray.length)
		        	    	tokenArray.splice(x + 1, tokenArray.length);

		        	    // Remove content after the EOF token and display it
		        	    // Trace result message
		        	    _OutputManager.addTraceEvent("Content after EOF token has been removed from stream of tokens!", "green");
		    	    }
			    }

			    // Construct token and add it to the Lexer's token list (stream)
			    this.tokenList.push(new Token(kind, name, value, type, lineNum, scope));
		    }
		}

		// Check to see if the user placed a $ at the end of the program
		var lastToken = this.tokenList[this.tokenList.length - 1];

		if(lastToken.kind !== TOKEN_EOF)
		{
		    // Provide warning and trace
		    _OutputManager.addWarning("You forgot to place a $ at the end of your program. I'll let it slide this time...");
		    _OutputManager.addTraceEvent("Adding EOF token to stream of tokens...");
		    // Add EOF token to the tokenList
		    this.tokenList.push(new Token(TOKEN_EOF, null, "$", null, lastToken.line + 1, null));
		    // Trace result message
		    _OutputManager.addTraceEvent("EOF token has been added to steam of tokens!", "green");
		}

		if(this.errorCount === 0)
		{
			_OutputManager.addTraceEvent("Lex successful!", "green");
			return true;
		}
		else
		{
		    _OutputManager.addTraceEvent("Lex failed!", "red");
			return false;
		}
	}
}

//
//  Lex Helper Functions
//

// Helper function to split the source code by individual lines
function splitSourceByLines(sourceCode)
{
     return sourceCode.split(/[\n\r]+/g);
     /*
      * [\n\r]+ - 1 or more instances of newline or carriage return
      * g       - global match
      */
}

// Helper function that takes a token and returns its "kind"
function getTokenKind(token)
{
    if(isReservedWord(token))
        return getReservedWordKind(token);
    else if(isSymbol(token))
        return getSymbolKind(token);
    else if(isIdentifier(token))
        return TOKEN_ID;
    else if(isInteger(token))
        return TOKEN_INT;
    else if(isString(token))
    	return TOKEN_STRING;
    else
        return undefined;
}

// Helper function that takes a token and returns its name
function getTokenName(token)
{
    if(isIdentifier(token))
        return token;
    else
        return null;
}

// Helper function that takes a token and returns its value
function getTokenValue(token)
{
    if(isInteger(token))
        return parseInt(token);
    else if(isString(token))
    	return token;
    else if(isReservedWord(token))
    	return token.replace(/"/g, ""); // A reserved word's value is the word w/out the double-quotes
    else if(isSymbol(token))
    	return token.replace(/"/g, ""); // A symbol's value is the symbol w/out the double-quotes
    else
        return null;
}

// Helper function that takes a token and returns its type
function getTokenType(token)
{
    // The only types we have are int, string, and boolean
    if(isInteger(token))
        return "int";
    else if(isString(token))
    	return "string";
    else if(isBoolean(token))
    	return "boolean";
    else
        return null;
}

// Helper function that takes a symbol token string and returns its "kind"
function getSymbolKind(token)
{
    // Kind to return
    var kind;

    switch(token)
    {
        case "-":  kind = TOKEN_OP;      	  break;
        case "$":  kind = TOKEN_EOF;          break;
        case "+":  kind = TOKEN_OP;        	  break;
        case "==": kind = TOKEN_EQUALITY;	  break;
        case "=":  kind = TOKEN_ASSIGN;       break;
        case ")":  kind = TOKEN_CLOSEPAREN;   break;
        case "(":  kind = TOKEN_OPENPAREN;    break;
        case "}":  kind = TOKEN_CLOSEBRACKET; break;
        case "{":  kind = TOKEN_OPENBRACKET;  break;

        default:   kind = undefined;          break;
    }

    return kind;
}

// Helper function that takes a reserved word token string and returns its "kind"
function getReservedWordKind(token)
{
    // Kind to return
    var kind;

    switch(token)
    {
        case "int":     kind = TOKEN_TYPE;  break;
        case "string":  kind = TOKEN_TYPE;	break;
        case "boolean": kind = TOKEN_TYPE;	break;
        case "print":   kind = TOKEN_PRINT; break;
        case "if":		kind = TOKEN_IF;	break;
        case "while":	kind = TOKEN_WHILE; break;
        case "true":	kind = TOKEN_BOOL;	break;
        case "false":	kind = TOKEN_BOOL;	break;

        default:        kind = undefined;   break;
    }

    return kind;
}

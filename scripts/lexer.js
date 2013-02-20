/*  -------------------------------------------------
 *	Filename: lexer.js
 *	Author: Joey Cabibbo
 *  Requires: globals.js, tokenIntrospection.js
 *	Description: Lexical analysis of source code
 *	------------------------------------------------- */

// TODO: Create a lex object called lexErrorList and do a for at the end to display all found errors

function Lexer()
{
 	// Array of tokens
	this.tokenList = [];

	// Lexically analyze the user submitted source code and produce an array of tokens if successful
	this.lex = function()
	{
	   // Information needed to construct token objects
	   var kind;
	   var name;
	   var value;
	   var type;
	   var lineNum;

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
	       var tokenArray = lineArray[i].match(/"[^" ]*"|[^P\s=\(\)\"\{\}+-]+|[P=\(\)\"\{\}+-]/g);
    	   /*
    	    * "[^" ]*"             - match a double quote followed by anything but a double quote or space followed by a double quote
    	    * |                    - OR
    	    * [^P\s=\(\)\"\{\}\;]+ - match sets of substrings NOT containing these characters
    	    * |                    - OR
    	    * [P=\(\)\"\{\}\;]     - match these characters
    	    * g                    - global match
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

        	    // If any token is not recognized, invalid token lex error
        	    if(kind === undefined)
        	    {
        	       _OutputManager.addError("Invalid token, " + tokenArray[x] + ", on line " + (i+1));
            	   return;
        	    }

        	    // Check to see if there is code after the EOF token
        	    if(kind === TOKEN_EOF)
        	    {
        	    	if(lineArray.length > lineNum || tokenArray.length > 1)
        	    	{
		        	    // Provide warning and trace
		        	    _OutputManager.addWarning("Content exists after EOF token... I'll be your slave and remove it, dont worry.");
		        	    _OutputManager.addTraceEvent("Removing content after EOF token...");

		        	    // Additional tokens exist after the line containing the EOF token, remove them
		        	    if(lineArray.length > lineNum)
		        	    	lineArray.splice(lineNum , lineArray.length);

		        	    // Additional tokens exist on the same line after the EOF token, remove them
		        	    if(tokenArray.length > 1)
		        	    	tokenArray.splice(x + 1, tokenArray.length);

		        	    // Remove content after the EOF token and display it
		        	    $("#sourceCode").val(sourceCode.substring(0, sourceCode.indexOf("$") + 1));
		        	    // Trace result message
		        	    _OutputManager.addTraceEvent("Content after EOF token has been removed!", "green");
	        	    }
        	    }

        	    // Construct token and add it to the Lexer's token list (stream)
        	    this.tokenList.push(new Token(kind, name, value, type, lineNum));

        	    // Add identifiers to the _SymbolTable object and update the symbol table display
        	   if(isIdentifier(tokenArray[x]))
        	   {
        	        _SymbolTable[name] = value;
        	        _OutputManager.updateSymbolTable();
        	   }
            }
        }

        // Check to see if the user placed a $ at the end of the program
        var lastToken = this.tokenList[this.tokenList.length - 1];

        if(lastToken.kind !== TOKEN_EOF)
        {
            // Provide warning and trace
            _OutputManager.addWarning("You forgot to place a $ at the end of your program... I'll be your slave and do it, dont worry.");
            _OutputManager.addTraceEvent("Adding EOF token to stream of tokens...");
            // Add it to source code
            $("#sourceCode").val($("#sourceCode").val().trim() + "\n$");
            // Add EOF token to the tokenList
            this.tokenList.push(new Token(TOKEN_EOF, null, null, null, lastToken.line + 1));
            // Trace result message
            _OutputManager.addTraceEvent("EOF token has been added to steam of tokens!", "green");
        }

        // If we got this far, there were no lex errors
        _OutputManager.addTraceEvent("Lex successful!", "green");

        return true;
    }
}

//
//  Lex Helper Functions
//

// Helper function to split the source code by individual lines
function splitSourceByLines(sourceCode)
{
     return sourceCode.split(/[\n\r]/g);
     /*
      * [\n\r] - 1 or more instances of newline or carriage return
      * g      - global match
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
    else if(isCharList(token))
        return TOKEN_CHAR;
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
    // Only integers will receive values in lex
    if(isInteger(token))
        return parseInt(token);
    else
        return null;
}

// Helper function that takes a token and returns its type
function getTokenType(token)
{
    // The only types we have are int and char
    if(isInteger(token))
        return "int";
    else if(isCharList(token))
        return "char";
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
        case "-": kind = TOKEN_MINUS;        break;
        case "$": kind = TOKEN_EOF;          break;
        case "+": kind = TOKEN_PLUS;         break;
        case "=": kind = TOKEN_ASSIGN;       break;
        case ")": kind = TOKEN_CLOSEPAREN;   break;
        case "(": kind = TOKEN_OPENPAREN;    break;
        case "}": kind = TOKEN_CLOSEBRACKET; break;
        case "{": kind = TOKEN_OPENBRACKET;  break;
        default:  kind = undefined;          break;
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
        case "int":  kind = TOKEN_INT_TYPEDEC;  break;
        case "char": kind = TOKEN_CHAR_TYPEDEC; break;
        case "P":    kind = TOKEN_PRINT;        break;
        default:     kind = undefined;          break;
    }

    return kind;
}
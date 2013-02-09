/*  -------------------------------------------------
 *	Filename: lexer.js
 *	Author: Joey Cabibbo
 *	Description: Lexical analysis of source code
 *	------------------------------------------------- */

function Lexer()
{
 	// Array of tokens
	this.tokenList = [];

	// Lexically analyze the user submitted source code and produce an array of tokens if successful
	this.lex = function()
	{
	   // Grab the "trimmmed" source code text
	   var sourceCode = $("#sourceCode").val().trim();

	   // Split the source code into individual lines
	   var lineArray = splitSourceByLines(sourceCode);

	   // Iterate lines
	   for(var i = 0; i < lineArray.length; i++)
	   {
	       // Split the current line into proper tokens using the ugliest regular expression in the world
    	   var tokenArray = lineArray[i].match(/"[^"]*"|[^\s=\(\)\"\{\};+-]+|[=\(\)\"\{\};+-]/g);
    	   /*
    	    * "[^"]*"               - match a double quote followed by non-quotes followed by a double quote
    	    * |                     - OR
    	    * [^\s=\(\)\'\"\{\}\;]+ - match sets of substrings NOT containing these characters
    	    * |                     - OR
    	    * [=\(\)\'\"\{\}\;]     - match these characters
    	    * g                     - global match
    	    */

    	    // Iterate tokens
    	    for(var x = 0; x < tokenArray.length; x++)
    	    {
        	    // Determine kind
        	    // Look for value
        	    // Assign line

        	    //console.log(determineTokenKind(tokenArray[x]));

        	    // Token Construction: kind, name, value, type, line
        	    //this.tokenList.push()
        	    _Lexer.tokenList.push(new Token())
    	    }
	   }

	   // 2. Get the token name
	   // 3. Get the line it is on
	   // 4. Determine token kind
	   // 5. Based on the kind, look ahead for the value
	   // 6. Determine type
	   // 7. Add token to token list
	   // 8. Build symbol table as you go?

	   // Return token list if successful or just true and false?, otherwise return null
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
      * [\n\r]+|$ - 1 or more instances of newline or carriage return OR end of line
      * g         - global match
      */
}

// Helper function that takes a token and returns its "kind"
function determineTokenKind(token)
{
    if(isIdentifier(token))
        return TOKEN_ID;
    else if(isInteger(token))
        return TOKEN_INT;
    else if(isDecimal(token))
        return TOKEN_DECIMAL;
}

// Helper function that takes a token string and returns whether it is a valid identifier token
function isIdentifier(token)
{
    return (/^[a-z][a-z0-9]*$/i).test(token);
    /*
     *  ^         - start of token
     *  [a-z]     - any letter a-z
     *  [a-z0-9]* - 0 or more instances of a-z or 0-9
     *  $         - end of token
     *  i         - case insensitive
     */
}

// Helper function that takes a token string and returns whether it is a valid integer token
function isInteger(token)
{
    return (/^[0-9]+$/).test(token);
    /*
     *  ^      - start of token
     *  [0-9]+ - 1 or more intances of any number 0-9
     *  $      - end of token
     */
}

// Helper function that takes a token string and returns whether it is a valid decimal token
function isDecimal(token)
{
    return (/^[0-9]+(.[0-9]*)|[0-9]*(.[0-9]+)$/).test(token);
    /*
     *  ^               - start of token
     *  [0-9]+(.[0-9]*) - 1 or more instances of any number 0-9 followed by a decimal point and 0 or more intances of any number 0-9
     *  |               - OR
     *  [0-9]*(.[0-9]+) - 0 or more instances of any number 0-9 followed by a decimal point and 1 or more intances of any number 0-9
     *  $               - end of token
     */
}

// Helper function that takes a token string and returns whether it is a reserved word
function isReservedWord(token)
{
    // TODO: Add more reserved words
    return (/^(int|char)$/).test(token)
    /*
     *  ^ - start of token
     *  (int|char) - any of the listed reserved words
     *  $ - end of token
     */
}
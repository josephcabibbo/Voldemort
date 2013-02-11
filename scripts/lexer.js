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
	   // Information needed to construct a token object
	   var kind;
	   var name;
	   var value;
	   var type;
	   var lineNum;

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
        	    kind    = getTokenKind(tokenArray[x]);
        	    name    = getTokenName(tokenArray[x]);
        	    value   = getTokenValue(tokenArray[x], tokenArray);
        	    //type    = getTokenType();
        	    lineNum = i + 1;

        	    // Token Construction: kind, name, value, type, line
        	    this.tokenList.push(new Token(kind, name, value, "", lineNum));
        	    //_Lexer.tokenList.push(new Token(kind, "", "", "", lineNum));
    	    }
        }
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
      * [\n\r] - 1 or more instances of newline or carriage return
      * g      - global match
      */
}

// Helper function that takes a token and returns its "kind"
function getTokenKind(token)
{
    if(isType(token))
        return TOKEN_TYPEDEC;
    else if(isIdentifier(token))
        return TOKEN_ID;
    else if(isInteger(token))
        return TOKEN_INT;
    else if(isDecimal(token))
        return TOKEN_DECIMAL;
}

// Helper function that takes a token and returns its name
function getTokenName(token)
{
    if(isIdentifier(token))
        return token;
    else
        return "N/A";
}

// Helper function that takes the token and the tokens on its line and returns its value (if any)
function getTokenValue(token, tokensOnLine)
{
    if(isIdentifier(token))
    {
        // Pair the entire statement together
        var statement = pairCompleteStatement(token, tokensOnLine);
        // Ensure the identifier was defined
        if(isIdentifierDefined(statement));
        {
            // Return the value in the statement [0] is the complete match [1] is the value captured
            return statement.match(/=\s*("|'(.)*"|'|\d+)\s*;/)[1];
            /*
             *  =\s*             - an equal sign followed by zero or more spaces
             *  ("|'(.)*"|'|\d+) - followed by the value we are looking for (capture group)
             *  \s*;             - followed by zero or more spaces and a semi-colon
             */
        }
    }
}

// Helper function that takes the token and the tokens on its line and returns the complete statement
function pairCompleteStatement(token, tokensOnLine)
{
    // Get the index of the token
    var index = tokensOnLine.indexOf(token);

    // Return the complete statement
    return tokensOnLine[index - 1] + " " +  // type
           tokensOnLine[index]     + " " +  // identifier
           tokensOnLine[index + 1] + " " +  // assignment
           tokensOnLine[index + 2] + " " +  // value
           tokensOnLine[index + 3];         // termination (;)
}

// Helper function that takes an entire statment and returns whether the Id has been defined or not
function isIdentifierDefined(statement)
{
    return (/int|char|string\s+([a-z][a-z0-9]*)\s*(=)\s*("|'(.)*"|'|\d+)\s*;/i).test(statement);
    /*
     *  int|char|string  - type declaration
     *  \s+              - followed by one or more spaces
     *  [a-z][a-z0-9]*   - followed by an identifier
     *  \s*(=)\s*        - followed by an equals sign with an arbitray number of spaces on either side
     *  ("|'(.)*"|'|\d+) - followed by a string/charList OR integer/decimal
     *  \s*;             - followed by zero or more spaces and a semi-colon
     *  i                - case insensitive
     */
}

// Helper function that takes a token string and returns whether it is a valid identifier token
function isIdentifier(token)
{
    // Identifiers cannot be type declarations or reserved words
    if(!isType(token) && !isReservedWord(token))
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
     else
        return false;
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

// Helper function that takes a token string and returns whether it is a type declaration
function isType(token)
{
    return (/^(int|char|string)$/).test(token)
    /*
     *  ^ - start of token
     *  (int|char|string) - any of the listed type declarations
     *  $ - end of token
     */
}

// Helper function that takes a token string and returns whether it is a reserved word
function isReservedWord(token)
{
    // TODO: Add more reserved words (should types be in here?)
    return (/^(int|char|string|if|while|for)$/).test(token)
    /*
     *  ^ - start of token
     *  (int|char) - any of the listed reserved words
     *  $ - end of token
     */
}
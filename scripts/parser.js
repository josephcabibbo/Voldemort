/*  -------------------------------------------------
 *	Filename: parser.js
 *	Author: Joey Cabibbo
 *  Requires: globals.js
 *	Description: Lexical analysis of source code
 *	------------------------------------------------- */


// ******************************************************************************
// This is what I used in lex to get the value, but it should not be done in lex
// See if any of this will be useful when it comes time to assign values in parse
// ******************************************************************************

/*
// Helper function that takes the token and the tokens on its line and returns its value (if any)
function getTokenValue(token, tokensOnLine)
{
    if(isIdentifier(token))
    {
        // Pair the entire statement together
        var statement = pairCompleteStatement(token, tokensOnLine);
        // Ensure the identifier was defined
        if(isIdentifierDefined(statement))
        {
            // Get the value in the statement... [0] is the complete match [1] is the value captured
            var value = statement.match(/=\s*("[^"]*"|\d+)\s*;/)[1];
            /*
             *  =\s*          - an equal sign followed by zero or more spaces
             *  ("[^"]*"|\d+) - followed by the value we are looking for (capture group)
             *  \s*;          - followed by zero or more spaces and a semi-colon
             *

             // Determine whether it is a number or string
             // If it is a number, convert it, if it is a string leave it as is
             if($.isNumeric(value))
             {
                value = parseInt(value);
             }

             return value;
        }
        else
            return undefined;
    }
    else if(isInteger(token))
        return parseInt(token);
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
    return (/int|char|string\s+([a-z][a-z0-9]*)\s*(=)\s*("[^"]*"|\d+)\s*;/i).test(statement);
    /*
     *  int|char|string - type declaration
     *  \s+             - followed by one or more spaces
     *  [a-z][a-z0-9]*  - followed by an identifier
     *  \s*(=)\s*       - followed by an equals sign with an arbitray number of spaces on either side
     *  ("(.)*"|\d+)    - followed by a string/charList OR integer/decimal
     *  \s*;            - followed by zero or more spaces and a semi-colon
     *  i               - case insensitive
     *
}
*/

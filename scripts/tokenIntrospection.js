/*  --------------------------------------------------------------------------
 *	Filename: tokenIntrospection.js
 *	Author: Joey Cabibbo
 *	Description: A series of introspection functions to determine token "kind"
 *	-------------------------------------------------------------------------- */

// Helper function that takes a token string and returns whether it is a valid identifier token
function isIdentifier(token)
{
    // Identifiers cannot be reserved words
    if(!isReservedWord(token))
    {
        return (/^[a-z][a-z0-9]*$/).test(token);
        /*
         *  ^         - start of token
         *  [a-z]     - any letter a-z
         *  [a-z0-9]* - 0 or more instances of a-z or 0-9
         *  $         - end of token
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

// Helper function that takes a token string and returns whether it is a valid charList token
function isCharList(token)
{
    return (/^"[a-z]*"$/).test(token)
    /*
     *  ^        - start of token
     *  "[a-z]*" - a double quote followed by any lower case letter followed by a double quote
     *  $        - end of token
     */
}

// Helper function that takes a token string and returns whether it is a valid symbol token
function isSymbol(token)
{
    return (/^[-$+=)(}{]$/).test(token);
    /*
     *  ^         - start of token
     *  [-$+)(}{] - one of the listed symbols
     *  $         - end of token
     */
}

// Helper function that takes a token string and returns whether it is a reserved word
function isReservedWord(token)
{
    // TODO: Add more reserved words
    return (/^(int|char|P)$/).test(token)
    /*
     *  ^            - start of token
     *  (int|char|P) - any of the listed reserved words
     *  $            - end of token
     */
}
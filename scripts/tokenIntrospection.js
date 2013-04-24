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
        return (/^[a-z]{1}$/).test(token);
        /*
         *  ^        - start of token
         *  [a-z]{1} - one letter a-z
         *  $        - end of token
         */
     }
     else
        return false;
}

// Helper function that takes a token string and returns whether it is a valid integer token
function isInteger(token)
{
    return (/^[0-9]{1}$/).test(token);
    /*
     *  ^        - start of token
     *  [0-9]{1} - 1 number 0-9
     *  $        - end of token
     */
}

// Helper function that takes a token string and returns whether it is a valid string token
function isString(token)
{
	return (/^"[a-z ]*"$/).test(token)
    /*
     *  ^         - start of token
     *  "[a-z ]*" - a double quote followed by any lower case letter or space followed by a double quote
     *  $         - end of token
     */
}

// Helper function that takes a token string and returns whether it is a valid boolean token
function isBoolean(token)
{
	return (/^(true|false)$/).test(token)
    /*
     *  ^            - start of token
     *  (true|false) - true or false
     *  $            - end of token
     */
}

// Helper function that takes a token string and returns whether it is a valid symbol token
function isSymbol(token)
{
    return (/^([-$+)(}{]|={1,2})$/).test(token);
    /*
     *  ^         		   - start of token
     *  ([-$+)(}{]|={1,2}) - one of the listed symbols OR 1-2 '=' symbols
     *  $         		   - end of token
     */
}

// Helper function that takes a token string and returns whether it is a valid operator token
function isOperator(token)
{
	return (/^[-+]$/).test(token);
    /*
     *  ^    - start of token
     *  [-+] - one of the listed operators
     *  $    - end of token
     */
}

// Helper function that takes a token string and returns whether it is a reserved word
function isReservedWord(token)
{
    // TODO: Add more reserved words
    return (/^(int|string|print|boolean|if|while|true|false)$/).test(token)
    /*
     *  ^                  							   - start of token
     *  (int|string|print|boolean|if|while|true|false) - any of the listed reserved words
     *  $                  							   - end of token
     */
}
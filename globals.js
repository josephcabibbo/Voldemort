/*  -------------------------------------------
 *	Filename: globals.js
 *	Author: Joey Cabibbo
 *	Description: Global CONTANTS and _Variables
 *	------------------------------------------- */

//
// Global Constants
//

// Result box attributes
var RESULTBOX_DEF_WIDTH  = 200;
var RESULTBOX_DEF_HEIGHT = 153;

var RESULTBOX_DEF_FONTSIZE = "8pt";
var RESULTBOX_ENL_FONTSIZE = "14pt";

// Token kinds
var TOKEN_TYPEDEC       = "type declaration";
var TOKEN_ID            = "identifier";
var TOKEN_CHAR          = "character";
var TOKEN_STRING        = "string";
var TOKEN_INT           = "integer";
var TOKEN_DECIMAL       = "decimal";
var TOKEN_SEMICOLON     = "semicolon";
var TOKEN_DOUBLEQUOTE   = "double quote";
var TOKEN_ASSIGN        = "assignment";
var TOKEN_PLUS          = "plus";
var TOKEN_MINUS         = "minus";
var TOKEN_OPENPAREN     = "open paren";
var TOKEN_CLOSEPAREN    = "close paren";
var TOKEN_OPENBRACKET   = "open bracket";
var TOKEN_CLOSEBRACKET  = "close bracket";

//
// Global Variables
//

var _Logger = null;	// Object responsible for all output to user
var _Lexer  = null; // Object responsible for lexical analysis
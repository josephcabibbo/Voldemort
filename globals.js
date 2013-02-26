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
var TOKEN_TYPE		   = "type";
var TOKEN_ID           = "identifier";
//var TOKEN_CHAR         = "charList";
var TOKEN_STRING       = "string";
var TOKEN_INT          = "integer";
var TOKEN_PRINT        = "print";
var TOKEN_EOF          = "EOF";
var TOKEN_DOUBLEQUOTE  = "double quote";
var TOKEN_ASSIGN       = "assignment";
var TOKEN_OP		   = "operator";
var TOKEN_OPENPAREN    = "open parenthesis";
var TOKEN_CLOSEPAREN   = "close parenthesis";
var TOKEN_OPENBRACKET  = "open bracket";
var TOKEN_CLOSEBRACKET = "close bracket";

//
// Global Variables
//

var _OutputManager = null;	// Object responsible for all output to user
var _Lexer         = null;  // Object responsible for lexical analysis
var _Parser        = null;  // Object responsible for parsing
var _SymbolTable   = null;  // Associative array (hash) for symbol table
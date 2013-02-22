/*  -------------------------------------------------
 *	Filename: token.js
 *	Author: Joey Cabibbo
 *	Description: A token object constructor
 *	------------------------------------------------- */

function Token(kind, name, value, type, line, scope)
{
    this.kind  = kind;
    this.name  = name;
    this.value = value;
    this.type  = type;
    this.line  = line;
    this.scope = scope;
}
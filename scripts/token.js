/*  -------------------------------------------------
 *	Filename: token.js
 *	Author: Joey Cabibbo
 *	Description: A token object constructor
 *	------------------------------------------------- */

function Token(k, n, v, t, l)
{
	// Return a token object
	return {
		kind  : k,
		name  : n,
		value : v,
		type  : t,
		line  : l
		// scope?
	};
}
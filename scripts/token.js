/*  -------------------------------------------------
 *	Filename: token.js
 *	Author: Joey Cabibbo
 *	Description: A token object constructor
 *	------------------------------------------------- */

function Token(k, n, v, t, l)
{
	// Return a token object
	return {
		kind  : k || null,
		name  : n || null,
		value : v || null,
		type  : t || null,
		line  : l || null
	};
}
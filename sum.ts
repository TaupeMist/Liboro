/* sum.js */

export default function(
  a?: number,
  b?: number,
  c?: number,
  d?: number,
  e?: number
):number {

  // Convert arguments object to an array
  var args = Array.prototype.slice.call(arguments);
  
  // Return the sum of the arguments
  return args.reduce(function(a, b) {
    return a + b
  }, 0);
  
}
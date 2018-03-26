/**
 * Ref- https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
 * @param str A string. Example formats- big Bang, Big Bang, BigBang, big-bang, big_bang etc.
 * @returns camelCase form of str(e.g. bigBang)
 */
const toCamelCase = (str) => {
  return str.replace(/^([A-Z])|[\s-_](\w)/g, function (match, p1, p2) {
    if (p2) return p2.toUpperCase();
    return p1.toLowerCase();
  });
};

module.exports = {toCamelCase};

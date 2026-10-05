// TODO: workaround to fix "TypeError: Do not know how to serialize a BigInt" issue
// eslint-disable-next-line no-undef
BigInt.prototype.toJSON = function() {
  return Number(this);
};

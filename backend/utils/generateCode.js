const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return code;
}

module.exports = generateCode;

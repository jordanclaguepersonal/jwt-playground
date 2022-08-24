const jwt = require('jsonwebtoken');
const rl = require('readline');
const { promisify } = require('util');

rl.Interface.prototype.question[promisify.custom] = function(prompt) {
  return new Promise(resolve =>
    rl.Interface.prototype.question.call(this, prompt, resolve),
  );
};

rl.Interface.prototype.questionAsync = promisify(
  rl.Interface.prototype.question,
);

async function run() {
  const interface = rl.createInterface(process.stdin, process.stdout);

  try {
    const privateKeyBase64 = await (process.env.PRIVATE_KEY || interface.questionAsync('PRIVATE KEY (BASE64)?\n'));
    const publicKeyBase64 = await (process.env.PUBLIC_KEY || interface.questionAsync('PUBLIC KEY (BASE64)?\n'));
    const privateKey = Buffer.from(privateKeyBase64, 'base64').toString();
    const publicKey = Buffer.from(publicKeyBase64, 'base64').toString();
    const jwtPayload = JSON.parse(await interface.questionAsync('JSON PAYLOAD (Stringified)?\n'));
    const expiryMinutes = parseInt(await interface.questionAsync('EXPIRY (Minutes)?\n'), 10);
    const generatedToken = jwt.sign(jwtPayload, privateKey, { algorithm: 'RS256', expiresIn: `${expiryMinutes}m` });
    interface.write(`GENERATED TOKEN\n${generatedToken}\n`);
    // const decodedToken = jwt.decode(genToken);
    // const verifiedToken = jwt.verify(genToken, publicKey);
    interface.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();

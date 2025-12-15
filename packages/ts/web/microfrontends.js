const net = require('net');

const checkPort = (port) => new Promise((resolve) => {
  const server = net.createServer();

  server.once('error', () => {
    resolve(false); // Porta em uso
  });

  server.once('listening', () => {
    server.close();
    resolve(true); // Porta está livre
  });

  server.listen(port);
});

const getUrlSaasRoot = async () => {
  const DEFAULT_URL = 'https://app.arqgen.com.br';
  const LOCALHOST_URL = 'http://localhost:3000';

  const isPortAvailable = await checkPort(3000);
  return isPortAvailable ? DEFAULT_URL : LOCALHOST_URL;
};

exports.microfrontends = async (mfes) => {
  const SAAS_APP_DEPLOY_URL = process.env.SAAS_APP_DEPLOY_URL || await getUrlSaasRoot();

  console.log('SaaS Layouts utilizando SAAS_APP_DEPLOY_URL:', SAAS_APP_DEPLOY_URL);

  const mfesRootDefault = {
    saas_root: `saas_root@${SAAS_APP_DEPLOY_URL}/saas_root.js`,
  };

  if (!mfes) {
    console.log("Os MFEs que serão executados são:", mfesRootDefault);
    return mfesRootDefault;
  }

  const mfeSplitted = mfes.split(",");

  mfeSplitted.forEach((micro) => {
    const [name, port] = micro.split(":");

    if (!mfesRootDefault[name]) {
      console.log(
        `O MFE ${name}:${port} não está vinculado ao projeto e não foi importado! Verifique o arquivo "microfrontends.ts".`,
      );
    } else {
      mfesRootDefault[name] = `${name}@http://localhost:${port}/${name}.js`;
    }
  });

  console.log("Os MFEs que serão executados são:", mfesRootDefault);
  return mfesRootDefault;
};

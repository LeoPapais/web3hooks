const getConnectionLabel = (z, bundle) => {
  // bundle.inputData will contain what the "test" URL (or function) returns
  return `${bundle.authData.provider_key} @ ${bundle.authData.rpc_provider}`;
};

module.exports = {
  type: 'custom',
  test: {
    headers: {
      'X-RPC-PROVIDER': '{{bundle.authData.rpc_provider}}',
      'X-PROVIDER-KEY': '{{bundle.authData.provider_key}}',
    },
    params: {
      provider_key: '{{bundle.authData.provider_key}}',
      rpc_provider: '{{bundle.authData.rpc_provider}}',
    },
    url: `https://web3hooks.leopapais.com/test-auth`,
  },
  fields: [
    {
      computed: false,
      key: 'rpc_provider',
      required: true,
      label: 'RPC Provider Name',
      type: 'string',
      helpText:
        'Will add more providers soon. Please create an [Infura](https://docs.infura.io/infura/) account to use your custom RPC key.',
      default: 'infura',
      choices: ['infura'],
    },
    {
      computed: false,
      key: 'provider_key',
      required: true,
      label: 'RPC provider api key',
      type: 'password',
      helpText: 'Add here the [API key](https://app.infura.io/dashboard) provided by Infura.',
    },
  ],
  connectionLabel: getConnectionLabel,
  customConfig: {},
};

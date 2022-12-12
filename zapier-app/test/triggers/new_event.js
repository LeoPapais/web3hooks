require('should');

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('Trigger - new_event', async () => {
  zapier.tools.env.inject();

  it('should get an json with subscriptionId', async () => {
    const bundle = {
      authData: {
        rpc_provider: process.env.RPC_PROVIDER,
        provider_key: process.env.PROVIDER_KEY,
      },

      inputData: {
        address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
      },
      targetUrl: 'http://localhost:4000/black-hole'
    };

    const results = await appTester(
      App.triggers['new_event'].operation.performSubscribe,
      bundle
    );
    results.should.have.property('zapId');
  })

  it('should get an array', async () => {
    const bundle = {
      authData: {
        rpc_provider: process.env.RPC_PROVIDER,
        provider_key: process.env.PROVIDER_KEY,
      },

      inputData: {
        address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
      },
      targetUrl: 'http://localhost:4000/black-hole'
    };

    const results = await appTester(
      App.triggers['new_event'].operation.performList,
      bundle
    );
    results.should.be.an.Array();
  })

  it('should unsubscribe successfully', async () => {
    const bundleSub = {
      authData: {
        rpc_provider: process.env.RPC_PROVIDER,
        provider_key: process.env.PROVIDER_KEY,
      },

      inputData: {
        address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
        hookUrl: 'http://localhost:4000/black-hole'
      },
      targetUrl: 'http://localhost:4000/black-hole'
    }

    const resultsSub = await appTester(
      App.triggers['new_event'].operation.performSubscribe,
      bundleSub
    )
    resultsSub.should.have.property('zapId');

    const bundle = {
      authData: {
        rpc_provider: process.env.RPC_PROVIDER,
        provider_key: process.env.PROVIDER_KEY,
      },

      subscribeData: resultsSub
    };

    const results = await appTester(
      App.triggers['new_event'].operation.performUnsubscribe,
      bundle
    );
    results.should.have.property('message');
  })
})

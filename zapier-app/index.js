const authentication = require('./authentication');
const newEventTrigger = require('./triggers/new_event.js');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  authentication: authentication,
  triggers: {
    [newEventTrigger.key]: newEventTrigger,
  },
};

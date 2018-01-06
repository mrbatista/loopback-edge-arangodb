import {deprecate} from 'util';

import edge from './edge';

export default deprecate((app) => {
  app.modelBuilder.mixins.define('Edge', edge);
}, 'app.modelBuilder.mixins.define: Use mixinSources instead; ' +
    'see https://github.com/mrbatista/loopback-edge-arangodb');


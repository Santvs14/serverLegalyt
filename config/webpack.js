const path = require('path');

module.exports = {
    // ... otras configuraciones
    resolve: {
        alias: {
            '@backend': path.resolve(__dirname, 'src/backend/'),

        },
        fallback: {
            buffer: require.resolve('buffer/'),
            net: require.resolve('net/'),
            tls: require.resolve('tls/'),
            url: require.resolve('url/'),
            assert: require.resolve('assert/'),
        },
    },
};

const {
  HtmlRspackPlugin,
  ProvidePlugin,
  DefinePlugin,
  container: { ModuleFederationPlugin },
} = require('@rspack/core');
const path = require('path');
const ReactRefreshPlugin = require('@rspack/plugin-react-refresh');
const { microfrontends } = require('./microfrontends');

const isDev = process.env.NODE_ENV === 'development';

module.exports = async ({ micros }) => ({
  entry: './src/index',
  mode: isDev ? 'development' : 'production',
  target: 'web',
  devtool: isDev ? 'source-map' : false,
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 3004,
    historyApiFallback: true,
    hot: true,
    devMiddleware: { writeToDisk: true },
  },
  output: {
    publicPath: 'auto',
    filename: '[name].[contenthash].bundle.js',
  },
  module: {
    rules: [
      {
        test: /.(png|jpge?|gif)$/,
        exclude: [/[\\/]node_modules[\\/]/],
        type: 'asset',
      },
      {
        test: /\.(jsx?|tsx?)$/,
        loader: 'builtin:swc-loader',
        exclude: [/[\\/]node_modules[\\/]/],
      },
    ],
  },
  plugins: [
    isDev && new ReactRefreshPlugin(),
    new ProvidePlugin({
      process: [require.resolve('process/browser')],
    }),
    new ModuleFederationPlugin({
      name: 'saas_arqgen_layouts',
      filename: '[name].js',
      exposes: {
        './Triggers': './src/triggers',
        './Factory': './src/factory',
        './LayoutSolutions': './src/containers/LayoutSolutions',
      },
      remotes: {
        ...(await microfrontends(micros)),
      },
      shared: {
        react: {
          requiredVersion: '18.2.0',
          singleton: true,
        },
        'react-dom': {
          requiredVersion: '18.2.0',
          singleton: true,
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '6.22.0',
        },
        '@chakra-ui/react': {
          singleton: true,
          requiredVersion: '^2.8.2',
        },
        'framer-motion': {
          singleton: true,
          requiredVersion: '^11.0.3',
        },
        '@emotion/react': {
          singleton: true,
          requiredVersion: '^11.11.3',
        },
        '@tanstack/react-query': {
          singleton: true,
          requiredVersion: '^5.18.1',
        },
        '@emotion/styled': {
          singleton: true,
          requiredVersion: '^11.11.0',
        },
      },
    }),
    new HtmlRspackPlugin({
      template: './public/index.html',
    }),
  ].filter(Boolean),
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
});

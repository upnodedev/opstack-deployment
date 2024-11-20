export const rollupConfig = {
  SKIP_DEPLOYMENT_CHECK: false,

  SEQUENCER_MODE: true,

  CELESTIA_MODE: false,

  OPTIMISM_REPO_URL: 'https://github.com/ethereum-optimism/optimism.git',
  OPTIMISM_BRANCH_OR_COMMIT: 'v1.9.0',

  OP_GETH_REPO_URL: 'https://github.com/ethereum-optimism/op-geth.git',
  OP_GETH_BRANCH_OR_COMMIT: 'v1.101315.3',

  ADMIN_PRIVATE_KEY: '0x',
  BATCHER_PRIVATE_KEY: '0x',
  PROPOSER_PRIVATE_KEY: '0x',
  SEQUENCER_PRIVATE_KEY: '0x',
  DEPLOYER_PRIVATE_KEY: '$ADMIN_PRIVATE_KEY',

  L1_RPC_KIND: 'quicknode',
  L1_RPC_URL: '',
  L1_BLOCK_TIME: 12,

  L2_CHAIN_ID: 43333,
  L2_BLOCK_TIME: 2,

  SKIP_HEALTHCHECK: false,

  TARGET_FOLDER_NAME: '.celestia-light-mocha-4',
  P2P_NETWORK: 'mocha',

  CELESTIA_RPC: 'rpc-mocha.pops.one',
  CELESTIA_RPC_PORT: 26657,
  CELESTIA_GRPC_PORT: 909,
  CELESTIA_NAMESPACE: '',
  CELESTIA_KEYRING_MNEMONIC: '',
  CELESTIA_ACCNAME: 'acc',
  CELESTIA_NODE_TYPE: 'light',

  P2P_AGENT: '',
  P2P_ADVERTISE_IP: '',

  MINER_ETHERBASE_ADDRESS: '',
  UNLOCK_ADDRESS: '',

  PASSWORD: 'pwd', //If GETH_PASSWORD important

  L2OO_ADDRESS: '',

  TENDERLY_PROJECT: '',
  TENDERLY_USERNAME: '',

  ETHERSCAN_API_KEY: '',

  CONFIG_PATH: '/app/data/configurations',
  DATADIR_DIR: '/app/data/datadir',
  DEPLOYMENT_DIR: '/app/data/deployments',
  OPTIMISM_DIR: '/app/data/optimism',
  OP_GETH_DIR: '/app/data/op-geth',
  BIN_DIR: '/app/data/bin',
  CELESTIA_KEYRING_PATH:
    '/home/celestia/$TARGET_FOLDER_NAME/keys/keyring-test/$CELESTIA_ACCNAME.info',
  CELESTIA_NODE_STORE: '/home/celestia/$TARGET_FOLDER_NAME',
  CELESTIA_NODE_STORE_CONFIG_PATH: '$CELESTIA_NODE_STORE/config.toml',

  GETH_DATADIR: '$DATADIR_DIR',
  GETH_HTTP: true,
  GETH_HTTP_CORSDOMAIN: '*',
  GETH_HTTP_VHOSTS: '*',
  GETH_HTTP_ADDR: '0.0.0.0',
  GETH_HTTP_API: 'web3,debug,eth,txpool,net,engine',
  GETH_WS: true,
  GETH_WS_ADDR: '0.0.0.0',
  GETH_WS_PORT: 8545,
  GETH_WS_ORIGINS: '*',
  GETH_WS_API: 'debug,eth,txpool,net,engine',
  GETH_PORT: 30333,
  GETH_DISCOVERY_PORT: 30333,
  GETH_SYNCMODE: 'full',
  GETH_GCMODE: 'archive',
  GETH_NODISCOVER: false,
  GETH_MAXPEERS: 200,
  GETH_NETWORKID: 43333,
  GETH_AUTHRPC_VHOSTS: '*',
  GETH_AUTHRPC_ADDR: '0.0.0.0',
  GETH_AUTHRPC_PORT: 8551,
  GETH_AUTHRPC_JWTSECRET: '$CONFIG_PATH/jwt.txt',
  GETH_ROLLUP_DISABLETXPOOLGOSSIP: true,
  GETH_RPC_ALLOW_UNPROTECTED_TXS: true,
  GETH_PASSWORD: '$DATADIR_DIR/password',
  GETH_METRICS: true,
  GETH_METRICS_ADDR: '0.0.0.0',
  GETH_METRICS_PORT: 7303,

  OP_BATCHER_L2_ETH_RPC: 'http://op-geth:8545',
  OP_BATCHER_ROLLUP_RPC: 'http://op-node:8547',
  OP_BATCHER_POLL_INTERVAL: '0.5s',
  OP_BATCHER_SUB_SAFETY_MARGIN: 6,
  OP_BATCHER_NUM_CONFIRMATIONS: 1,
  OP_BATCHER_SAFE_ABORT_NONCE_TOO_LOW_COUNT: 3,
  OP_BATCHER_RESUBMISSION_TIMEOUT: '30s',
  OP_BATCHER_RPC_ADDR: '0.0.0.0',
  OP_BATCHER_RPC_PORT: 8548,
  OP_BATCHER_MAX_CHANNEL_DURATION: 300,
  OP_BATCHER_L1_ETH_RPC:
    'https://quick-serene-pine.ethereum-holesky.quiknode.pro/a5c5ac0df0f0656d58699a732b567738f0ef6542',
  OP_BATCHER_PRIVATE_KEY: '$BATCHER_PRIVATE_KEY',
  OP_BATCHER_DA_RPC: 'celestia-da:26650',
  OP_BATCHER_BATCH_TYPE: 1,
  OP_BATCHER_DATA_AVAILABILITY_TYPE: 'calldata',
  OP_BATCHER_METRICS_ENABLED: true,
  OP_BATCHER_METRICS_ADDR: '0.0.0.0',
  OP_BATCHER_METRICS_PORT: 7301,
  OP_NODE_L2_ENGINE_RPC: 'ws://op-geth:8551',
  OP_NODE_L2_ENGINE_AUTH: '$CONFIG_PATH/jwt.txt',
  OP_NODE_L1_EPOCH_POLL_INTERVAL: '2s',
  OP_NODE_L1_HTTP_POLL_INTERVAL: '2s',
  OP_NODE_SEQUENCER_ENABLED: '$SEQUENCER_MODE',
  OP_NODE_SEQUENCER_L1_CONFS: 3,
  OP_NODE_VERIFIER_L1_CONFS: 3,
  OP_NODE_ROLLUP_CONFIG: '$CONFIG_PATH/rollup.json',
  OP_NODE_RPC_ADDR: '0.0.0.0',
  OP_NODE_RPC_PORT: 8547,
  OP_NODE_RPC_ENABLE_ADMIN: false,
  OP_NODE_P2P_SEQUENCER_KEY: '$SEQUENCER_PRIVATE_KEY',
  OP_NODE_L1_ETH_RPC: '$L1_RPC_URL',
  OP_NODE_L1_RPC_KIND: '$L1_RPC_KIND',
  OP_NODE_L1_TRUST_RPC: true,
  OP_NODE_L1_BEACON_IGNORE: true,
  OP_NODE_P2P_AGENT: '$P2P_AGENT',
  OP_NODE_P2P_LISTEN_IP: '0.0.0.0',
  OP_NODE_P2P_LISTEN_TCP_PORT: 9221,
  OP_NODE_P2P_LISTEN_UDP_PORT: 9221,
  OP_NODE_P2P_ADVERTISE_IP: '$P2P_ADVERTISE_IP',
  OP_NODE_DA_RPC: 'celestia-da:26650',
  OP_NODE_METRICS_ENABLED: true,
  OP_NODE_METRICS_ADDR: '0.0.0.0',
  OP_NODE_METRICS_PORT: 7300,
  OP_PROPOSER_ALLOW_NON_FINALIZED: true,
  OP_PROPOSER_POLL_INTERVAL: '12s',
  OP_PROPOSER_RPC_PORT: 8560,
  OP_PROPOSER_ROLLUP_RPC: 'http://op-node:8547',
  OP_PROPOSER_L2OO_ADDRESS: '$L2OO_ADDRESS',
  OP_PROPOSER_PRIVATE_KEY: '$PROPOSER_PRIVATE_KEY',
  OP_PROPOSER_L1_ETH_RPC: '$L1_RPC_URL',
  OP_PROPOSER_METRICS_ENABLED: true,
  OP_PROPOSER_METRICS_ADDR: '0.0.0.0',
  OP_PROPOSER_METRICS_PORT: 7302,

  AWS_SECRET_ARN: '$AWS_SECRET_ARN',
  AWS_ACCESS_KEY_ID: '$AWS_ACCESS_KEY_ID',
  AWS_SECRET_ACCESS_KEY: '$AWS_SECRET_ACCESS_KEY',
  AWS_DEFAULT_REGION: '$AWS_DEFAULT_REGION',

  DOMAIN_NAME: 'localhost',

  DA_GRPC_NAMESPACE: '$CELESTIA_NAMESPACE',
  DA_CORE_IP: '${CELESTIA_RPC:-rpc-mocha.pops.one}',
  DA_CORE_RPC_PORT: '${CELESTIA_RPC_PORT:-26657}',
  DA_CORE_GRPC_PORT: '${CELESTIA_GRPC_PORT:-9090}',
  DA_P2P_NETWORK: '$P2P_NETWORK',
  DA_KEYRING_MNEMONIC: '$CELESTIA_KEYRING_MNEMONIC',
  DA_FOLDER_NAME: '$TARGET_FOLDER_NAME',
  ACCNAME: '$CELESTIA_ACCNAME',
};

export const blockscoutConfig = {
  NEXT_PUBLIC_API_HOST: 'localhost',
  NEXT_PUBLIC_API_PROTOCOL: 'http',
  NEXT_PUBLIC_STATS_API_HOST: 'http://localhost:8080',
  NEXT_PUBLIC_NETWORK_NAME: 'Awesome chain',
  NEXT_PUBLIC_NETWORK_SHORT_NAME: 'Awesome chain',
  NEXT_PUBLIC_NETWORK_ID: 5,
  NEXT_PUBLIC_NETWORK_CURRENCY_NAME: 'Ether',
  NEXT_PUBLIC_NETWORK_CURRENCY_SYMBOL: 'ETH',
  NEXT_PUBLIC_NETWORK_CURRENCY_DECIMALS: 18,
  NEXT_PUBLIC_API_BASE_PATH: '/',
  NEXT_PUBLIC_APP_HOST: 'localhost',
  NEXT_PUBLIC_APP_PROTOCOL: 'http',
  NEXT_PUBLIC_HOMEPAGE_CHARTS: ['daily_txs'],
  NEXT_PUBLIC_VISUALIZE_API_HOST: 'http://localhost:8081',
  NEXT_PUBLIC_IS_TESTNET: true,
  NEXT_PUBLIC_API_WEBSOCKET_PROTOCOL: 'ws',
  NEXT_PUBLIC_API_SPEC_URL:
    'https://raw.githubusercontent.com/blockscout/blockscout-api-v2-swagger/main/swagger.yaml',
};

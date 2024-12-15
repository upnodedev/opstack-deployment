# Opstack deployment

This project is backend that allows users to deploy and manage OpStack rollup configurations. It also allows users to stream logs from Docker containers using WebSocket.

## Features

- **Authentication**: Secure login and profile endpoints.
- **Deploy OpStack Rollup**: Deploy and manage OpStack rollup configurations.
- **Streaming Logs**: Stream logs from Docker containers using WebSocket.
- **Start OpStack Rollup**: Start OpStack rollup configurations.
- **Stop OpStack Rollup**: Stop OpStack rollup configurations.

## Getting Started

This project requires Docker and Docker Compose to run.

### Prerequisites

- Docker
- Docker Compose

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/upnodedev/opstack-deployment.git
   cd opstack-deployment
   ```

2. Create a `.env` file in the root directory and add the following environment variables:

   ```sh
   # user name and password to access the API
   USER_NAME=admin
   USER_PASSWORD=pass1234
   JWT_SECRET=secretxcvxvd

   # database
   POSTGRES_USER=admin
   POSTGRES_PASSWORD=pass1234
   POSTGRES_DB=mydatabase

   # domain name
   DOMAIN_NAME=localhost # or your domain name => opstack.com
   PROTOCOL=http # or https
   ```

3. Run the following command to start the project:

   ```sh
   docker-compose up -d --build
   ```

4. Add the following line to your `/etc/hosts` file (Linux, macOS) or `C:\Windows\System32\drivers\etc\hosts` file (Windows):
   ```sh
   127.0.01 localhost
   ```
   This is required to access the project using the domain name.

Server will be running on `http://localhost`.

WebSocket will be running on `ws://localhost`.

## Usage Production

If you have set the domain name to real domain name, you can access the project using the domain name. For example, if the domain name is `example.com`, you need to configure the domain name in your DNS provider to point to the server IP address.

Example<br />
<a href="https://ibb.co/84QgW7v"><img src="https://i.ibb.co/tP1p7Jj/cloudflare.png" alt="cloudflare" border="0"></a>

**DNS Setup**
Ensure that all the CNAME records listed above are properly configured in your DNS provider. Replace `${DOMAIN_NAME}` with your actual domain name.

**DNS Entry**

For example, if your domain name is `example.com`, the CNAME `dashboard.${DOMAIN_NAME}` should resolve to `dashboard.example.com`.

| CNAME                             | Service description                                                                                             | Type     | Upnode Testnet                                        |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------- |
| **chain**                         | Core blockchain service (op-geth), responsible for handling the Layer 2 node operations.                        | Node RPC | https://chain.upnode-test.com                         |
| **blockscout-backend**            | Backend service for Blockscout, handling API calls and blockchain data processing.                              | Backend  | https://blockscout-backend.upnode-test.com            |
| **blockscout-stats**              | Service for providing statistical data and insights related to the blockchain via Blockscout.                   | Backend  | https://blockscout-stats.upnode-test.com              |
| **blockscout-visualizer**         | Advanced visualization tool for detailed blockchain analytics and charts.                                       | Backend  | https://blockscout-visualizer.upnode-test.com         |
| **dashboard**                     | Traefik dashboard use username and password that you set when run the cli                                       | Backend  | https://dashboard.upnode-test.com                     |
| **deploy-api**                    | deployment backend Rest API                                                                                     | Backend  | https://deploy-api.upnode-test.com                    |
| **opstack-bridge-indexer-server** | Backend service for indexing transactions and data for the Optimism stack bridge.                               | Backend  | https://opstack-bridge-indexer-server.upnode-test.com |
| **deploy**                        | Frontend of deployment handle you rollup                                                                        | Frontend | https://deploy.upnode-test.com                        |
| **bridge**                        | Frontend service for the cross-chain or cross-layer bridge, enabling seamless asset transfers.                  | Frontend | https://bridge.upnode-test.com                        |
| **blockscout**                    | Frontend interface for Blockscout, allowing users to explore blockchain transactions and data.                  | Frontend | https://blockscout.upnode-test.com                    |
| **grafana**                       | Grafana monitoring dashboard for visualizing system metrics and performance insights. use username and password | Frontend | https://grafana.upnode-test.com                       |
| **prometheus**                    | Prometheus monitoring service for collecting and storing time-series metrics.                                   | Frontend | https://prometheus.upnode-test.com                    |

Reference from [opstack-cli](https://github.com/upnodedev/opstack-cli.git)

## API Documentation

### Authentication

#### Register

```http
GET /api/heathz
```

```json
{
  "status": "Deployment is running",
  "status_code": 200
}
```

#### Login

```http
POST /api/auth/login
```

| Parameter  | Type     | Description            |
| :--------- | :------- | :--------------------- |
| `username` | `string` | **Required**. Username |
| `password` | `string` | **Required**. Password |

#### Get Profile

get the profile of the user.

```http
POST /api/auth/profile
```

require header token from login (no Bearer)

```json
{
  "authorization": "$token"
}
```

```json
{
  "user": "admin"
}
```

### Deployment

#### Deployment Rollup

deploy rollup configuration for all services including chain, blockscout, bridge, grafana, prometheus.

```http
POST /api/deploy/rollup
```

require header token from login (no Bearer)

```json
{
  "authorization": "$token"
}
```

| Parameter                          | Type     | Description                                        |
| :--------------------------------- | :------- | :------------------------------------------------- |
| `BATCHER_PRIVATE_KEY`              | `string` | **Required**. Batcher private key                  |
| `PROPOSER_PRIVATE_KEY`             | `string` | **Required**. Proposer private key                 |
| `SEQUENCER_PRIVATE_KEY`            | `string` | **Required**. Sequencer private key                |
| `DEPLOYER_PRIVATE_KEY`             | `string` | **Required**. Deployer private key                 |
| `ADMIN_PRIVATE_KEY`                | `string` | **Required**. Admin private key                    |
| `L1_RPC_URL`                       | `string` | **Required**. L1 RPC URL                           |
| `L1_CHAIN_NAME`                    | `string` | **Required**. L1 chain name                        |
| `L1_CHAIN_ID`                      | `number` | **Required**. L1 chain ID                          |
| `L1_LOGO_URL`                      | `string` | **Required**. L1 logo URL                          |
| `L1_NATIVE_CURRENCY_NAME`          | `string` | **Required**. L1 native currency name              |
| `L1_NATIVE_CURRENCY_SYMBOL`        | `string` | **Required**. L1 native currency symbol            |
| `L1_BLOCK_EXPLORER_URL`            | `string` | **Required**. L1 block explorer URL                |
| `L1_BLOCK_EXPLORER_API`            | `string` | **Not Required**. L1 block explorer API            |
| `L1_RPC_KIND`                      | `string` | **Required**. L1 RPC kind                          |
| `L2_CHAIN_NAME`                    | `string` | **Required**. L2 chain name                        |
| `L2_CHAIN_ID`                      | `number` | **Required**. L2 chain ID                          |
| `L2_LOGO_URL`                      | `string` | **Required**. L2 logo URL                          |
| `L2_NATIVE_CURRENCY_NAME`          | `string` | **Required**. L2 native currency name              |
| `L2_NATIVE_CURRENCY_SYMBOL`        | `string` | **Required**. L2 native currency symbol            |
| `CELESTIA_RPC`                     | `string` | **Required**. Celestia RPC                         |
| `governanceTokenSymbol`            | `string` | **Required**. Governance token symbol              |
| `governanceTokenName`              | `string` | **Required**. Governance token name                |
| `l2BlockTime`                      | `number` | **Required**. L2 block time                        |
| `l2OutputOracleSubmissionInterval` | `number` | **Required**. L2 output oracle submission interval |
| `finalizationPeriodSeconds`        | `number` | **Required**. Finalization period in seconds       |
| `APP_LOGO`                         | `string` | **Required**. App logo URL                         |
| `COLOR_PRIMARY`                    | `string` | **Required**. Primary color                        |
| `COLOR_SECONDARY`                  | `string` | **Required**. Secondary color                      |
| `WALLETCONNECT_PROJECT_ID`         | `string` | **Required**. WalletConnect project ID             |
| `L1_MULTI_CALL3_ADDRESS`           | `string` | **Required**. L1 MultiCall3 address                |
| `L1_MULTI_CALL3_BLOCK_CREATED`     | `number` | **Required**. L1 MultiCall3 block created          |
| `GF_SECURITY_ADMIN_USER`           | `string` | **Required**. Grafana admin user                   |
| `GF_SECURITY_ADMIN_PASSWORD`       | `string` | **Required**. Grafana admin password               |

#### Start Rollup

Start the rollup deployment for all services.

require header token from login (no Bearer)

```json
{
  "authorization": "$token"
}
```

```http
POST /api/deploy/start
```

#### Stop Rollup

Stop the rollup deployment for all services.

require header token from login (no Bearer)

```json
{
  "authorization": "$token"
}
```

```http
POST /api/deploy/start
```

#### Status Rollup

Get the status of the rollup deployment for all services.

require header token from login (no Bearer)

```json
{
  "authorization": "$token"
}
```

```http
POST /api/deploy/status
```

```json
{
    "status": "UP", # BUILDING, UP, DOWN, FAILED, UNKNOWN (status of the deployment)
    "deploy": true  # status of the deployment initiated
}
```

#### List Containers of Rollup

List all containers of the rollup deployment.

require header token from login (no Bearer)

```json
{
  "authorization": "$token"
}
```

```http
POST /api/deploy/containers
```

```json
  {
        "id": "2b1aa9282f79",
        "image": "opstack-compose-proxy",
        "name": "blockscout-proxy",
        "statusText": "Up 2 days",
        "status": "RUNNING",
        "profile": "Blockscout"
    },
    {
        "id": "6753bced0582",
        "image": "ghcr.io/blockscout/frontend:v1.36.1",
        "name": "blockscout-frontend",
        "statusText": "Up 2 days",
        "status": "RUNNING",
        "profile": "Blockscout"
    },
    ...
```

#### Stream Logs

Stream logs from Docker containers using WebSocket.

```
ws://${DOMAIN_NAME}?token=${token from login}
```

send message to the websocket server to start the stream logs with the name of the container.


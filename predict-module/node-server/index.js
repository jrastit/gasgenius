require('dotenv').config();
const axios = require('axios');
const express = require('express');
const { Pool } = require('pg');

// Configuration
const INFURA_URL = process.env.INFURA_URL; // e.g. Infura project endpoint

const {
  ETHERSCAN_API_KEY,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_PORT,
} = process.env;

const pool = new Pool({
  user: POSTGRES_USER,
  host: POSTGRES_HOST || 'db',
  database: POSTGRES_DB,
  password: POSTGRES_PASSWORD,
  port: POSTGRES_PORT || 5432,
});

async function setup() {
  const client = await pool.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS gas_history (
      block_number BIGINT PRIMARY KEY,
      low_gas_price NUMERIC NOT NULL,
      medium_gas_price NUMERIC NOT NULL,
      high_gas_price NUMERIC NOT NULL,
      timestamp BIGINT NOT NULL
    )
  `);
  client.release();
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getBlockData(blockNumber) {
  const hexBlock = '0x' + blockNumber.toString(16);
  const url = `https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=${hexBlock}&boolean=true&apikey=${ETHERSCAN_API_KEY}`;

  try {
    const response = await axios.get(url);
    const block = response.data.result;

    if (!block || !block.transactions || block.transactions.length === 0) {
      return null;
    }

    // const gasPrices = block.transactions.map(tx => parseInt(tx.gasPrice));
    // const avgGasWei = gasPrices.reduce((a, b) => a + b, 0) / gasPrices.length;
    const gasPrices = block.transactions.map(tx => tx.gasPrice ? BigInt(tx.gasPrice) : BigInt(0));
    gasPrices.sort((a, b) => (a < b ? -1 : 1));
    const idx = p => Math.floor((gasPrices.length - 1) * p);

    return {
      blockNumber,
      lowGas:  Number(gasPrices[idx(0.25)]) / 1e9,
      mediumGas:  Number(gasPrices[idx(0.5)]) / 1e9,
      highGas: Number(gasPrices[idx(0.75)]) / 1e9,
      // avgGwei: avgGasWei / 1e9,

      timestamp: parseInt(block.timestamp, 16),
    };  

  } catch (err) {
    console.error(`Error fetching block ${blockNumber}:`, err.message);
    return null;
  }
}

async function saveBlockGasData(data) {
  if (!data) return;

  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO gas_history (block_number, low_gas_price, medium_gas_price, high_gas_price, timestamp)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (block_number) DO NOTHING`,
      [data.blockNumber, data.lowGas, data.mediumGas, data.highGas, data.timestamp]
    );
    console.log(`Saved block ${data.blockNumber} | Gas: ${data.highGas.toFixed(2)} gwei`);
  } catch (err) {
    console.error('DB Insert error:', err.message);
  } finally {
    client.release();
  }
}

async function fetchAndSaveRecentBlocks(count = 5000) {
  // Get latest block number from Etherscan
  try {
    const { data } = await axios.get(`https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${ETHERSCAN_API_KEY}`);
    const latestBlockHex = data.result;
    const latestBlock = parseInt(latestBlockHex, 16);

    console.log(`Latest block: ${latestBlock}`);
    console.log(`Fetching last ${count} blocks...`);

    for (let i = 0; i < count; i++) {
      const block = latestBlock - i;
      const data = await getBlockData(block);
      await saveBlockGasData(data);

      // Respect Etherscan free rate limit (5 req/sec)
      await delay(250);
    }
  } catch (err) {
    console.error('Error fetching latest block:', err.message);
  }
}

async function getMaxStoredBlock() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT MAX(block_number) as max_block FROM gas_history');
    return res.rows[0].max_block ? parseInt(res.rows[0].max_block) : null;
  } finally {
    client.release();
  }
}

async function fetchAndSaveNewBlocks() {
  try {
    const { data } = await axios.get(`https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${ETHERSCAN_API_KEY}`);
    const latestBlockHex = data.result;
    const latestBlock = parseInt(latestBlockHex, 16);

    const maxStoredBlock = await getMaxStoredBlock();

    // Détermine à partir de quel bloc commencer la récupération
    const startBlock = maxStoredBlock !== null ? maxStoredBlock + 1 : latestBlock - 5000;

    console.log(`Latest block: ${latestBlock}`);
    console.log(`Starting from block: ${startBlock}`);

    for (let block = startBlock; block <= latestBlock; block++) {
      const data = await getBlockData(block);
      await saveBlockGasData(data);

      // Respect rate limit etherscan
      await delay(250);
    }
  } catch (err) {
    console.error('Error fetching blocks:', err.message);
  }
}


// Express setup
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/gas-history', async (req, res) => {
  try {
    const client = await pool.connect();

    // Optional: add query params to filter, paginate, etc.
    const { limit = 20 } = req.query;

    const result = await client.query(
      `SELECT * FROM gas_history ORDER BY block_number DESC LIMIT $1`,
      [parseInt(limit)]
    );

    client.release();

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching gas history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function start() {
  await setup();
  // await fetchAndSaveRecentBlocks();
  await fetchAndSaveNewBlocks();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start();

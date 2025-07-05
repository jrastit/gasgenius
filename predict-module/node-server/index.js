require('dotenv').config();
const axios = require('axios');
const express = require('express');
const { Pool } = require('pg');

// Configuration
const app = express();
const PORT = process.env.PORT || 3000;
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

    // ➤ Nettoie les transactions pour ne garder que celles avec un gasPrice valide
    const gasPrices = block.transactions
      .map(tx => tx.gasPrice ? BigInt(tx.gasPrice) : null)
      .filter(Boolean);

    if (gasPrices.length === 0) {
      console.warn(`Block ${blockNumber} has no valid gasPrice data.`);
      return null;
    }

    gasPrices.sort((a, b) => (a < b ? -1 : 1));
    const idx = p => Math.floor((gasPrices.length - 1) * p);

    return {
      blockNumber,
      lowGas: Number(gasPrices[idx(0.25)]) / 1e9,
      mediumGas: Number(gasPrices[idx(0.5)]) / 1e9,
      highGas: Number(gasPrices[idx(0.75)]) / 1e9,
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
    // Récupère le dernier bloc actuel sur Ethereum
    const { data } = await axios.get(`https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${ETHERSCAN_API_KEY}`);
    const latestBlockHex = data.result;
    const latestBlock = parseInt(latestBlockHex, 16);

    // Récupère le dernier bloc déjà sauvegardé dans la DB
    const maxStoredBlock = await getMaxStoredBlock();

    if (latestBlock <= maxStoredBlock) {
      console.log(`Aucun nouveau bloc à ajouter. Dernier bloc stocké : ${maxStoredBlock}, bloc actuel : ${latestBlock}`);
      return;
    }

    // if no block save then store the last 5000
    const safeStartBlock = Math.max(0, latestBlock - 5000);
    const startBlock = maxStoredBlock !== null ? maxStoredBlock + 1 : safeStartBlock;

    console.log(`📥 Récupération des blocs depuis ${startBlock} jusqu'à ${latestBlock}`);

    for (let block = startBlock; block <= latestBlock; block++) {
      const data = await getBlockData(block);
      await saveBlockGasData(data);
      await delay(250);
    }

    console.log(`✅ Blocs ${startBlock} à ${latestBlock} sauvegardés.`);

  } catch (err) {
    console.error('❌ Erreur dans fetchAndSaveNewBlocks:', err.message);
  }
}

app.get('/gas-history', async (req, res) => {
  try {
    const client = await pool.connect();

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

app.post('/sync-blocks', async (req, res) => {
  try {
    await fetchAndSaveNewBlocks();
    res.json({ status: 'OK' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function runBackgroundUpdater() {
  console.log("🔄 Lancement de la mise à jour continue des blocs...");

  while (true) {
    try {
      await fetchAndSaveNewBlocks();
    } catch (err) {
      console.error("❌ Erreur dans la mise à jour des blocs :", err.message);
    }

    // Attente avant la prochaine mise à jour : ici toutes les 30 secondes
    await delay(30000);
  }
}

async function start() {
  await setup();
  await fetchAndSaveNewBlocks();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
  runBackgroundUpdater();
}

start();

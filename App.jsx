import React, { useState, useEffect } from 'react';

const fetchAssets = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/assets`);
  if (!response.ok) throw new Error('Failed to fetch assets');
  return response.json();
};

const fetchTransactions = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/transactions`);
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
};

const postAsset = async (asset) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(asset),
  });
  if (!response.ok) throw new Error('Failed to add asset');
  return response.json();
};

const postTransaction = async (transaction) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  });
  if (!response.ok) throw new Error('Failed to transfer asset');
  return response.json();
};

const App = () => {
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [newAsset, setNewAsset] = useState('');
  const [transfer, setTransfer] = useState({ from: '', to: '', assetId: '' });

  useEffect(() => {
    const init = async () => {
      try {
        const fetchedAssets = await fetchAssets();
        const fetchedTransactions = await fetchTransactions();
        setAssets(fetchedAssets);
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    init();
  }, []);

  const addAsset = async () => {
    const asset = {
      id: assets.length + 1,
      name: newAsset,
    };
    try {
      const newAssetFromServer = await postAsset(asset);
      setAssets([...assets, newAssetFromServer]);
      setNewAsset('');
    } catch (error) {
      console.error("Error adding asset:", error);
    }
  };

  const transferAsset = async () => {
    const transaction = {
      id: transactions.length + 1,
      from: transfer.from,
      to: transfer.to,
      assetId: transfer.assetId,
      date: new Date().toISOString(),
    };
    try {
      const newTransactionFromServer = await postTransaction(transaction);
      setTransactions([...transactions, newTransactionFromServer]);
      setTransfer({ from: '', to: '', assetId: '' });
    } catch (error) {
      console.error("Error transferring asset:", error);
    }
  };

  return (
    <div>
      <h1>Asset Manager</h1>
      <div>
        <input type="text" value={newAsset} onChange={(e) => setNewAsset(e.target.value)} />
        <button onClick={addAsset}>Add Asset</button>
      </div>

      <div>
        <input type="text" placeholder="From" value={transfer.from} onChange={(e) => setTransfer({ ...transfer, from: e.target.value })} />
        <input type="text" placeholder="To" value={transfer.to} onChange={(e) => setTransfer({ ...transfer, to: e.target.value })} />
        <input type="number" placeholder="Asset ID" value={transfer.assetId} onChange={(e) => setTransfer({ ...transfer, assetId: e.target.value })} />
        <button onClick={transferAsset}>Transfer Asset</button>
      </div>

      <h2>Assets</h2>
      <ul>
        {assets.map((asset) => (
          <li key={asset.id}>{asset.name}</li>
        ))}
      </ul>

      <h2>Transactions</h2>
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.id}>{`Asset ID: ${transaction.assetId}, from: ${transaction.from}, to: ${transaction.to}, date: ${transaction.date}`}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
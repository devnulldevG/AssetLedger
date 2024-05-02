import React, { useState, useEffect } from 'react';

const fakeDB = {
  assets: [],
  transactions: [],
};

const API_URL = process.env.REACT_APP_API_URL;

const App = () => {
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [newAsset, setNewAsset] = useState('');
  const [transfer, setTransfer] = useState({ from: '', to: '', assetId: '' });

  useEffect(() => {
    setAssets(fakeDB.assets);
    setTransactions(fakeDB.transactions);
  }, []);

  const addAsset = () => {
    const asset = {
      id: assets.length + 1,
      name: newAsset,
    };
    setAssets([...assets, asset]);
    fakeDB.assets.push(asset);
    setNewAsset('');
  };

  const transferAsset = () => {
    const transaction = {
      id: transactions.length + 1,
      from: transfer.from,
      to: transfer.to,
      assetId: transfer.assetId,
      date: new Date().toISOString(),
    };
    setTransactions([...transactions, transaction]);
    fakeDB.transactions.push(transaction);
    setTransfer({ from: '', to: '', assetId: '' });
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
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

const editAsset = async (assetId, updatedAsset) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/assets/${assetId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedAsset),
  });
  if (!response.ok) throw new Error('Failed to edit asset');
  return response.json();
};

const deleteAsset = async (assetId) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/assets/${assetId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete asset');
  return true; // Assuming deletion does not return a body
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

const deleteTransaction = async (transactionId) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/transactions/${transactionId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete transaction');
  return true; // Assuming deletion does not return a body
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
    if (!newAsset) return; // Prevent adding empty assets
    const asset = {
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

  const handleEditAsset = async (assetId) => {
    const newName = prompt("Enter the new asset name:");
    if (!newName) return;
    try {
      const updatedAsset = await editAsset(assetId, { name: newName });
      setAssets(assets.map(asset => asset.id === assetId ? updatedAsset : asset));
    } catch (error) {
      console.error(`Error editing asset ${assetId}:`, error);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      await deleteAsset(assetId);
      setAssets(assets.filter(asset => asset.id !== assetId));
    } catch (error) {
      console.error(`Error deleting asset ${assetId}:`, error);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await deleteTransaction(transactionId);
      setTransactions(transactions.filter(transaction => transaction.id !== transactionId));
    } catch (error) {
      console.error(`Error deleting transaction ${transactionId}:`, error);
    }
  };

  const transferAsset = async () => {
    if (!(transfer.from && transfer.to && transfer.assetId)) return; // Ensure all fields are filled
    const transaction = {
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
          <li key={asset.id}>
            {asset.name} 
            <button onClick={() => handleEditAsset(asset.id)}>Edit</button>
            <button onClick={() => handleDeleteAsset(asset.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>Transactions</h2>
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.id}>
            {`Asset ID: ${transaction.assetId}, from: ${transaction.from}, to: ${transaction.to}, date: ${transaction.date}`}
            <button onClick={() => handleDeleteTransaction(transaction.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
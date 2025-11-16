import React from 'react';
import { User, Transaction } from '../types';
import { CoinIcon } from '../constants';

interface WalletProps {
    user: User;
    transactions: Transaction[];
    onClose: () => void;
}

const Wallet: React.FC<WalletProps> = ({ user, transactions, onClose }) => {

    const getTransactionIcon = (type: Transaction['type']) => {
        switch(type) {
            case 'earn_watch': return '🎬';
            case 'earn_bonus': return '🎉';
            case 'tip_sent': return '💸';
            default: return '🪙';
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-end sm:items-center"
            onClick={onClose}
        >
            <div 
                className="bg-[var(--frame-bg-color)] text-[var(--text-color)] w-full max-w-sm h-[85vh] sm:h-auto sm:max-h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-xl border-4 border-[var(--border-color)] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 p-4 flex justify-between items-center border-b-2 border-[var(--border-color)]">
                    <h2 className="text-3xl font-black font-display">My Wallet</h2>
                    <button onClick={onClose} className="text-2xl font-bold opacity-60 hover:opacity-100">&times;</button>
                </header>

                <div className="p-6 text-center flex-shrink-0">
                    <p className="text-sm font-bold opacity-70">Current Balance</p>
                    <div className="flex justify-center items-center gap-2 mt-1">
                        <CoinIcon className="w-10 h-10" />
                        <p className="text-5xl font-black font-display">{user.vibeCoinBalance.toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 px-6 pb-4 flex-shrink-0">
                    <button className="w-full py-3 text-lg font-bold text-center border-2 border-[var(--border-color)] rounded-xl bg-[var(--bg-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        Cash Out
                    </button>
                    <button className="w-full py-3 text-lg font-bold text-center border-2 border-[var(--border-color)] rounded-xl bg-[var(--bg-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        Buy More
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto px-6 space-y-3 pb-6">
                    <h3 className="font-bold text-lg font-display">Transaction History</h3>
                    {transactions.length > 0 ? (
                        [...transactions].reverse().map(tx => (
                            <div key={tx.id} className="flex items-center justify-between bg-[var(--bg-color)] p-3 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">{getTransactionIcon(tx.type)}</div>
                                    <div>
                                        <p className="font-bold">{tx.description}</p>
                                        <p className="text-xs opacity-60">{new Date(tx.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                                <p className={`font-bold text-lg ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center opacity-70 pt-8">No transactions yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Wallet;

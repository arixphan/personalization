"use client";

import { useState, useEffect } from "react";
import { Link2, Unlink, Wallet, Loader2, ArrowUpRight, ArrowDownRight, ShieldCheck } from "lucide-react";
import { useBinanceTicker } from "../_ui/hooks/use-binance-ticker";
import { getBinanceStatus, connectBinance, disconnectBinance, getBinanceAccount } from "../_actions/binance.actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CustomInput } from "@/components/ui/input";

export default function BinancePage() {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [status, setStatus] = useState<any>({ isConnected: false });
  const [account, setAccount] = useState<any>(null);

  // Subscribe to live prices for a few key pairs
  const { tickers, isConnected: isWsConnected } = useBinanceTicker(["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"]);

  useEffect(() => {
    fetchStatusAndAccount();
  }, []);

  const fetchStatusAndAccount = async () => {
    setIsLoading(true);
    try {
      const currentStatus = await getBinanceStatus();
      setStatus(currentStatus);
      if (currentStatus.isConnected) {
        const acc = await getBinanceAccount();
        setAccount(acc);
      } else {
        setAccount(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch Binance account details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !apiSecret) return toast.error("Please provide both API Key and Secret");
    
    setIsConnecting(true);
    try {
      await connectBinance({ apiKey, apiSecret });
      toast.success("Binance connected successfully");
      setApiKey("");
      setApiSecret("");
      fetchStatusAndAccount();
    } catch (error: any) {
      toast.error(error.message || "Failed to connect to Binance");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect?")) return;
    try {
      await disconnectBinance();
      toast.success("Binance disconnected");
      fetchStatusAndAccount();
    } catch (error) {
      toast.error("Failed to disconnect");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-full">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar pb-6">
      {/* Header & Status */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            Binance Integration
            {status.isConnected && (
              <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 ml-2">
                Connected
              </Badge>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Connect your Binance account to view balances and sync trades. (Read-only API key recommended).
          </p>
        </div>
        
        {status.isConnected && (
          <Button variant="outline" onClick={handleDisconnect} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 border-rose-200 dark:border-rose-900">
            <Unlink className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Balance or Form */}
        <div className="lg:col-span-2 space-y-6">
          {status.isConnected ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold dark:text-white">Account Balances</h2>
              </div>
              
              <div className="p-0">
                {account?.balances?.length > 0 ? (
                   <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                         <tr>
                            <th scope="col" className="px-6 py-3 font-semibold">Asset</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-right">Free</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-right">Locked</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-right">Total</th>
                         </tr>
                      </thead>
                      <tbody>
                         {account.balances.map((b: any) => (
                            <tr key={b.asset} className="bg-white border-b dark:bg-gray-900 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                               <td className="px-6 py-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                  <img src={`https://cryptologos.cc/logos/${b.asset.toLowerCase() === 'eth' ? 'ethereum-eth' : b.asset.toLowerCase() === 'btc' ? 'bitcoin-btc' : b.asset.toLowerCase() === 'bnb' ? 'bnb-bnb' : b.asset.toLowerCase() === 'sol' ? 'solana-sol' : 'bitcoin-btc'}-logo.svg?v=032`} alt={b.asset} className="w-5 h-5 rounded-full object-cover bg-gray-100" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                  {b.asset}
                               </td>
                               <td className="px-6 py-4 text-right font-medium">{b.free.toFixed(4)}</td>
                               <td className="px-6 py-4 text-right">{b.locked.toFixed(4)}</td>
                               <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">{b.total.toFixed(4)}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                ) : (
                  <div className="p-12 text-center text-gray-500">
                    No balances found or account is empty.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold dark:text-white">Connect Account</h2>
                <div className="flex items-start gap-2 mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-sm">
                   <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                   <p>Your keys are encrypted using AES-256 before being stored in the database. For security, please only provide keys with <strong>Reading</strong> permissions enabled. Do not enable Spot & Margin Trading or Withdrawals.</p>
                </div>
              </div>
              <form onSubmit={handleConnect} className="space-y-4">
                <CustomInput
                  id="binance-api-key"
                  label="API Key"
                  required
                  value={apiKey}
                  onChange={setApiKey}
                  placeholder="Enter Binance API Key"
                />
                <CustomInput
                  id="binance-api-secret"
                  label="API Secret"
                  type="password"
                  required
                  value={apiSecret}
                  onChange={setApiSecret}
                  placeholder="Enter Binance API Secret"
                />
                <Button type="submit" disabled={isConnecting} className="w-full font-bold shadow-lg h-12">
                  {isConnecting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Link2 className="w-5 h-5 mr-2" />}
                  Connect Binance
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Live Market Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">Live Markets</h3>
            {isWsConnected ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                Connecting...
              </span>
            )}
          </div>
          
          <div className="grid gap-3">
             {["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"].map(symbol => {
                const data = tickers[symbol] || { price: "0.00", changePercent: "0.00" };
                const isPositive = parseFloat(data.changePercent) >= 0;
                
                return (
                   <div key={symbol} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-sm flex items-center justify-between group hover:border-primary/50 transition-colors">
                      <div>
                         <p className="font-bold text-gray-900 dark:text-white">{symbol.replace('USDT', '')}/USDT</p>
                         <p className="text-xl font-bold font-mono tracking-tight my-1">
                            ${parseFloat(data.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                         </p>
                      </div>
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-sm ${isPositive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'}`}>
                         {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                         {Math.abs(parseFloat(data.changePercent)).toFixed(2)}%
                      </div>
                   </div>
                );
             })}
          </div>
        </div>
      </div>
    </div>
  );
}

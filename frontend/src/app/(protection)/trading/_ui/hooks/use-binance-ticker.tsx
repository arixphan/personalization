"use client";

import { useEffect, useState } from "react";

interface TickerData {
  symbol: string;
  price: string;
  changePercent: string;
  volume: string;
}

export function useBinanceTicker(symbols: string[]) {
  const [tickers, setTickers] = useState<Record<string, TickerData>>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!symbols.length) return;

    const streams = symbols.map((s) => `${s.toLowerCase()}@ticker`).join("/");
    const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;
    
    let ws: WebSocket;

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // Data format from Binance ticker stream:
        // e: Event type, s: Symbol, c: Current close price, P: Price change percent, v: Total traded base asset volume
        if (data.e === "24hrTicker") {
          setTickers((prev) => ({
            ...prev,
            [data.s]: {
              symbol: data.s,
              price: data.c,
              changePercent: data.P,
              volume: data.v,
            },
          }));
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      ws.onerror = (error) => {
        console.error("Binance WS error:", error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error("Failed to setup WebSocket:", error);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [symbols.join(",")]);

  return { tickers, isConnected };
}

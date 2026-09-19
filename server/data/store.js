/**
 * KaamAI — JSON file persistence layer
 * Append-only ledger semantics for bills, inventory snapshots, expenses.
 * All methods return plain objects/arrays — no class instances.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = __dirname;
const STORE_FILE = path.join(DATA_DIR, 'store.json');

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_FILE)) {
    const initial = {
      // Append-only bill ledger (newest first)
      bills: [],
      // Inventory snapshots — one per day, or when manually adjusted
      inventorySnapshots: [],
      // Monthly expense categories
      expenses: {
        rawMaterials: 0,
        gasFuel: 0,
        transport: 0,
        other: 0
      }
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2));
  }
  return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
}

function writeStore(data) {
  ensureStore();
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
}

/** Returns a deep clone of the current store */
export function getStore() {
  return ensureStore();
}

/** Record a completed bill (from POS). Appends to ledger and returns the new bill. */
export function recordBill(bill) {
  const store = ensureStore();
  const record = {
    ...bill,
    id: bill.id || `ORD-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString()
  };
  store.bills.unshift(record);
  writeStore(store);
  return record;
}

/** Get recent bills (optionally limited) */
export function getBills(limit = 50) {
  return ensureStore().bills.slice(0, limit);
}

/** Get today's revenue & order count from bills ledger */
export function getTodaySummary() {
  const today = new Date().toISOString().slice(0, 10);
  const store = ensureStore();
  const todays = store.bills.filter(b => b.timestamp.startsWith(today));
  const revenue = todays.reduce((sum, b) => sum + (b.finalTotal || 0), 0);
  return { revenue, orders: todays.length, bills: todays };
}

/** Record an inventory adjustment (purchase or manual correction) */
export function recordInventoryAdjustment(item) {
  const store = ensureStore();
  const snapshot = {
    ...item,
    timestamp: new Date().toISOString(),
    id: `INV-${Date.now().toString(36)}`
  };
  store.inventorySnapshots.unshift(snapshot);
  writeStore(store);
  return snapshot;
}

/** Get the latest inventory snapshot for each item */
export function getCurrentInventory() {
  const store = ensureStore();
  const latest = {};
  for (const snap of store.inventorySnapshots) {
    if (!latest[snap.name]) latest[snap.name] = snap;
  }
  return Object.values(latest);
}

/** Get monthly expense totals */
export function getExpenses() {
  return ensureStore().expenses;
}

/** Add to a specific expense category */
export function addExpense(category, amount) {
  const store = ensureStore();
  if (store.expenses.hasOwnProperty(category)) {
    store.expenses[category] += amount;
    writeStore(store);
  }
  return store.expenses;
}

/** Reset store (dev only) */
export function resetStore() {
  if (fs.existsSync(STORE_FILE)) fs.unlinkSync(STORE_FILE);
  return getStore();
}
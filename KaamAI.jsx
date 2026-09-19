import { useState, useEffect, useRef } from "react";

// ── Palette & constants ──────────────────────────────────────────────────────
const C = {
  bg: "#f0f2ff",
  surface: "#ffffff",
  card: "#ffffff",
  border: "#e4e6f5",
  saffron: "#6c5ce7",
  purpleLight: "#a29bfe",
  purpleDark: "#4834d4",
  mint: "#00b894",
  sky: "#0984e3",
  rose: "#e17055",
  amber: "#f39c12",
  text: "#2d3436",
  muted: "#888da8",
  white: "#ffffff",
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const VENDOR = {
  name: "Raju Bhai",
  stall: "Raju's Momos Corner",
  location: "Near DU North Campus Gate",
  since: "2019",
  avatar: "🧑‍🍳",
};

const TODAY_DEMAND = [
  { item: "Momos", pct: 94, stock: 180, unit: "plates", icon: "🥟", trend: "+12%" },
  { item: "Cold Drinks", pct: 87, stock: 95, unit: "bottles", icon: "🥤", trend: "+8%" },
  { item: "Tea", pct: 61, stock: 60, unit: "cups", icon: "☕", trend: "-4%" },
  { item: "Chutney", pct: 72, stock: 200, unit: "portions", icon: "🫙", trend: "+3%" },
];

const WEEKLY_SALES = [
  { day: "Mon", sales: 3200, orders: 64 },
  { day: "Tue", sales: 2800, orders: 56 },
  { day: "Wed", sales: 4100, orders: 82 },
  { day: "Thu", sales: 3600, orders: 72 },
  { day: "Fri", sales: 5200, orders: 104 },
  { day: "Sat", sales: 6800, orders: 136 },
  { day: "Sun", sales: 5900, orders: 118 },
];

const SCHEMES = [
  {
    name: "PM SVANidhi",
    desc: "Micro-credit loan up to ₹50,000 for street vendors",
    status: "Eligible",
    color: C.mint,
    link: "#",
    icon: "🏦",
  },
  {
    name: "PM Vishwakarma",
    desc: "Skill training + ₹15,000 toolkit support",
    status: "Apply Now",
    color: C.saffron,
    link: "#",
    icon: "🔨",
  },
  {
    name: "PMEGP",
    desc: "Business loan up to ₹25 lakh with 35% subsidy",
    status: "Check Eligibility",
    color: C.sky,
    link: "#",
    icon: "📋",
  },
];

const INSIGHTS = [
  { icon: "🎓", text: "Exams start Monday — expect 40% more orders. Stock up on momos." },
  { icon: "🌧️", text: "Rain forecast Thursday. Hot tea demand will spike by ~60%." },
  { icon: "📅", text: "DU fest on 30th Aug — best sales day of the month predicted." },
  { icon: "💡", text: "Add paneer momos to your menu — 3 nearby stalls reported high demand." },
];

const TRANSACTIONS = [
  { time: "2:14 PM", item: "Momos ×4", amount: 240, type: "cash" },
  { time: "1:58 PM", item: "Tea ×2 + Momos ×2", amount: 190, type: "upi" },
  { time: "1:32 PM", item: "Cold Drink ×3", amount: 90, type: "upi" },
  { time: "12:47 PM", item: "Momos ×6", amount: 360, type: "cash" },
  { time: "12:10 PM", item: "Tea ×4", amount: 80, type: "upi" },
];

// ── Utility components ────────────────────────────────────────────────────────
function DemandBar({ pct, color, animate }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), animate ? 200 : 0);
    return () => clearTimeout(t);
  }, [pct, animate]);
  return (
    <div style={{ background: "#e8eaf6", borderRadius: 99, height: 10, overflow: "hidden", flex: 1 }}>
      <div
        style={{
          width: `${width}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          borderRadius: 99,
          transition: "width 0.9s cubic-bezier(.22,1,.36,1)",
          boxShadow: `0 0 8px ${color}88`,
        }}
      />
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span
      style={{
        background: color + "22",
        color,
        border: `1px solid ${color}44`,
        borderRadius: 99,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.3,
      }}
    >
      {label}
    </span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: "18px 20px",
        boxShadow: "0 2px 12px rgba(108,92,231,0.07)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontWeight: 800, fontSize: 15, color: C.text, letterSpacing: 0.2 }}>{children}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── TAB: Dashboard ────────────────────────────────────────────────────────────
function Dashboard({ animateBars }) {
  const maxSales = Math.max(...WEEKLY_SALES.map((d) => d.sales));
  const todayTotal = WEEKLY_SALES[5].sales;
  const avgSales = Math.round(WEEKLY_SALES.reduce((a, b) => a + b.sales, 0) / 7);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "Today's Revenue", value: "₹5,200", delta: "+18%", color: C.mint },
          { label: "Orders", value: "104", delta: "+12", color: C.sky },
          { label: "Avg Order", value: "₹50", delta: "+₹4", color: C.saffron },
        ].map((k) => (
          <Card key={k.label} style={{ padding: "14px 14px" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.text, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: k.color, marginTop: 4, fontWeight: 700 }}>{k.delta}</div>
          </Card>
        ))}
      </div>

      {/* Demand Forecast */}
      <Card>
        <SectionTitle sub="AI prediction for tomorrow">Tomorrow's Demand Forecast</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {TODAY_DEMAND.map((d, i) => (
            <div key={d.item}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 16 }}>{d.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{d.item}</span>
                  <span
                    style={{
                      fontSize: 10,
                      color: d.trend.startsWith("+") ? C.mint : C.rose,
                      fontWeight: 600,
                    }}
                  >
                    {d.trend}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#6c5ce7" }}>{d.pct}%</span>
                  <span style={{ fontSize: 10, color: C.muted, marginLeft: 6 }}>
                    {d.stock} {d.unit}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <DemandBar
                  pct={d.pct}
                  color={d.pct > 85 ? C.mint : d.pct > 65 ? C.saffron : C.sky}
                  animate={animateBars}
                />
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 16,
            padding: "10px 14px",
            background: C.bg,
            borderRadius: 10,
            fontSize: 12,
            color: C.muted,
          }}
        >
          📍 Based on: Day of week · Weather · Nearby events · Historical sales · Exam schedule
        </div>
      </Card>

      {/* Weekly Bar Chart */}
      <Card>
        <SectionTitle sub="Revenue this week">Weekly Sales</SectionTitle>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100, marginBottom: 8 }}>
          {WEEKLY_SALES.map((d, i) => {
            const isToday = i === 5;
            const h = Math.round((d.sales / maxSales) * 90);
            return (
              <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    width: "100%",
                    height: h,
                    background: isToday
                      ? `linear-gradient(to top, ${C.saffron}, ${C.saffron}aa)`
                      : "#dde1f5",
                    borderRadius: "6px 6px 3px 3px",
                    boxShadow: isToday ? `0 0 12px ${C.saffron}55` : "none",
                    transition: "height 0.6s ease",
                  }}
                />
                <div style={{ fontSize: 10, color: isToday ? C.saffron : C.muted, fontWeight: isToday ? 800 : 400 }}>
                  {d.day}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginTop: 4 }}>
          <span>Avg: ₹{avgSales.toLocaleString()}/day</span>
          <span style={{ color: C.mint }}>Today: ₹{todayTotal.toLocaleString()} 🔥</span>
        </div>
      </Card>

      {/* AI Insights */}
      <Card>
        <SectionTitle sub="Powered by AI">Smart Insights</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {INSIGHTS.map((ins, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                padding: "10px 12px",
                background: C.bg,
                borderRadius: 10,
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{ins.icon}</span>
              <span style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{ins.text}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── TAB: Inventory ────────────────────────────────────────────────────────────
function Inventory() {
  const [items, setItems] = useState([
    { name: "Maida (Flour)", icon: "🌾", current: 5, unit: "kg", min: 3, cost: 40 },
    { name: "Cabbage", icon: "🥬", current: 2, unit: "kg", min: 2, cost: 20 },
    { name: "Paneer", icon: "🧀", current: 0.5, unit: "kg", min: 1, cost: 320 },
    { name: "Cold Drinks", icon: "🥤", current: 48, unit: "bottles", min: 30, cost: 18 },
    { name: "Tea Leaves", icon: "🍃", current: 800, unit: "g", min: 400, cost: 3 },
    { name: "Gas Cylinder", icon: "🔥", current: 60, unit: "%", min: 30, cost: 0 },
  ]);

  const getStatus = (item) => {
    const ratio = item.current / item.min;
    if (ratio <= 0.5) return { label: "Critical", color: C.rose };
    if (ratio <= 1) return { label: "Low", color: C.saffron };
    return { label: "OK", color: C.mint };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <SectionTitle sub="Based on tomorrow's forecast">Recommended Restocking</SectionTitle>
        <div
          style={{
            padding: "12px 14px",
            background: "#fef3c7",
            border: "1px solid #fbbf24",
            borderRadius: 12,
            fontSize: 13,
            color: "#b45309",
            marginBottom: 14,
          }}
        >
          ⚠️ Paneer is below safe stock. Buy at least 0.5 kg before tomorrow.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => {
            const status = getStatus(item);
            return (
              <div
                key={item.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: C.bg,
                  borderRadius: 12,
                  border: `1px solid ${status.color}33`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>
                      {item.current} {item.unit} · Min: {item.min} {item.unit}
                    </div>
                  </div>
                </div>
                <Badge label={status.label} color={status.color} />
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionTitle>Today's Shopping List</SectionTitle>
        {[
          { item: "Paneer", qty: "1 kg", est: "₹320", store: "Big Bazaar / Local dairy" },
          { item: "Maida", qty: "5 kg", est: "₹200", store: "Kirana store" },
          { item: "Cabbage", qty: "3 kg", est: "₹60", store: "Vegetable market" },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              padding: "12px 0",
              borderBottom: i < 2 ? `1px solid ${C.border}` : "none",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>
                {s.item} — {s.qty}
              </div>
              <div style={{ fontSize: 11, color: C.muted }}>{s.store}</div>
            </div>
            <div style={{ fontWeight: 800, color: "#6c5ce7", fontSize: 14 }}>{s.est}</div>
          </div>
        ))}
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            background: C.mint + "18",
            borderRadius: 10,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 13,
          }}
        >
          <span style={{ color: C.muted }}>Estimated Total</span>
          <span style={{ color: C.mint, fontWeight: 800 }}>₹580</span>
        </div>
      </Card>
    </div>
  );
}

// ── TAB: Finance ──────────────────────────────────────────────────────────────
function Finance() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "This Month Revenue", value: "₹1,24,000", delta: "+₹14k vs last month", color: C.mint },
          { label: "This Month Expenses", value: "₹41,200", delta: "Raw materials + misc", color: C.rose },
          { label: "Net Profit", value: "₹82,800", delta: "66.8% margin", color: "#6c5ce7" },
          { label: "Daily Average", value: "₹4,133", delta: "Target: ₹4,500", color: C.sky },
        ].map((k) => (
          <Card key={k.label} style={{ padding: "14px" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>{k.value}</div>
            <div style={{ fontSize: 11, color: k.color, marginTop: 3 }}>{k.delta}</div>
          </Card>
        ))}
      </div>

      {/* Recent transactions */}
      <Card>
        <SectionTitle sub="Today's log">Recent Transactions</SectionTitle>
        {TRANSACTIONS.map((t, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: i < TRANSACTIONS.length - 1 ? `1px solid ${C.border}` : "none",
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{t.item}</div>
              <div style={{ fontSize: 11, color: C.muted }}>
                {t.time} · {t.type === "upi" ? "UPI 📲" : "Cash 💵"}
              </div>
            </div>
            <div style={{ fontWeight: 800, color: C.mint, fontSize: 14 }}>+₹{t.amount}</div>
          </div>
        ))}
      </Card>

      {/* Expense breakdown */}
      <Card>
        <SectionTitle sub="This month">Expense Breakdown</SectionTitle>
        {[
          { label: "Raw Materials", pct: 68, amt: "₹28,000", color: C.saffron },
          { label: "Gas & Fuel", pct: 12, amt: "₹5,000", color: C.sky },
          { label: "Transport", pct: 10, amt: "₹4,200", color: C.mint },
          { label: "Other", pct: 10, amt: "₹4,000", color: C.muted },
        ].map((e) => (
          <div key={e.label} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: C.text }}>{e.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: e.color }}>{e.amt}</span>
            </div>
            <DemandBar pct={e.pct} color={e.color} animate={true} />
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── TAB: Schemes ──────────────────────────────────────────────────────────────
function Schemes() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <SectionTitle sub="Matched to your profile by AI">Government Schemes For You</SectionTitle>
        <div
          style={{
            padding: "12px 14px",
            background: C.mint + "18",
            border: `1px solid ${C.mint}33`,
            borderRadius: 12,
            fontSize: 12,
            color: C.mint,
            marginBottom: 14,
          }}
        >
          🎯 AI matched 3 schemes based on your location, income, and business type.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {SCHEMES.map((s) => (
            <div
              key={s.name}
              style={{
                padding: "16px",
                background: C.surface,
                borderRadius: 14,
                border: `1px solid ${s.color}33`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <div style={{ fontWeight: 800, color: C.text, fontSize: 14 }}>{s.name}</div>
                </div>
                <Badge label={s.status} color={s.color} />
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 1.5 }}>{s.desc}</div>
              <button
                style={{
                  background: s.color,
                  color: "#000",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Learn More & Apply →
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>How to apply for SVANidhi?</SectionTitle>
        {[
          { step: "1", text: "Visit nearest bank or Common Service Centre (CSC)" },
          { step: "2", text: "Carry Aadhar card + Vendor certificate from local municipality" },
          { step: "3", text: "Fill PM SVANidhi form (also available on pmsvanidhi.mohua.gov.in)" },
          { step: "4", text: "Loan disbursed within 30 days. Repay monthly to unlock higher limit." },
        ].map((s) => (
          <div key={s.step} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: s.step < "4" ? `1px solid ${C.border}` : "none" }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#6c5ce7",
                color: "#fff",
                fontWeight: 900,
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {s.step}
            </div>
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{s.text}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── TAB: Ask AI (Chat) ────────────────────────────────────────────────────────
function AskAI() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Namaste Raju Bhai! 🙏 I'm your KaamAI assistant. Ask me anything about your business — demand, pricing, schemes, or anything else!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const SYSTEM = `You are KaamAI, an AI business assistant for Indian street food vendors and micro-entrepreneurs. 
The vendor is Raju Bhai who sells momos, cold drinks, and tea near DU North Campus in Delhi.
His daily revenue averages ₹4,133. He's been running the stall since 2019.
Respond in a warm, helpful, practical Hindi-English mix tone (Hinglish). Keep replies short and actionable.
Focus on: demand forecasting, inventory advice, pricing, government schemes (PM SVANidhi, PM Vishwakarma, PMEGP), financial tips, and local market insights.`;

  const QUICK = [
    "Kal kitna stock karun?",
    "PM SVANidhi kaise milega?",
    "Price kaise badhaaun?",
    "Exam season mein kya karen?",
  ];

  const send = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.text,
      }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM,
          messages: history,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Kuch problem aayi. Phir try karo!";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Network issue. Please try again." }]);
    }
    setLoading(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", gap: 0 }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div
              style={{
                maxWidth: "82%",
                padding: "12px 14px",
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: m.role === "user" ? "#6c5ce7" : C.bg,
                color: m.role === "user" ? "#fff" : C.text,
                fontSize: 13,
                lineHeight: 1.6,
                border: m.role === "assistant" ? `1px solid ${C.border}` : "none",
                fontWeight: m.role === "user" ? 600 : 400,
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 6, padding: "12px 14px", alignItems: "center" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#6c5ce7",
                  animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "8px 0", flexShrink: 0 }}>
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            style={{
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 99,
              color: C.text,
              padding: "6px 12px",
              fontSize: 12,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8, paddingTop: 8, flexShrink: 0 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Kuch bhi puchho apne business ke baare mein..."
          style={{
            flex: 1,
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "12px 14px",
            color: C.text,
            fontSize: 13,
            outline: "none",
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          style={{
            background: "#6c5ce7",
            border: "none",
            borderRadius: 12,
            width: 46,
            height: 46,
            cursor: "pointer",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: loading || !input.trim() ? 0.5 : 1,
            flexShrink: 0,
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "inventory", label: "Inventory", icon: "📦" },
  { id: "finance", label: "Finance", icon: "💰" },
  { id: "schemes", label: "Schemes", icon: "🏛️" },
  { id: "ask", label: "Ask AI", icon: "🤖" },
];

export default function KaamAI() {
  const [tab, setTab] = useState("dashboard");
  const [animateBars, setAnimateBars] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimateBars(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        color: C.text,
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
        boxShadow: "0 0 40px rgba(108,92,231,0.08)",
      }}
    >
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0; height: 0; }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: "20px 20px 14px",
          background: C.surface,
          borderBottom: `1px solid ${C.border}`,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  background: `linear-gradient(90deg, #6c5ce7, #a29bfe)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: 2,
                }}
              >
                KAAMAI
              </span>
              <span
                style={{
                  fontSize: 9,
                  background: "#ede9fe",
                  color: "#6c5ce7",
                  border: "1px solid #c4b5fd",
                  borderRadius: 99,
                  padding: "1px 7px",
                  fontWeight: 700,
                }}
              >
                AI OS
              </span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginTop: 2 }}>
              {VENDOR.avatar} {VENDOR.stall}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>📍 {VENDOR.location}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: C.muted }}>Live</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
              <div
                style={{ width: 7, height: 7, borderRadius: "50%", background: C.mint, boxShadow: `0 0 6px ${C.mint}` }}
              />
              <span style={{ fontSize: 11, color: C.mint, fontWeight: 700 }}>Online</span>
            </div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 16px 100px" }}>
        {tab === "dashboard" && <Dashboard animateBars={animateBars} />}
        {tab === "inventory" && <Inventory />}
        {tab === "finance" && <Finance />}
        {tab === "schemes" && <Schemes />}
        {tab === "ask" && <AskAI />}
      </div>

      {/* Bottom Nav */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 430,
          background: C.surface,
          borderTop: `1px solid ${C.border}`,
          display: "flex",
          zIndex: 20,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                padding: "10px 4px 8px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                borderTop: active ? "2px solid #6c5ce7" : "2px solid transparent",
              }}
            >
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: active ? 800 : 400,
                  color: active ? "#6c5ce7" : C.muted,
                  letterSpacing: 0.2,
                }}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Activity, ArrowRight, BrainCircuit, ShieldCheck } from "lucide-react";
import "./App.css";

const initial = {
  Administrative: 2,
  Administrative_Duration: 60,
  Informational: 0,
  Informational_Duration: 0,
  ProductRelated: 15,
  ProductRelated_Duration: 600,
  BounceRates: 0.02,
  SpecialDay: 0,
  Month: "Nov",
  OperatingSystems: "2",
  Browser: "2",
  Region: "1",
  TrafficType: "2",
  VisitorType: "Returning_Visitor",
  Weekend: false,
};

const numericFields = [
  ["Administrative", "Administrative pages", 1],
  ["Administrative_Duration", "Administrative duration (sec)", 0.1],
  ["Informational", "Informational pages", 1],
  ["Informational_Duration", "Informational duration (sec)", 0.1],
  ["ProductRelated", "Product-related pages", 1],
  ["ProductRelated_Duration", "Product-related duration (sec)", 0.1],
  ["BounceRates", "Bounce rate (0–1)", 0.001],
  ["SpecialDay", "Special day proximity (0–1)", 0.01],
];

const categoryFields = [
  ["OperatingSystems", "Operating system code"],
  ["Browser", "Browser code"],
  ["Region", "Region code"],
  ["TrafficType", "Traffic type code"],
];

function App() {
  const [form, setForm] = useState(initial);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const predict = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          JSON.stringify(data.detail || "Prediction failed")
        );
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to reach prediction API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><BrainCircuit size={22} /></div>
          <div><strong>ConversionIQ</strong><small>Independent MATW-inspired research</small></div>
        </div>

        <div className="nav-active">
          <Activity size={18} /> Conversion Predictor
        </div>

        <div className="sidebar-bottom">
          <ShieldCheck size={18} />
          <span>Independent demo · Not affiliated with MATW</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <span>MATW-inspired research / Conversion intelligence</span>
          <span className="version">Model v1.0</span>
        </header>

        <div className="content">
          <div className="heading">
            <div className="eyebrow">IMPACT INTELLIGENCE LAB</div>
            <h1>Conversion Intelligence <span className="heading-accent">Dashboard</span></h1>
            <p>
              Explore purchase-conversion signals using session behavior and a trained Gradient Boosting model. An independent MATW-inspired machine-learning prototype.
            </p>
          </div>

          <div className="notice">
            Research prototype: trained on e-commerce sessions, not MATW donor records. These are purchase predictions, not validated donation predictions. This project is not affiliated with or endorsed by MATW.
          </div>

          <div className="layout">
            <form className="panel" onSubmit={predict}>
              <div className="panel-header">
                <h2>Session Information</h2>
                <p>Enter the observed session features.</p>
              </div>

              <div className="section-title">Browsing activity</div>
              <div className="form-grid">
                {numericFields.map(([key, label, step]) => (
                  <label className="field" key={key}>
                    <span>{label}</span>
                    <input
                      type="number"
                      required
                      min="0"
                      max={
                        key === "BounceRates" || key === "SpecialDay"
                          ? "1" : undefined
                      }
                      step={step}
                      value={form[key]}
                      onChange={(e) =>
                        update(key, e.target.value === "" ? "" : Number(e.target.value))
                      }
                    />
                  </label>
                ))}
              </div>

              <div className="section-title">Visitor and traffic</div>
              <div className="form-grid">
                <label className="field">
                  <span>Month</span>
                  <select
                    value={form.Month}
                    onChange={(e) => update("Month", e.target.value)}
                  >
                    {["Feb","Mar","May","June","Jul","Aug","Sep","Oct","Nov","Dec"]
                      .map((m) => <option key={m}>{m}</option>)}
                  </select>
                </label>

                <label className="field">
                  <span>Visitor type</span>
                  <select
                    value={form.VisitorType}
                    onChange={(e) => update("VisitorType", e.target.value)}
                  >
                    <option value="Returning_Visitor">Returning visitor</option>
                    <option value="New_Visitor">New visitor</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                {categoryFields.map(([key, label]) => (
                  <label className="field" key={key}>
                    <span>{label}</span>
                    <input
                      type="text"
                      required
                      value={form[key]}
                      onChange={(e) => update(key, e.target.value)}
                    />
                  </label>
                ))}
              </div>

              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={form.Weekend}
                  onChange={(e) => update("Weekend", e.target.checked)}
                />
                Weekend session
              </label>

              <button className="predict-button" disabled={loading}>
                {loading ? "Calculating..." : "Analyze Conversion"}
                {!loading && <ArrowRight size={18} />}
              </button>
              {error && <p className="error">{error}</p>}
            </form>

            <div className="right-column">
              <section className="panel result-panel">
                <div className="panel-header">
                  <h2>Prediction Result</h2>
                  <p>Gradient Boosting classification output</p>
                </div>

                {result ? (
                  <div className="result-content">
                    <div className="metric-label">Purchase probability</div>
                    <div className="probability">
                      {(result.purchase_probability * 100).toFixed(2)}%
                    </div>
                    <div className="progress">
                      <div
                        style={{
                          width: `${result.purchase_probability * 100}%`
                        }}
                      />
                    </div>
                    <div className="result-tag">
                      {result.predicted_class}
                    </div>
                    <div className="result-meta">
                      Decision threshold:{" "}
                      {(result.classification_threshold * 100).toFixed(0)}%
                    </div>
                  </div>
                ) : (
                  <div className="empty-result">
                    <BrainCircuit size={42} strokeWidth={1.3} />
                    <h3>Awaiting prediction</h3>
                    <p>Complete the form and run the model to see results.</p>
                  </div>
                )}
              </section>

              <section className="panel model-panel">
                <h2>Model Information</h2>
                <div><span>Algorithm</span><strong>Gradient Boosting</strong></div>
                <div><span>Test accuracy</span><strong>75.59%</strong></div>
                <div><span>ROC-AUC</span><strong>0.7940</strong></div>
                <div><span>Decision threshold</span><strong>20%</strong></div>
                <div><span>Input features</span><strong>15</strong></div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

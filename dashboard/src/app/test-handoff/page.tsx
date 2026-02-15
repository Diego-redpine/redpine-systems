'use client';

import { useState } from 'react';
import Brand from '@/components/Brand';

const businessPresets = {
  salon: {
    business_name: "Bella Nails Salon",
    business_type: "salon",
    visible_tabs: ["people", "things", "time", "money", "comms"],
    hidden_tabs: ["tasks", "files"],
    labels: { people: "Clients", time: "Appointments" },
    nav_style: "rounded",
    nav_display: "icon_and_text",
  },
  barber: {
    business_name: "Bob's Cuts",
    business_type: "barber",
    visible_tabs: ["people", "time", "money", "comms"],
    hidden_tabs: ["things", "tasks", "files"],
    labels: { people: "Clients" },
    nav_style: "square",
    nav_display: "icon_and_text",
  },
  landscaping: {
    business_name: "Green Valley Landscaping",
    business_type: "landscaping",
    visible_tabs: ["people", "things", "time", "money", "tasks"],
    hidden_tabs: ["comms", "files"],
    labels: { people: "Customers & Crews", time: "Schedule", tasks: "Jobs" },
    nav_style: "half_rounded",
    nav_display: "icon_and_text",
  },
  restaurant: {
    business_name: "Casa Maria Restaurant",
    business_type: "restaurant",
    visible_tabs: ["people", "things", "time", "money", "comms"],
    hidden_tabs: ["tasks", "files"],
    labels: { people: "Guests & Team", things: "Menu & Inventory", time: "Reservations" },
    nav_style: "rounded",
    nav_display: "text_only",
  },
};

export default function TestHandoffPage() {
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof businessPresets>('salon');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; redirect_url?: string; error?: string } | null>(null);

  const handleTestHandoff = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const config = businessPresets[selectedPreset];

      const response = await fetch('/api/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await response.json();
      setResult(data);

      if (data.success && data.redirect_url) {
        // Auto-redirect after 2 seconds
        setTimeout(() => {
          window.location.href = data.redirect_url;
        }, 2000);
      }
    } catch (error) {
      setResult({ success: false, error: 'Failed to connect to handoff API' });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border-2 border-black p-8">
          <div className="flex items-center justify-between mb-6">
            <Brand size="md" />
            <span className="text-xs bg-gray-50 text-muted px-2 py-1 border-2 border-black">Developer Tool</span>
          </div>

          <h1 className="text-xl font-bold mb-2">Flask Handoff Test</h1>
          <p className="text-muted mb-8">
            Simulates the Flask onboarding app sending a configuration to the dashboard.
          </p>

          {/* Preset Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Business Type</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(businessPresets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPreset(key as keyof typeof businessPresets)}
                  className={`p-4 border-2 text-left transition-all duration-150 ${
                    selectedPreset === key
                      ? 'border-primary bg-gray-50'
                      : 'border-black hover:bg-gray-50'
                  }`}
                >
                  <p className="font-medium capitalize">{key}</p>
                  <p className="text-sm text-muted">{preset.business_name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Config Preview */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Configuration Preview</label>
            <pre className="bg-gray-50 border-2 border-black p-4 text-sm overflow-x-auto">
              {JSON.stringify(businessPresets[selectedPreset], null, 2)}
            </pre>
          </div>

          {/* Test Button */}
          <button
            onClick={handleTestHandoff}
            disabled={isLoading}
            className="w-full py-3 px-6 bg-white text-primary border-2 border-black font-semibold hover:bg-primary hover:text-white transition-all duration-150 disabled:opacity-50"
          >
            {isLoading ? 'Sending to Dashboard...' : 'Test Handoff -> Preview Dashboard'}
          </button>

          {/* Result */}
          {result && (
            <div className={`mt-6 p-4 border-2 ${result.success ? 'border-primary bg-gray-50' : 'border-black bg-red-50'}`}>
              {result.success ? (
                <>
                  <p className="font-medium text-primary">Handoff successful!</p>
                  <p className="text-sm text-muted mt-1">
                    Redirecting to preview in 2 seconds...
                  </p>
                  <a
                    href={result.redirect_url}
                    className="text-sm text-primary hover:underline mt-2 block"
                  >
                    {result.redirect_url}
                  </a>
                </>
              ) : (
                <p className="text-red-800">{result.error}</p>
              )}
            </div>
          )}

          {/* Flask Code Example */}
          <div className="mt-8 pt-6 border-t-2 border-black">
            <h3 className="font-medium mb-3">Flask Integration Code</h3>
            <pre className="bg-black text-gray-100 border-2 border-black p-4 text-sm overflow-x-auto">
{`# In your Flask app
import requests

@app.route('/complete-onboarding', methods=['POST'])
def complete_onboarding():
    config = {
        "business_name": session.get('business_name'),
        "business_type": session.get('business_type'),
        "visible_tabs": session.get('visible_tabs'),
        "hidden_tabs": session.get('hidden_tabs'),
        "labels": session.get('labels', {}),
        "nav_style": "rounded",
        "nav_display": "icon_and_text",
    }

    response = requests.post(
        "http://localhost:3000/api/handoff",
        json=config
    )
    data = response.json()

    if data.get('success'):
        return redirect(data['redirect_url'])
    else:
        return "Error", 500`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

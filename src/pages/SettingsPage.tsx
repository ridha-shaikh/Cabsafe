import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function SettingsPage() {
  return (
    <PageContainer title="System Settings" description="Configure your operations center and simulation parameters.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <Card className="bg-surface border-border shadow-sm">
           <CardHeader className="border-b border-border bg-background">
              <CardTitle className="text-base font-extrabold text-text-main">Simulation Engine</CardTitle>
           </CardHeader>
           <CardContent className="p-6 space-y-6">
              <div>
                 <label className="text-sm font-bold text-text-main mb-2 block">Tick Rate (ms)</label>
                 <input type="number" defaultValue={1000} className="w-full bg-background border border-border rounded-lg px-4 py-2 font-mono text-sm" />
              </div>
              <div>
                 <label className="text-sm font-bold text-text-main mb-2 block">Speed Multiplier</label>
                 <input type="number" defaultValue={1} className="w-full bg-background border border-border rounded-lg px-4 py-2 font-mono text-sm" />
              </div>
              <Button variant="primary">Save Configuration</Button>
           </CardContent>
        </Card>

        <Card className="bg-surface border-border shadow-sm">
           <CardHeader className="border-b border-border bg-background">
              <CardTitle className="text-base font-extrabold text-text-main">Safety Thresholds</CardTitle>
           </CardHeader>
           <CardContent className="p-6 space-y-6">
              <div>
                 <label className="text-sm font-bold text-text-main mb-2 block">Overspeed Limit (km/h)</label>
                 <input type="number" defaultValue={80} className="w-full bg-background border border-border rounded-lg px-4 py-2 font-mono text-sm" />
              </div>
              <div>
                 <label className="text-sm font-bold text-text-main mb-2 block">Harsh Braking Threshold (m/s²)</label>
                 <input type="number" defaultValue={-4.5} className="w-full bg-background border border-border rounded-lg px-4 py-2 font-mono text-sm" />
              </div>
              <Button variant="primary">Save Configuration</Button>
           </CardContent>
        </Card>

      </div>
    </PageContainer>
  );
}

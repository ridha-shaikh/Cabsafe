const fs = require('fs');
const pages = ['PassengersPage', 'BookingsPage', 'TripsPage', 'SOSPage', 'AlertsPage', 'MaintenancePage', 'ReportsPage', 'DatabaseOverviewPage', 'DriversPage'];

const template = \import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export default function __NAME__() {
  return (
    <PageContainer title="__TITLE__" description="Operations and monitoring for __LOWER__.">
      <Card className="bg-surface border-border shadow-sm">
         <CardHeader className="border-b border-border bg-background">
            <CardTitle className="text-base font-extrabold text-text-main">__TITLE__ Overview</CardTitle>
         </CardHeader>
         <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-background rounded-full mb-4 flex items-center justify-center border border-border shadow-sm">
               <svg className="w-8 h-8 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
            </div>
            <h3 className="text-xl font-extrabold text-text-main mb-2">No active records</h3>
            <p className="text-text-secondary font-medium">The simulation engine is populating data for this section.</p>
         </CardContent>
      </Card>
    </PageContainer>
  );
}
\;

pages.forEach(p => {
   const title = p.replace('Page', '').replace(/([A-Z])/g, ' ').trim();
   const content = template.replace(/__NAME__/g, p).replace(/__TITLE__/g, title).replace(/__LOWER__/g, title.toLowerCase());
   fs.writeFileSync('src/pages/' + p + '.tsx', content);
});
console.log('Done');

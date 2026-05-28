import React from 'react';
import StatsCards from '../components/dashboard/StatsCards';
import QuickActions from '../components/dashboard/QuickActions';
import UsageChart from '../components/dashboard/UsageChart';
import RecentDetections from '../components/dashboard/RecentDetections';
import Breadcrumbs from '../components/common/Breadcrumbs';

export default function Dashboard() {
    return (
        <div className="animate-fade-in">
            <Breadcrumbs />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Dashboard Overview</h1>
                <p className="text-gray-400">Welcome back! Here's what's happening with your forensics analysis.</p>
            </div>

            <StatsCards />
            <QuickActions />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <UsageChart />
                </div>
                <div>
                    <RecentDetections />
                </div>
            </div>
        </div>
    );
}

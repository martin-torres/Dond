import React, { useState, useEffect } from 'react';

// Import custom components
import LeftSidebar from './components/LeftSidebar';
import TopTabs, { adminDashboardTabs, useTabState } from './components/TopTabs';
import RightSidebar from './components/RightSidebar';
import BottomBar from './components/BottomBar';
import RestaurantList from './components/RestaurantList';

// Import existing components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import admin API
import { adminApi } from '@/api/adminApi';

// Types
interface DashboardStats {
  total_restaurants: number;
  active_restaurants: number;
  total_orders: number;
  pending_communications: number;
  recent_imports: number;
  total_revenue: number;
}

interface RestaurantSummary {
  id: string;
  name: string;
  total_orders?: number;
  total_revenue?: number;
  avg_order_value?: number;
  last_order_date?: string | null;
  active_tables?: number;
  total_tables?: number;
}

export default function CreatorDashboard() {
  // Component state
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const { activeTab, setActiveTab } = useTabState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Load dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Load real data from APIs
        const [restaurantsResult] = await Promise.allSettled([
          // Get restaurants count
          adminApi.dashboard.getRestaurantStats({ limit: 1000 })
        ]);

        // Extract data from results
        let totalRestaurants = 0;
        let totalOrders = 0;
        let totalRevenue = 0;

        if (restaurantsResult.status === 'fulfilled') {
          totalRestaurants = restaurantsResult.value.total;
          // Calculate totals from restaurant data
          totalOrders = restaurantsResult.value.data.reduce((sum: number, r: any) =>
            sum + (r.total_orders || 0), 0);
          totalRevenue = restaurantsResult.value.data.reduce((sum: number, r: any) =>
            sum + (r.total_revenue || 0), 0);
        }

        // Set stats with real data
        setStats({
          total_restaurants: totalRestaurants,
          active_restaurants: totalRestaurants, // Simplified - would need status filtering
          total_orders: totalOrders,
          pending_communications: 0, // Will be implemented with communications API
          recent_imports: 0, // Will be implemented with imports API
          total_revenue: totalRevenue
        });

      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        // Fallback to mock data if APIs fail
        setStats({
          total_restaurants: 0,
          active_restaurants: 0,
          total_orders: 0,
          pending_communications: 0,
          recent_imports: 0,
          total_revenue: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Render main content based on active tab
  const renderMainContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Restaurants Overview</h1>
              <Button>Add Restaurant</Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_restaurants || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.active_restaurants || 0} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_orders?.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    This month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.pending_communications || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Require attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Imports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.recent_imports || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Last 7 days
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Restaurant List */}
            <RestaurantList
              onRestaurantSelect={(restaurant) => {
                console.log('Selected restaurant:', restaurant);
                // TODO: Open restaurant details modal/sidebar
              }}
              onRestaurantEdit={(restaurant) => {
                console.log('Edit restaurant:', restaurant);
                // TODO: Open edit restaurant modal
              }}
              onRestaurantDelete={(restaurant) => {
                console.log('Delete restaurant:', restaurant);
                // TODO: Show delete confirmation dialog
              }}
            />
          </div>
        );

      default:
        return (
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">
                  {adminDashboardTabs.find((tab: any) => tab.id === activeTab)?.label}
                </h2>
                <p className="text-muted-foreground">
                  This section is under development.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar */}
      <LeftSidebar
        isCollapsed={isLeftSidebarCollapsed}
        onToggleCollapse={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        stats={{
          total_restaurants: stats?.total_restaurants,
          pending_communications: stats?.pending_communications,
          recent_imports: stats?.recent_imports
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Tab Bar */}
        <TopTabs
          tabs={adminDashboardTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {renderMainContent()}
        </div>

        {/* Bottom Status Bar */}
        <BottomBar
          status={{
            api: 'connected',
            database: 'connected',
            lastUpdate: new Date().toLocaleTimeString(),
            notifications: stats?.pending_communications || 0
          }}
        />
      </div>

      {/* Right Sidebar */}
      <RightSidebar
        context={activeTab === 'overview' ? 'overview' : undefined}
        contextData={stats}
      />
    </div>
  );
}

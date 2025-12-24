import React, { useState, useEffect } from 'react';
import { Search, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Import admin API
import { adminApi } from '@/api/adminApi';

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

interface RestaurantListProps {
  onRestaurantSelect?: (restaurant: RestaurantSummary) => void;
  onRestaurantEdit?: (restaurant: RestaurantSummary) => void;
  onRestaurantDelete?: (restaurant: RestaurantSummary) => void;
  className?: string;
}

// Helper function to parse restaurant name from JSON string
const parseRestaurantName = (nameField: any): string => {
  if (typeof nameField === 'string') {
    try {
      const nameObj = JSON.parse(nameField);
      return nameObj?.en || nameObj?.es || nameField;
    } catch (e) {
      // If JSON parsing fails, return the string as-is
      return nameField;
    }
  }
  if (typeof nameField === 'object' && nameField?.en) {
    return nameField.en;
  }
  return String(nameField || '');
};

export default function RestaurantList({
  onRestaurantSelect,
  onRestaurantEdit,
  onRestaurantDelete,
  className = ''
}: RestaurantListProps) {
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Load restaurants
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const result = await adminApi.dashboard.getRestaurantStats({
          limit: 100,
          search: searchTerm || undefined
        });

        // Transform the data to match our interface
        const transformedData: RestaurantSummary[] = result.data.map((restaurant: any) => ({
          id: restaurant.id,
          name: parseRestaurantName(restaurant.name), // Parse the JSON name field
          total_orders: restaurant.total_orders || 0,
          total_revenue: restaurant.total_revenue || 0,
          avg_order_value: restaurant.avg_order_value || 0,
          last_order_date: restaurant.last_order_date,
          active_tables: restaurant.active_tables || 0,
          total_tables: restaurant.total_tables || 0
        }));

        setRestaurants(transformedData);
      } catch (error) {
        console.error('Failed to load restaurants:', error);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, [searchTerm]);

  // Filter restaurants based on search
  const filteredRestaurants = restaurants.filter(restaurant =>
    (restaurant.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Restaurant Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
            Loading restaurants...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Restaurant Management</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search restaurants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Button>Add Restaurant</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? 'No restaurants found matching your search.' : 'No restaurants found.'}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurant</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Avg Order</TableHead>
                  <TableHead className="text-center">Tables</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRestaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{restaurant.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {restaurant.id.slice(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {restaurant.total_orders?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(restaurant.total_revenue || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(restaurant.avg_order_value || 0)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Badge variant="outline" className="text-xs">
                          {restaurant.active_tables || 0}/{restaurant.total_tables || 0}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(restaurant.last_order_date)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onRestaurantSelect?.(restaurant)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onRestaurantEdit?.(restaurant)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onRestaurantDelete?.(restaurant)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {filteredRestaurants.length > 0 && (
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>
              Showing {filteredRestaurants.length} of {restaurants.length} restaurants
            </span>
            <span>
              Total Revenue: {formatCurrency(
                filteredRestaurants.reduce((sum, r) => sum + (r.total_revenue || 0), 0)
              )}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

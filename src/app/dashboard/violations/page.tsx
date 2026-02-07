// ===========================================
// VIOLATIONS LIST PAGE
// ===========================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { ViolationCard } from '@/components/violations/violation-card';
import { ViolationFilters, FilterValues } from '@/components/violations/violation-filters';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Violation } from '@/types';
import { FileWarning, Grid, List } from 'lucide-react';

export default function ViolationsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [filteredViolations, setFilteredViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'super_admin';
  const isCitizen = session?.user?.role === 'citizen';

  // Get initial filter from URL
  const initialPlateStatus = searchParams.get('plate_status');

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    try {
      const response = await fetch('/api/violations');
      const result = await response.json();
      if (result.success) {
        const data = result.data || [];
        setViolations(data);
        
        // Apply initial filter from URL
        if (initialPlateStatus) {
          setFilteredViolations(
            data.filter((v: Violation) => v.vehicle.plate_status === initialPlateStatus)
          );
        } else {
          setFilteredViolations(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch violations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = useCallback(
    (filters: FilterValues) => {
      let result = [...violations];

      if (filters.date) {
        result = result.filter((v) => v.date === filters.date);
      }

      if (filters.violationType && filters.violationType !== 'all') {
        result = result.filter((v) =>
          v.violations.some((vt) => vt.type === filters.violationType)
        );
      }

      if (filters.paymentStatus && filters.paymentStatus !== 'all') {
        result = result.filter((v) => v.payment_status === filters.paymentStatus);
      }

      if (filters.plateStatus && filters.plateStatus !== 'all') {
        result = result.filter((v) => v.vehicle.plate_status === filters.plateStatus);
      }

      setFilteredViolations(result);
    },
    [violations]
  );

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading violations..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Traffic Violations"
        description={
          isCitizen
            ? 'View all your recorded traffic violations'
            : 'Manage and review all traffic violations'
        }
      >
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </PageHeader>

      {/* Filters */}
      <ViolationFilters
        onFilterChange={handleFilterChange}
        showPlateStatus={isAdmin}
      />

      {/* Tabs for quick filtering */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setFilteredViolations(violations)}>
            All ({violations.length})
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            onClick={() =>
              setFilteredViolations(
                violations.filter((v) => v.payment_status === 'PENDING')
              )
            }
          >
            Pending ({violations.filter((v) => v.payment_status === 'PENDING').length})
          </TabsTrigger>
          <TabsTrigger
            value="paid"
            onClick={() =>
              setFilteredViolations(
                violations.filter((v) => v.payment_status === 'PAID')
              )
            }
          >
            Paid ({violations.filter((v) => v.payment_status === 'PAID').length})
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger
              value="review"
              onClick={() =>
                setFilteredViolations(
                  violations.filter((v) => v.vehicle.plate_status === 'MANUAL_REVIEW')
                )
              }
            >
              Needs Review (
              {violations.filter((v) => v.vehicle.plate_status === 'MANUAL_REVIEW').length})
            </TabsTrigger>
          )}
        </TabsList>
      </Tabs>

      {/* Violations Grid/List */}
      {filteredViolations.length === 0 ? (
        <EmptyState
          icon={FileWarning}
          title="No violations found"
          description={
            violations.length === 0
              ? isCitizen
                ? "You don't have any recorded violations. Drive safely!"
                : 'No violations have been recorded yet.'
              : 'No violations match your current filters. Try adjusting the filters.'
          }
          action={
            violations.length > 0
              ? {
                  label: 'Clear Filters',
                  onClick: () => setFilteredViolations(violations),
                }
              : undefined
          }
        />
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
              : 'space-y-4'
          }
        >
          {filteredViolations.map((violation) => (
            <ViolationCard
              key={violation.violation_id}
              violation={violation}
              showPayButton={isCitizen}
              showViewButton
            />
          ))}
        </div>
      )}
    </div>
  );
}
// ===========================================
// VIOLATION FILTERS COMPONENT
// ===========================================

'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, X, Filter } from 'lucide-react';
import { useState } from 'react';

interface ViolationFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  showPlateStatus?: boolean;
}

export interface FilterValues {
  date?: string;
  violationType?: string;
  paymentStatus?: string;
  plateStatus?: string;
  search?: string;
}

const violationTypes = [
  { value: 'NO_HELMET', label: 'No Helmet' },
  { value: 'TRIPLE_RIDING', label: 'Triple Riding' },
  { value: 'SIGNAL_JUMP', label: 'Signal Jump' },
  { value: 'ZEBRA_CROSSING', label: 'Zebra Crossing' },
];

const paymentStatuses = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
];

const plateStatuses = [
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'MANUAL_REVIEW', label: 'Manual Review' },
  { value: 'UNIDENTIFIED', label: 'Unidentified' },
];

export function ViolationFilters({
  onFilterChange,
  showPlateStatus = false,
}: ViolationFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({});
  const [date, setDate] = useState<Date | undefined>();
  const [isOpen, setIsOpen] = useState(false);

  const updateFilters = (key: keyof FilterValues, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value };
    if (!value) {
      delete newFilters[key];
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      updateFilters('date', format(selectedDate, 'yyyy-MM-dd'));
    } else {
      updateFilters('date', undefined);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setDate(undefined);
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {Object.keys(filters).length} active
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Date Filter */}
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  handleDateSelect(d);
                  setIsOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Violation Type Filter */}
        <div className="space-y-2">
          <Label>Violation Type</Label>
          <Select
            value={filters.violationType}
            onValueChange={(value) => updateFilters('violationType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {violationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment Status Filter */}
        <div className="space-y-2">
          <Label>Payment Status</Label>
          <Select
            value={filters.paymentStatus}
            onValueChange={(value) => updateFilters('paymentStatus', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {paymentStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Plate Status Filter (Admin only) */}
        {showPlateStatus && (
          <div className="space-y-2">
            <Label>Plate Status</Label>
            <Select
              value={filters.plateStatus}
              onValueChange={(value) => updateFilters('plateStatus', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {plateStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
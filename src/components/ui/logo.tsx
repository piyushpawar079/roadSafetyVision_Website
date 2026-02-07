import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { 
      logo: 32, 
      text: 'text-lg',
      tagline: 'text-[10px]'
    },
    md: { 
      logo: 48, 
      text: 'text-xl',
      tagline: 'text-xs'
    },
    lg: { 
      logo: 64, 
      text: 'text-2xl',
      tagline: 'text-sm'
    },
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative flex-shrink-0">
        <Image
          src="/logo.svg"
          alt="RoadSafetyVision Logo"
          width={sizes[size].logo}
          height={sizes[size].logo}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              'font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight',
              sizes[size].text
            )}
          >
            RoadSafetyVision
          </span>
          {size !== 'sm' && (
            <span className={cn('text-muted-foreground -mt-0.5', sizes[size].tagline)}>
              Violation Management System
            </span>
          )}
        </div>
      )}
    </div>
  );
}
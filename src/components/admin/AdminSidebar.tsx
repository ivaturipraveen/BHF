'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import {
  Home,
  Calendar,
  BookOpen,
  Folder,
  Users,
  Newspaper,
  FileText,
  Layout,
  Building,
  FileBarChart,
  Lock,
  UserCheck,
  HeartHandshake,
  ImagePlus,
  MessageSquare,
  Baby,
  UserCircle,
  Mail,
} from 'lucide-react';
import type { AdminRole } from '@/types/db';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
  superAdminOnly?: boolean;
}

const SECTIONS: NavSection[] = [
  {
    title: 'Content',
    items: [
      { label: 'Dashboard', href: '/admin', icon: Home },
      { label: 'Events', href: '/admin/events', icon: Calendar },
      { label: 'Programs', href: '/admin/programs', icon: BookOpen },
      { label: 'Gallery categories', href: '/admin/gallery-categories', icon: Folder },
      { label: 'Leadership', href: '/admin/leadership', icon: Users },
      { label: 'Blog posts', href: '/admin/blog-posts', icon: Newspaper },
      { label: 'Pages', href: '/admin/pages', icon: FileText },
      { label: 'Homepage config', href: '/admin/homepage', icon: Layout },
      { label: 'Sponsors', href: '/admin/sponsors', icon: Building },
      { label: 'Annual reports', href: '/admin/annual-reports', icon: FileBarChart },
      { label: 'Exclusive content', href: '/admin/exclusive-content', icon: Lock },
    ],
  },
  {
    title: 'Community',
    items: [
      { label: 'Members', href: '/admin/members', icon: UserCheck },
      { label: 'Donations', href: '/admin/donations', icon: HeartHandshake },
      { label: 'Photo submissions', href: '/admin/photo-submissions', icon: ImagePlus },
      { label: 'Contact inquiries', href: '/admin/contact-inquiries', icon: MessageSquare },
      { label: 'Youth enrollments', href: '/admin/youth-registrations', icon: Baby },
    ],
  },
  {
    title: 'System',
    superAdminOnly: true,
    items: [
      { label: 'My profile', href: '/admin/profile', icon: UserCircle },
      { label: 'Email log', href: '/admin/email-log', icon: Mail },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ role }: { role: AdminRole }) {
  const pathname = usePathname() ?? '/admin';
  return (
    <aside
      aria-label="Admin navigation"
      className="hidden md:block w-64 shrink-0 border-r border-gray-200 bg-white min-h-[calc(100vh-3.5rem)] sticky top-14"
    >
      <nav aria-label="Admin sidebar" className="p-4 space-y-6">
        {SECTIONS.filter((s) => !s.superAdminOnly || role === 'super_admin').map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-warm-gray">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-indigo hover:bg-cream/60 min-h-[44px]',
                        active && 'bg-saffron/10 font-medium',
                      )}
                    >
                      <Icon className={cn('h-4 w-4', active ? 'text-saffron' : 'text-warm-gray')} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

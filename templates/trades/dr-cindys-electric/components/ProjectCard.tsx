'use client';

import { useState, useRef, useEffect } from 'react';
import { Trash2, ChevronDown, Users } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

type ProjectStatus = 'Active' | 'Inactive' | 'Archived';

interface Project {
  id: string;
  name: string;
  description?: string;
  status?: ProjectStatus;
  updatedAt: string | Date;
  techStack?: string[];
  _count?: {
    generations: number;
  };
  // Team project fields
  companyId?: number | null;
  companyName?: string;
  isOwner?: boolean;
  ownerName?: string;
}

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string, name: string) => void;
  onStatusChange?: (id: string, status: ProjectStatus) => void;
  onShareChange?: (id: string, companyId: number | null) => void;
  userCompanyId?: number | null;
}

const statusColors: Record<ProjectStatus, { bg: string; text: string; border: string }> = {
  Active: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  Inactive: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  Archived: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20' },
};

// Tech stack icon and name mapping - using local SVG files
const techIcons: Record<string, { icon: string; name: string; invert?: boolean }> = {
  // Frontend
  'react-ts': { icon: '/tech-icons/react-original.svg', name: 'React + TypeScript' },
  'nextjs': { icon: '/tech-icons/nextjs-original.svg', name: 'Next.js', invert: true },
  'vue3': { icon: '/tech-icons/vuejs-original.svg', name: 'Vue 3' },
  'nuxt3': { icon: '/tech-icons/vuejs-original.svg', name: 'Nuxt 3' },
  'angular': { icon: '/tech-icons/angularjs-original.svg', name: 'Angular' },
  'svelte': { icon: '/tech-icons/svelte-original.svg', name: 'Svelte' },
  'sveltekit': { icon: '/tech-icons/svelte-original.svg', name: 'SvelteKit' },
  'solidjs': { icon: '/tech-icons/react-original.svg', name: 'Solid.js' },
  'remix': { icon: '/tech-icons/react-original.svg', name: 'Remix' },
  'qwik': { icon: '/tech-icons/typescript-original.svg', name: 'Qwik' },
  'astro': { icon: '/tech-icons/typescript-original.svg', name: 'Astro' },
  'blazor-wasm': { icon: '/tech-icons/dotnetcore-original.svg', name: 'Blazor WebAssembly' },
  // Backend
  'node-express': { icon: '/tech-icons/nodejs-original.svg', name: 'Node.js + Express' },
  'nestjs': { icon: '/tech-icons/nestjs-original.svg', name: 'NestJS' },
  'java-spring': { icon: '/tech-icons/spring-original.svg', name: 'Java + Spring Boot' },
  'python-fastapi': { icon: '/tech-icons/fastapi-original.svg', name: 'Python + FastAPI' },
  'python-django': { icon: '/tech-icons/django-plain.svg', name: 'Django', invert: true },
  'python-flask': { icon: '/tech-icons/flask-original.svg', name: 'Flask', invert: true },
  'go-gin': { icon: '/tech-icons/go-original-wordmark.svg', name: 'Go + Gin' },
  'go-fiber': { icon: '/tech-icons/go-original-wordmark.svg', name: 'Go + Fiber' },
  'dotnet-webapi': { icon: '/tech-icons/dotnetcore-original.svg', name: 'ASP.NET Core' },
  'dotnet-mvc': { icon: '/tech-icons/dotnetcore-original.svg', name: 'ASP.NET MVC' },
  'ruby-rails': { icon: '/tech-icons/rails-original-wordmark.svg', name: 'Ruby on Rails' },
  'php-laravel': { icon: '/tech-icons/laravel-original.svg', name: 'Laravel' },
  'rust-actix': { icon: '/tech-icons/rust-original.svg', name: 'Rust + Actix', invert: true },
  // Databases
  'postgresql': { icon: '/tech-icons/postgresql-original.svg', name: 'PostgreSQL' },
  'mysql': { icon: '/tech-icons/mysql-original.svg', name: 'MySQL' },
  'sqlite': { icon: '/tech-icons/sqlite-original.svg', name: 'SQLite' },
  'sqlserver': { icon: '/tech-icons/dotnetcore-original.svg', name: 'SQL Server' },
  'mariadb': { icon: '/tech-icons/mysql-original.svg', name: 'MariaDB' },
  'cockroachdb': { icon: '/tech-icons/postgresql-original.svg', name: 'CockroachDB' },
  'planetscale': { icon: '/tech-icons/mysql-original.svg', name: 'PlanetScale' },
  'supabase': { icon: '/tech-icons/postgresql-original.svg', name: 'Supabase' },
  'mongodb': { icon: '/tech-icons/mongodb-original.svg', name: 'MongoDB' },
  'redis': { icon: '/tech-icons/redis-original.svg', name: 'Redis' },
  'dynamodb': { icon: '/tech-icons/mongodb-original.svg', name: 'DynamoDB' },
  'elasticsearch': { icon: '/tech-icons/elasticsearch-original.svg', name: 'Elasticsearch' },
  'firebase-firestore': { icon: '/tech-icons/firebase-plain.svg', name: 'Firebase Firestore' },
  'neo4j': { icon: '/tech-icons/neo4j-original.svg', name: 'Neo4j' },
  'neptune': { icon: '/tech-icons/neo4j-original.svg', name: 'Amazon Neptune' },
  // Services
  'auth': { icon: '/tech-icons/typescript-original.svg', name: 'Authentication' },
  'api-docs': { icon: '/tech-icons/typescript-original.svg', name: 'API Docs' },
  'search': { icon: '/tech-icons/elasticsearch-original.svg', name: 'Search Engine' },
  'file-storage': { icon: '/tech-icons/firebase-plain.svg', name: 'File Storage' },
  'email': { icon: '/tech-icons/typescript-original.svg', name: 'Email Service' },
  'realtime': { icon: '/tech-icons/redis-original.svg', name: 'Real-time' },
  'redis-cache': { icon: '/tech-icons/redis-original.svg', name: 'Redis Cache' },
  'cloudflare-cdn': { icon: '/tech-icons/typescript-original.svg', name: 'CloudFlare CDN' },
  'memcached': { icon: '/tech-icons/redis-original.svg', name: 'Memcached' },
};

// Stack Icons component with tooltips
function StackIcons({ techStack }: { techStack?: string[] }) {
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);
  
  // Use provided techStack or fallback to default
  const stackToShow = techStack?.length 
    ? techStack.slice(0, 4) 
    : ['nextjs', 'node-express', 'postgresql'];
  
  return (
    <div className="flex gap-2">
      {stackToShow.map((techId) => {
        const tech = techIcons[techId] || { icon: '/tech-icons/typescript-original.svg', name: techId };
        return (
          <div 
            key={techId}
            className="relative"
            onMouseEnter={() => setHoveredTech(techId)}
            onMouseLeave={() => setHoveredTech(null)}
          >
            <div 
              className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center p-1.5 shadow-sm hover:border-blue-500/50 hover:bg-zinc-700 transition-colors cursor-default"
            >
              <img 
                src={tech.icon} 
                alt={tech.name}
                className={cn("w-full h-full object-contain", tech.invert && "invert")}
              />
            </div>
            {/* Tooltip */}
            {hoveredTech === techId && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-md text-xs text-white whitespace-nowrap shadow-lg z-50">
                {tech.name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-zinc-700" />
              </div>
            )}
          </div>
        );
      })}
      {techStack && techStack.length > 4 && (
        <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs text-zinc-400 font-medium">
          +{techStack.length - 4}
        </div>
      )}
    </div>
  );
}

export function ProjectCard({ project, onDelete, onStatusChange, onShareChange, userCompanyId }: ProjectCardProps) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentStatus = (project.status as ProjectStatus) || 'Active';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowStatusDropdown(!showStatusDropdown);
  };

  const handleStatusSelect = (status: ProjectStatus) => {
    setShowStatusDropdown(false);
    if (status !== currentStatus && onStatusChange) {
      onStatusChange(project.id, status);
    }
  };

  const colors = statusColors[currentStatus];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col h-full hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group relative">
      {/* Top Row: Icons + Status */}
      <div className="flex justify-between items-start mb-6">
        <StackIcons techStack={project.techStack} />
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleStatusClick}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold border shadow-sm flex items-center gap-1 transition-all hover:ring-2 hover:ring-offset-1 hover:ring-offset-zinc-900",
              colors.bg,
              colors.text,
              colors.border,
              `hover:ring-${currentStatus === 'Active' ? 'green' : currentStatus === 'Inactive' ? 'yellow' : 'zinc'}-500/30`
            )}
          >
            {currentStatus}
            <ChevronDown className="w-3 h-3" />
          </button>
          
          {showStatusDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden min-w-[120px]">
              {(['Active', 'Inactive', 'Archived'] as ProjectStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleStatusSelect(status);
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2",
                    status === currentStatus 
                      ? "bg-blue-500/20 text-blue-400" 
                      : "text-zinc-300 hover:bg-zinc-700"
                  )}
                >
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    status === 'Active' && "bg-green-400",
                    status === 'Inactive' && "bg-yellow-400",
                    status === 'Archived' && "bg-zinc-400"
                  )} />
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <Link href={`/builder/${project.id}`} className="flex-1 mb-6 cursor-pointer">
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
          {project.name}
        </h3>
        <div className="text-zinc-400 text-sm leading-relaxed line-clamp-3 prose prose-sm prose-invert prose-p:m-0 prose-headings:m-0 prose-ul:m-0 prose-ol:m-0 max-w-none">
          <ReactMarkdown>
            {project.description || "No description provided. Click to add details about this project's goals and requirements."}
          </ReactMarkdown>
        </div>
      </Link>

      {/* Meta + Actions */}
      <div className="mt-auto">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-6 font-medium">
          <div className="flex items-center gap-2">
            {project.companyId ? (
              <>
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-blue-400">{project.companyName || 'Team'}</span>
                {!project.isOwner && project.ownerName && (
                  <span className="text-zinc-500">• by {project.ownerName}</span>
                )}
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Personal</span>
              </>
            )}
          </div>
          <span>Updated {new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        <div className="flex gap-3 relative">
          <Link 
            href={`/builder/${project.id}`}
            className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl h-12 shadow-lg shadow-blue-500/20 transition-all"
          >
            View Details
          </Link>
          
          {/* Share with Team toggle - only for owners with a company */}
          {(project.isOwner === undefined || project.isOwner) && userCompanyId && onShareChange && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                // Toggle: if currently shared, unshare; if personal, share
                const newCompanyId = project.companyId ? null : userCompanyId;
                onShareChange(project.id, newCompanyId);
              }}
              className={cn(
                "w-12 h-12 flex items-center justify-center rounded-xl border transition-colors",
                project.companyId
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-blue-400 hover:border-blue-500/30"
              )}
              title={project.companyId ? "Unshare from team" : "Share with team"}
            >
              <Users className="w-5 h-5" />
            </button>
          )}

          {/* Only show delete for owner or if isOwner is undefined (backwards compat) */}
          {(project.isOwner === undefined || project.isOwner) && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project.id, project.name);
              }}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-800 text-red-500 border border-zinc-700 hover:border-red-500/50 hover:bg-red-500/10 transition-colors group/delete"
              title="Delete Project"
            >
              <Trash2 className="w-5 h-5 group-hover/delete:scale-110 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

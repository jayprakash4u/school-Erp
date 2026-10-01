"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { Plus, Search, Filter, Download, ArrowUpRight, GraduationCap, Users, DollarSign, School } from "lucide-react";

function DesignSystemOverview() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [search, setSearch] = React.useState("");

  const sampleSchools = [
    { id: "SCH-001", name: "Springdale International Academy", city: "New York", students: 1240, status: "active" as const },
    { id: "SCH-002", name: "St. Xavier Higher Secondary", city: "Chicago", students: 890, status: "active" as const },
    { id: "SCH-003", name: "Oakridge Public School", city: "Austin", students: 640, status: "pending" as const },
    { id: "SCH-004", name: "Cambridge Central High", city: "Seattle", students: 1100, status: "suspended" as const },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="School ERP Platform Architecture"
        description="Design system tokens, enterprise UI foundations, and scalable component architecture initialized."
        breadcrumbs={[
          { title: "Dashboard", href: "/" },
          { title: "Design System Architecture" },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast({ type: "info", title: "Export Started", message: "Preparing ERP architectural report..." })}
            >
              <Download className="h-4 w-4" />
              Export Spec
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => toast({ type: "success", title: "Design System Active", message: "All semantic tokens loaded successfully." })}
            >
              <Plus className="h-4 w-4" />
              Quick Action
            </Button>
          </div>
        }
      />

      <Alert variant="info" title="ERP Design System v1 Active">
        Semantic color tokens, Inter typography scale, 4px spacing unit, 6px/8px radius scale, and standard ERP component templates are active across the web application.
      </Alert>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Active Schools
              </span>
              <div className="p-2 rounded-md bg-[var(--red-50)] text-[var(--brand-primary)]">
                <School className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[var(--text-primary)]">48</span>
              <span className="text-xs font-medium text-[var(--success-700)] flex items-center gap-0.5">
                +12% <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Total Students
              </span>
              <div className="p-2 rounded-md bg-[var(--yellow-100)] text-[var(--yellow-800)]">
                <GraduationCap className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[var(--text-primary)]">34,820</span>
              <span className="text-xs font-medium text-[var(--success-700)] flex items-center gap-0.5">
                +8.4% <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Teachers & Staff
              </span>
              <div className="p-2 rounded-md bg-[var(--info-100)] text-[var(--info-700)]">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[var(--text-primary)]">2,150</span>
              <span className="text-xs font-medium text-[var(--text-tertiary)]">Across 48 campuses</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Fee Collection Rate
              </span>
              <div className="p-2 rounded-md bg-[var(--success-100)] text-[var(--success-700)]">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[var(--text-primary)]">94.2%</span>
              <span className="text-xs font-medium text-[var(--success-700)]">Target 90%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Standard ERP Table Sample */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Registered Schools Directory</CardTitle>
            <CardDescription>Multi-tenant school branches under governance.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-64">
              <Input
                placeholder="Filter schools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="h-8 text-xs"
              />
            </div>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-3.5 w-3.5" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <div className="p-0">
          <Table className="border-0 rounded-none">
            <TableHeader>
              <TableRow>
                <TableHead>School Code</TableHead>
                <TableHead>School Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Enrolled Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleSchools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-mono text-xs text-[var(--text-secondary)]">{school.id}</TableCell>
                  <TableCell className="font-semibold text-[var(--text-primary)]">{school.name}</TableCell>
                  <TableCell className="text-[var(--text-secondary)]">{school.city}</TableCell>
                  <TableCell>{school.students.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={school.status} dot>
                      {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            currentPage={currentPage}
            totalPages={5}
            totalCount={48}
            pageSize={10}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>
    </div>
  );
}

export default function Home() {
  return (
    <AppShell>
      <DesignSystemOverview />
    </AppShell>
  );
}

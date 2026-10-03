# Student Service & Feature Restriction Architecture Specification
**Enterprise School ERP — Student Portal Granular Disablement & Workflow Guide**

---

## 1. Executive Summary & Vision

In enterprise School ERP environments, restricting a student’s account is rarely an all-or-nothing action. Instead, administrative departments frequently need to apply **targeted service holds** (e.g., Accounts placing a hold on Report Cards due to unpaid fees, Library restricting book renewals for overdue books, or Transport suspending bus passes while keeping classroom attendance active).

### Core Principle
1. **Admin Panel Control**: Administrators can selectively choose which specific services to restrict for an individual student (Billing, Exams, Library, Transport, Hostel, or Full Portal).
2. **Student Portal Visibility**: The student’s navigation options remain visible in their portal to maintain layout predictability.
3. **Restricted Access Resolution**: When a student clicks or navigates to a restricted page/service, the page renders a standardized, professional **Department Hold Screen**:
   > *"Access to [Service Name] is Temporarily On Hold. Please visit the [Concerned Department Name] to resolve this."*
4. **Self-Service Re-Check**: The student can click **"Try Again / Recheck Status"** once they have resolved their hold with the concerned department.

---

## 2. Granular Service Registry & Mapping

| Service Key | Service Name | Managing Department | Department (Nepali) | Student Portal Route | Resolution / Contact Instructions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `BILLING` | Billing & Fee Payment | Accounts / Finance Dept | लेखा तथा आर्थिक शाखा | `/student/fees`, `/student/invoices` | Visit Accounts Dept (Room 102) for fee dues clearance. |
| `EXAMINATION` | Examinations & Report Cards | Examination Department | परीक्षा नियन्त्रण शाखा | `/student/exams`, `/student/results` | Visit Examination Controller Office for admit card & exam clearance. |
| `LIBRARY` | Library Circulation | Central Library Office | केन्द्रीय पुस्तकालय | `/student/library`, `/student/books` | Visit Central Library for overdue book return or fine clearance. |
| `TRANSPORT` | Transport / Bus Service | Transport & Logistics Office | यातायात तथा सवारी शाखा | `/student/transport`, `/student/bus-tracking` | Contact Transport Coordinator (Gate 2) for route & pass renewal. |
| `HOSTEL` | Hostel & Mess Facility | Hostel Administration & Warden | छात्रावास प्रशासन तथा वार्डेन | `/student/hostel`, `/student/mess` | Report to Hostel Chief Warden Office (Block A). |
| `PORTAL_LOGIN`| Full Student Portal Login | Main Admin & Principal Office | मुख्य प्रशासन तथा प्रधानाध्यापक | `/student/dashboard` | Visit School Administration Desk for account reinstatement. |

---

## 3. Data Schema & Contracts

### 3.1 Backend Database Schema (Prisma ORM)

```prisma
enum ServiceRestrictionType {
  BILLING
  EXAMINATION
  LIBRARY
  TRANSPORT
  HOSTEL
  PORTAL_LOGIN
}

model StudentServiceRestriction {
  id              String                  @id @default(uuid())
  studentId       String
  student         Student                 @relation(fields: [studentId], references: [id], onDelete: Cascade)
  serviceType     ServiceRestrictionType
  reason          String?                 // e.g. "Unpaid 2nd term fees"
  restrictedById  String
  restrictedBy    User                    @relation("RestrictedByUser", fields: [restrictedById], references: [id])
  createdAt       DateTime                @default(now())
  resolvedAt      DateTime?
  resolvedById    String?
  resolvedBy      User?                   @relation("ResolvedByUser", fields: [resolvedById], references: [id])
  isActive        Boolean                 @default(true)

  @@unique([studentId, serviceType, isActive])
  @@index([studentId, isActive])
}
```

### 3.2 Frontend TypeScript Interface

```typescript
export interface StudentRecord {
  id: string;
  fullName: string;
  rollNumber: string;
  admissionNumber: string;
  class: string;
  batch: string;
  status: "Active" | "Inactive" | "Transferred";
  disabledServices?: Array<"BILLING" | "EXAMINATION" | "LIBRARY" | "TRANSPORT" | "HOSTEL" | "PORTAL_LOGIN">;
  disabledReason?: string;
  // ...other student profile fields
}
```

---

## 4. Student Portal Implementation Blueprint

### 4.1 Reusable Guard Component
Any page or route in the future Student Portal should wrap its core content with the standard `ServiceRestrictionGuard`:

```tsx
import { ServiceRestrictionGuard } from "@/components/common/service-restriction-guard";
import { useStudentServices } from "@/hooks/use-student-services";

export default function StudentFeePaymentPage() {
  const { isServiceRestricted, getRestrictionReason } = useStudentServices();
  const isRestricted = isServiceRestricted("BILLING");
  const reason = getRestrictionReason("BILLING");

  return (
    <ServiceRestrictionGuard
      serviceId="BILLING"
      isRestricted={isRestricted}
      customReason={reason}
      onRetry={() => window.location.reload()}
    >
      {/* Actual Fee Payment & Receipt Download UI */}
      <FeePaymentPortal />
    </ServiceRestrictionGuard>
  );
}
```

### 4.2 Middleware / Server-Side Guard (Next.js Route Handlers)

```typescript
// Example API Route Guard
export async function POST(req: NextRequest) {
  const session = await getStudentSession(req);
  
  const hasRestriction = await prisma.studentServiceRestriction.findFirst({
    where: {
      studentId: session.studentId,
      serviceType: "EXAMINATION",
      isActive: true,
    },
  });

  if (hasRestriction) {
    return NextResponse.json(
      {
        error: "SERVICE_RESTRICTED",
        message: "Examination access is restricted. Please visit the Examination Department.",
        department: "Examination Department",
        reason: hasRestriction.reason,
      },
      { status: 403 }
    );
  }

  // Proceed with exam report card generation...
}
```

---

## 5. Summary of Implemented Features in this Step

1. **Granular Disablement Modal** (`apps/web/src/components/students/student-service-disable-modal.tsx`):
   - Opens when clicking the `UserX` action button on any student in the admin directory.
   - Allows multi-select of services (Billing, Exam, Library, Bus, Hostel, Full Portal).
   - Allows entering custom reason / remarks.
2. **Student Directory Integration** (`apps/web/src/app/students/page.tsx`):
   - Displays restricted service badges on inactive/restricted student rows.
   - Clicking `UserX` opens the granular selector.
3. **Disabled Students Page Integration** (`apps/web/src/app/students/disabled/page.tsx`):
   - Displays granular restriction badges.
   - Allows targeted re-enabling / un-disabling.
4. **Service Restriction Guard** (`apps/web/src/components/common/service-restriction-guard.tsx`):
   - Production-ready "Visit Department to Resolve" hold screen with retry functionality.

"use client";

import { MemberListSkeleton } from "../../_components/skeleton-components";

export default function MembersLoading() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <MemberListSkeleton />
    </div>
  );
}

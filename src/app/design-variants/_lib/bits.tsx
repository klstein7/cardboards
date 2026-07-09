import { cn } from "~/lib/utils";

import { avatarStyle, type MockPerson } from "./mock-data";

export function MemberAvatar({
  person,
  className,
}: {
  person: MockPerson;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-medium",
        className,
      )}
      style={avatarStyle(person)}
      title={person.name}
    >
      {person.initials}
    </span>
  );
}

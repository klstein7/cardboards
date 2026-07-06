import { type ActivityItem } from "./types";
import { formatEntityType, parseCardMoveChanges } from "./utils";

interface CardMoveProps {
  item: ActivityItem;
}

function Emphasis({ children }: { children: React.ReactNode }) {
  return <span className="font-medium text-foreground">{children}</span>;
}

export function CardMove({ item }: CardMoveProps) {
  const parsedChanges = parseCardMoveChanges(item.changes);
  if (!parsedChanges) {
    return (
      <span className="text-muted-foreground">
        moved a {formatEntityType(item.entityType)}
      </span>
    );
  }

  const cardTitle = parsedChanges.cardTitle && (
    <>
      {" "}
      <Emphasis>&ldquo;{parsedChanges.cardTitle}&rdquo;</Emphasis>
    </>
  );

  const isSameColumn =
    parsedChanges.sameName === true ||
    (parsedChanges.from?.columnName !== undefined &&
      parsedChanges.from.columnName === parsedChanges.to?.columnName);

  if (isSameColumn) {
    return (
      <span className="text-muted-foreground">
        moved a card{cardTitle} within{" "}
        <Emphasis>{parsedChanges.from?.columnName ?? "a column"}</Emphasis>
      </span>
    );
  }

  if (parsedChanges.from?.columnName && parsedChanges.to?.columnName) {
    return (
      <span className="text-muted-foreground">
        moved a card{cardTitle} from{" "}
        <Emphasis>{parsedChanges.from.columnName}</Emphasis> to{" "}
        <Emphasis>{parsedChanges.to.columnName}</Emphasis>
      </span>
    );
  }

  return (
    <span className="text-muted-foreground">
      moved a card{cardTitle}
      {parsedChanges.from &&
      parsedChanges.to &&
      parsedChanges.from.columnId !== parsedChanges.to.columnId
        ? " to a different column"
        : " within the same column"}
    </span>
  );
}

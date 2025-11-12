import { twJoin } from "tailwind-merge";

const VARIANT_STYLES = {
  size: {
    md: "text-md",
    sm: "text-sm",
  },
  status: {
    pending: "bg-black-200 text-black-600",
    pass: "bg-green-200 text-green-500",
    nonpass: "bg-red-200 text-red-500",
  },
};

interface StageTagProps {
  name: string;
  status?: "pending" | "pass" | "nonpass";
  size?: "md" | "sm";
}

export default function StageTag({
  name,
  status = "pending",
  size = "md",
}: StageTagProps) {
  const tagClassNames = twJoin(
    "w-fit py-1 px-3 whitespace-nowrap rounded-2xl",
    size && VARIANT_STYLES.size[size],
    status && VARIANT_STYLES.status[status]
  );
  return <p className={tagClassNames}>{name}</p>;
}

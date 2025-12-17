import { useState } from "react";
import { twJoin } from "tailwind-merge";

import axiosInstance from "@/apis/axiosInstance";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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

const STATUSES = ["pending", "pass", "nonpass"] as const;
type Status = (typeof STATUSES)[number];
const isStatus = (v: unknown): v is Status =>
  typeof v === "string" && (STATUSES as readonly string[]).includes(v);

interface StageTagProps {
  name: string;
  status?: Status;
  size?: "md" | "sm";
  jobId?: string;
  stageId?: string;
}

export default function StageTag({
  name,
  status = "pending",
  size = "md",
  jobId,
  stageId,
}: StageTagProps) {
  const [open, setOpen] = useState(false);
  const [stageStatus, setStageStatus] = useState(status);

  const handleChange = (value: string) => {
    if (isStatus(value)) {
      setStageStatus(value);
      handleStatusUpdate(value);
    }
  };

  const tagClassNames = twJoin(
    "w-fit py-1 px-3 whitespace-nowrap rounded-2xl cursor-pointer",
    size && VARIANT_STYLES.size[size],
    status && VARIANT_STYLES.status[stageStatus]
  );

  const handleStatusUpdate = async (status: string) => {
    try {
      await axiosInstance.patch(`/appliedJob/${jobId}/stages/${stageId}`, {
        status: status,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("수정 실패:", error.response?.data || error.message);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <p className={tagClassNames}>{name}</p>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto overflow-hidden p-4 flex flex-col gap-2"
        >
          <p className="text-sm text-white-700">전형 결과</p>
          <ToggleGroup
            type="single"
            value={stageStatus}
            variant="outline"
            onValueChange={handleChange}
          >
            <ToggleGroupItem
              className="border rounded-lg px-2 py-1 border-white-200 shadow-none font-normal"
              value="pending"
            >
              진행 전
            </ToggleGroupItem>
            <ToggleGroupItem
              className="border rounded-lg px-2 py-1 border-white-200 shadow-none font-normal"
              value="pass"
            >
              합격
            </ToggleGroupItem>
            <ToggleGroupItem
              className="border rounded-lg px-2 py-1 border-white-200 shadow-none font-normal"
              value="nonpass"
            >
              불합격
            </ToggleGroupItem>
          </ToggleGroup>
        </PopoverContent>
      </Popover>
    </div>
  );
}

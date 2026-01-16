import { useNavigate } from "react-router-dom";

import StageTag from "@/components/StageTag";

const PROGRESS_LABEL_MAP = {
  pending: "예정",
  "in progress": "진행",
  completed: "종료",
} as const;

function getProgressLabel(
  progress: "pending" | "in progress" | "completed" | undefined
) {
  if (!progress) return "";
  return PROGRESS_LABEL_MAP[progress];
}

interface Stage {
  order: number;
  name: string;
  status: "pending" | "pass" | "nonpass";
  _id: string;
}

interface ApplicationTableRowProps {
  index?: number;
  number?: number;
  companyName: string;
  position: string;
  appliedDate?: string;
  stages: Stage[];
  progress?: "pending" | "in progress" | "completed";
  id: string;
}

export default function ApplicationTableRow({
  index,
  companyName,
  position,
  progress,
  stages,
  id,
}: ApplicationTableRowProps) {
  const navigate = useNavigate();
  const navigateToDetail = (id: string) => {
    navigate(`/${id}`);
  };

  return (
    <tr>
      <td>{index}</td>
      <td
        className="underline cursor-pointer underline-offset-4"
        onClick={() => navigateToDetail(id)}
      >
        {companyName}
      </td>
      <td>{position}</td>
      <td>{getProgressLabel(progress)}</td>
      <td>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-thin scrollbar-track-transparent">
          {stages.map((stage) => (
            <StageTag
              jobId={id}
              name={stage.name}
              size="sm"
              stageId={stage._id}
              status={stage.status}
            />
          ))}
        </div>
      </td>
    </tr>
  );
}

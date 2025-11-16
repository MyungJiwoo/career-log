import StageTag from "@/components/StageTag";
import { useNavigate } from "react-router-dom";

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
        onClick={() => navigateToDetail(id)}
        className="underline cursor-pointer underline-offset-4"
      >
        {companyName}
      </td>
      <td>{position}</td>
      <td>{getProgressLabel(progress)}</td>
      <td>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-thin scrollbar-track-transparent">
          {stages.map((stage) => (
            <StageTag
              name={stage.name}
              size="sm"
              status={stage.status}
              stageId={stage._id}
              jobId={id}
            />
          ))}
        </div>
      </td>
    </tr>
  );
}

import StageTag from "@/components/StageTag";
import { useNavigate } from "react-router-dom";

interface Stage {
  order: number;
  name: string;
  status: "pending" | "pass" | "nonpass";
  _id: string;
}

interface ApplicationTableRowProps {
  number: number;
  companyName: string;
  position: string;
  appliedDate: string;
  stages: Stage[];
  progress?: "pending" | "in progress" | "completed";
}

export default function ApplicationTableRow({
  number,
  companyName,
  position,
  appliedDate,
  stages,
}: ApplicationTableRowProps) {
  const navigate = useNavigate();
  const navigateToDetail = (number: number) => {
    navigate(`/${number}`);
  };

  return (
    <tr>
      <td>{number}</td>
      <td
        onClick={() => navigateToDetail(number)}
        className="underline cursor-pointer underline-offset-4"
      >
        {companyName}
      </td>
      <td>{position}</td>
      <td>{appliedDate.slice(0, 10)}</td>
      <td>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-thin scrollbar-track-transparent">
          {stages.map((stage) => (
            <StageTag
              name={stage.name}
              size="sm"
              status={stage.status}
              stageId={stage._id}
              jobId={String(number)}
            />
          ))}
        </div>
      </td>
    </tr>
  );
}

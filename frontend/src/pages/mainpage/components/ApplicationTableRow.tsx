import { useNavigate } from "react-router-dom";

interface Stage {
  order: number;
  name: string;
  status: "pending" | "pass" | "nonpass";
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
    <tr onClick={() => navigateToDetail(number)} className="cursor-pointer">
      <td>{number}</td>
      <td>{companyName}</td>
      <td>{position}</td>
      <td>{appliedDate.slice(0, 10)}</td>
      <td>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-thin scrollbar-track-transparent">
          {stages.map((stage) => (
            <p className="text-sm w-fit py-1 px-3 rounded-2xl bg-black-200 text-black-600 whitespace-nowrap">
              {stage.name}
            </p>
          ))}
        </div>
      </td>
    </tr>
  );
}

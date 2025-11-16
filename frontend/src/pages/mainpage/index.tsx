import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import ApplicationStatusWidget from "./components/ApplicationStatusWidget";
import ApplicationTableRow from "./components/ApplicationTableRow";
import Button from "@/components/Button";

interface Stage {
  order: number;
  name: string;
  status: "pending" | "pass" | "nonpass";
  _id: string;
}

interface AppliedJob {
  number: number;
  companyName: string;
  position: string;
  appliedDate: string;
  stages: Stage[];
  contents: string;
  progress: "pending" | "in progress" | "completed";
  createdAt: string;
  updatedAt: string;
  _id: string;
}

const MainPage = () => {
  const navigate = useNavigate();
  const navigateToCreate = () => {
    navigate("/new");
  };

  const [jobs, setJobs] = useState<AppliedJob[] | undefined>();

  const fetchAppliedJobs = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/appliedJob");
      setJobs(response.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("불러오기 실패:", error.response?.data || error.message);
      alert("불러오기 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    fetchAppliedJobs();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-black-900">지원 현황 리포트</h1>

      {/* 지원 현황 통계 위젯 */}
      <div className="flex justify-between">
        <ApplicationStatusWidget title="총 지원 횟수" stats="70개" />
        <ApplicationStatusWidget title="총 합격률" stats="70%" />
        <ApplicationStatusWidget
          title="서류 합격률"
          stats="30%"
          total={100}
          totalUnit="지원"
        />
        <ApplicationStatusWidget
          title="코딩 테스트 합격률"
          stats="30%"
          total={100}
          totalUnit="진행"
        />
        <ApplicationStatusWidget
          title="과제 테스트 합격률"
          stats="30%"
          total={100}
          totalUnit="진행"
        />
        <ApplicationStatusWidget
          title="면접 합격률"
          stats="30%"
          total={100}
          totalUnit="진행"
        />
      </div>

      {/* 지원 현황 추가 버튼 */}
      <div className="flex justify-between">
        <div className="flex gap-2 justify-start">
          <Button
            onClick={() => {}}
            size="sm"
            className="px-3"
            variant="secondary"
          >
            진행 예정
          </Button>
          <Button onClick={() => {}} size="sm" className="px-3 bg-black-600">
            진행 중
          </Button>
          <Button
            onClick={() => {}}
            size="sm"
            className="px-3"
            variant="secondary"
          >
            진행 종료
          </Button>
        </div>
        <Button onClick={navigateToCreate} size="sm" className="px-3">
          추가하기
        </Button>
      </div>

      {/* 지원 현황 표 */}
      <table className="w-full table-fixed border-separate bg-white-100 rounded-2xl p-4 border-spacing-x-4 border-spacing-y-3">
        <thead className="sticky top-0 z-10 text-black-600">
          <tr className="text-left">
            <th scope="col" className="w-[5%] text-sm font-semibold">
              번호
            </th>
            <th scope="col" className="w-[20%] text-sm font-semibold">
              기업명
            </th>
            <th scope="col" className="w-[12%] text-sm font-semibold">
              직무
            </th>
            <th scope="col" className="w-[13%] text-sm font-semibold">
              지원일
            </th>
            <th scope="col" className="w-[50%] text-sm font-semibold">
              채용 절차
            </th>
          </tr>
        </thead>

        <tbody className="text-black-900">
          {jobs?.map((job) => (
            <ApplicationTableRow
              id={job._id}
              number={job.number}
              companyName={job.companyName}
              position={job.position}
              appliedDate={job.appliedDate}
              stages={job.stages}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MainPage;

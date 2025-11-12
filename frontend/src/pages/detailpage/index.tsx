import Button from "@/components/Button";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Stage {
  order: number;
  name: string;
  status: "pending" | "pass" | "nonpass";
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
}

const DetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<AppliedJob | undefined>();
  const editor = useCreateBlockNote();

  const fetchDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/appliedJob/${id}`
      );
      setJob(response.data);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("불러오기 실패:", error.response?.data || error.message);
      alert("불러오기 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  useEffect(() => {
    if (!job?.contents) return;

    try {
      const parsedBlocks = JSON.parse(job.contents);
      editor.replaceBlocks(editor.document, parsedBlocks);
    } catch (error) {
      console.error("BlockNote parsing failed:", error);
    }
  }, [job, editor]);

  return (
    <div className="flex flex-col flex-1">
      <div className="bg-white-100 rounded-2xl w-full p-8 gap-6 flex flex-col">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-black-900">
            {job?.companyName}
          </h1>
          <Button
            onClick={() => {}}
            variant="ghost"
            size="md"
            className="py-2 px-3 min-h-fit"
          >
            편집
          </Button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex gap-12">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-white-700">직무</p>
              <p className="text-black-900"> {job?.position}</p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm text-white-700">지원일</p>
              <p className="text-black-900"> {job?.appliedDate.slice(0, 10)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-sm text-white-700">채용 절차</p>
            <div className="flex gap-2">
              {job?.stages.map((stage) => (
                <p className="w-fit py-1 px-3 rounded-2xl bg-black-200 text-black-600 whitespace-nowrap">
                  {stage.name}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-10">
            {/* <p className="text-sm text-white-700">메모</p> */}
            <BlockNoteView editor={editor} editable={false} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;

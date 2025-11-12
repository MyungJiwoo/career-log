import { Button as ShadcnButton } from "@/components/ui/button";
import Button from "@/components/Button";
import { Calendar } from "@/components/ui/calendar";
import { FieldSet, FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDownIcon } from "lucide-react";

import { useEffect, useState } from "react";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  createCodeBlockSpec,
} from "@blocknote/core";

import axios from "axios";
import PlusIcon from "@/components/icons/PlusIcon";
import MinusIcon from "@/components/icons/MinusIcon";
import { useNavigate, useParams } from "react-router-dom";

const createSchema = () => {
  const blockSpecs = {
    ...defaultBlockSpecs,

    // 숫자 목록 start 기본값
    numberedListItem: {
      ...defaultBlockSpecs.numberedListItem,
      config: {
        ...defaultBlockSpecs.numberedListItem.config,
        propSchema: {
          ...defaultBlockSpecs.numberedListItem.config.propSchema,
          start: {
            ...defaultBlockSpecs.numberedListItem.config.propSchema.start,
            default: 1 as const,
          },
        },
      },
    },

    // 이미지 previewWidth/previewHeight 기본값
    image: {
      ...defaultBlockSpecs.image,
      config: {
        ...defaultBlockSpecs.image.config,
        propSchema: {
          ...defaultBlockSpecs.image.config.propSchema,
          previewWidth: {
            ...defaultBlockSpecs.image.config.propSchema.previewWidth,
            // 누락 시 RangeError 방지용 안전 기본값
            default: 512 as const,
          },
        },
      },
    },

    codeBlock: createCodeBlockSpec({
      /* your existing options */
    }),
  };

  return BlockNoteSchema.create({ blockSpecs });
};

interface Stage {
  order: number;
  name: string;
  status: "pending" | "pass" | "nonpass";
}

const CreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const editor = useCreateBlockNote({ schema: createSchema() });

  const [companyName, setCompanyName] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [contents, setContents] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [progressStatus, setProgressStatus] = useState("pending");
  const [stages, setStages] = useState<Stage[] | undefined>([
    {
      order: 1,
      name: "",
      status: "pending",
    },
  ]);

  const handleAddStage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    setStages((prev = []) => [
      ...prev,
      {
        order: prev.length > 0 ? prev[prev.length - 1].order + 1 : 1,
        name: "",
        status: "pending",
      },
    ]);
  };

  const handleDeleteStage = (
    event: React.MouseEvent<HTMLButtonElement>,
    order: number
  ) => {
    event.preventDefault();
    setStages((prev = []) => prev.filter((stage) => stage.order !== order));
  };

  const handleStageNameChange = (order: number, nextName: string) => {
    setStages((prev) =>
      prev?.map((stage) =>
        stage.order === order ? { ...stage, name: nextName } : stage
      )
    );
  };

  const handleStageStatusChange = (
    order: number,
    nextStatus: Stage["status"]
  ) => {
    setStages((prev) =>
      prev?.map((stage) =>
        stage.order === order ? { ...stage, status: nextStatus } : stage
      )
    );
  };

  const onChange = () => {
    // 기본으로 제공되는 마크다운 변환 문법은 blocknote의 모든 기능을 지원하지 않아서 JSON으로 직렬화하여 저장
    const markdown = JSON.stringify(editor.document);
    setContents(markdown);
  };

  const handleSubmit = async () => {
    const parsedDate = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`
      : "";

    const payload = {
      companyName,
      position,
      appliedDate: parsedDate,
      stages,
      contents,
      progress: progressStatus,
    };

    try {
      let response;
      if (id) {
        response = await axios.patch(
          `http://localhost:3000/api/appliedJob/${id}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true, // 쿠키 기반 인증을 사용하는 경우 필요
          }
        );
      } else {
        response = await axios.post(
          "http://localhost:3000/api/appliedJob",
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true, // 쿠키 기반 인증을 사용하는 경우 필요
          }
        );
      }

      console.log("저장 성공:", response.data);
      alert("지원 내역이 성공적으로 저장되었습니다!");
      if (id) {
        navigate(`/${id}`);
      } else {
        navigate("/");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("저장 실패:", error.response?.data || error.message);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  const fetchDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/appliedJob/${id}`
      );
      setCompanyName(response.data.companyName);
      setPosition(response.data.position);
      setDate(new Date(response.data.appliedDate));
      setStages(response.data.stages);
      setProgressStatus(response.data.progress);
      const parsedBlocks = JSON.parse(response.data.contents);
      editor.replaceBlocks(editor.document, parsedBlocks);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("불러오기 실패:", error.response?.data || error.message);
      alert("불러오기 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  return (
    <div className="flex flex-col gap-6 flex-1">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-black-900">진행 일정 추가</h1>
        <Button onClick={handleSubmit} size="md">
          저장하기
        </Button>
      </div>

      <form className="bg-white-100 rounded-2xl w-full p-5 gap-4 flex flex-col">
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="companyName">기업 이름</FieldLabel>
              <Input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                className="border rounded-lg px-2 py-1 border-white-200 shadow-none"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="position">직무</FieldLabel>
              <Input
                id="position"
                type="text"
                value={position}
                onChange={(event) => setPosition(event.target.value)}
                className="border rounded-lg px-2 py-1 border-white-200 shadow-none"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="position">지원한 날짜</FieldLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <ShadcnButton
                    variant="outline"
                    id="date"
                    className="justify-between border rounded-lg px-2 py-1 border-white-200 shadow-none font-normal cursor-pointer"
                  >
                    {date ? date.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon />
                  </ShadcnButton>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setDate(date);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field>
              <FieldLabel htmlFor="progress">진행 여부</FieldLabel>
              <Select value={progressStatus} onValueChange={setProgressStatus}>
                <SelectTrigger className="border rounded-lg px-2 py-1 border-white-200 shadow-none font-normal cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">진행 예정</SelectItem>
                  <SelectItem value="in progress">진행 중</SelectItem>
                  <SelectItem value="completed">진행 종료</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="stages">채용 절차</FieldLabel>
              {stages?.map((stage, index) => (
                <div className="flex gap-2 items-center">
                  <Input
                    type="text"
                    className="border rounded-lg px-2 py-1 border-white-200 shadow-none"
                    value={stage.name}
                    onChange={(event) =>
                      handleStageNameChange(stage.order, event.target.value)
                    }
                  />
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={stage.status}
                    onValueChange={(value) =>
                      value &&
                      handleStageStatusChange(
                        stage.order,
                        value as Stage["status"]
                      )
                    }
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
                      value="nonpass"
                      className="border rounded-lg px-2 py-1 border-white-200 shadow-none font-normal"
                    >
                      불합격
                    </ToggleGroupItem>
                  </ToggleGroup>

                  {stages.length - 1 !== index ? (
                    <Button
                      onClick={(event) => handleDeleteStage(event, stage.order)}
                      variant="secondary"
                      size="sm"
                      round="circular"
                      className="size-8"
                      rightIcon={<MinusIcon className="text-gray-400 size-5" />}
                    ></Button>
                  ) : (
                    <Button
                      onClick={(event) => handleAddStage(event)}
                      variant="primary"
                      size="sm"
                      round="circular"
                      className="size-8"
                      rightIcon={<PlusIcon className="text-white-200 size-5" />}
                    ></Button>
                  )}
                </div>
              ))}
            </Field>

            <Field>
              <FieldLabel htmlFor="contents">기타 내용</FieldLabel>
              <BlockNoteView editor={editor} onChange={onChange} />
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
};

export default CreatePage;

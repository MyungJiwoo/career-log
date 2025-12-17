import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import {
  BlockNoteSchema,
  createCodeBlockSpec,
  defaultBlockSpecs,
} from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import axios from "axios";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import axiosInstance from "@/apis/axiosInstance";
import Button from "@/components/Button";
import MinusIcon from "@/components/icons/MinusIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldGroup, FieldLabel,FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
  const [files, setFiles] = useState<File[]>([]); // Input으로 새로 추가된 파일들
  const [fileList, setFileList] = useState<string[]>([]); // 서버에서 받은 파일

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    console.log(selected);
    // setFileList(selected.map((file) => file.name));

    setFiles((prev) => {
      const merged = [...prev, ...selected];

      // 파일 이름 + 용량 기준으로 중복 제거
      const unique = merged.filter(
        (file, index, array) =>
          array.findIndex(
            (f) => f.name === file.name && f.size === file.size
          ) === index
      );

      return unique;
    });
  };

  const handleSubmit = async () => {
    const parsedDate = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`
      : "";

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const fileFormData = new FormData();
        const encodedFileName = encodeURIComponent(file.name);
        fileFormData.append("file", file);
        fileFormData.append("originalName", encodedFileName);

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/upload/file`,
          fileFormData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response.data.fileUrl;
      })
    );

    const payload = {
      companyName,
      position,
      appliedDate: parsedDate,
      stages,
      contents,
      progress: progressStatus,
      fileUrl: [...fileList, ...uploadedFiles],
    };

    try {
      let response;
      if (id) {
        response = await axiosInstance.patch(`/appliedJob/${id}`, payload);
      } else {
        response = await axiosInstance.post("/appliedJob", payload);
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
      const response = await axiosInstance.get(`/appliedJob/${id}`);
      setCompanyName(response.data.companyName);
      setPosition(response.data.position);
      setDate(new Date(response.data.appliedDate));
      setStages(response.data.stages);
      setProgressStatus(response.data.progress);
      setFileList(response.data.fileUrl);
      const parsedBlocks = JSON.parse(response.data.contents);
      editor.replaceBlocks(editor.document, parsedBlocks);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("불러오기 실패:", error.response?.data || error.message);
      alert("불러오기 중 오류가 발생했습니다.");
    }
  };

  const handleFileDelete = (file: string | File) => {
    if (typeof file === "string") {
      setFileList((prev) => prev.filter((item) => item !== file));
    }
    if (file instanceof File) {
      setFiles((prev) => prev.filter((item) => item !== file));
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  return (
    <div className="flex flex-col gap-6 flex-1">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-black-900">진행 일정 추가</h1>
        <Button size="md" onClick={handleSubmit}>
          저장하기
        </Button>
      </div>

      <form className="bg-white-100 rounded-2xl w-full p-5 gap-4 flex flex-col">
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="companyName">기업 이름</FieldLabel>
              <Input
                className="border rounded-lg px-2 py-1 border-white-200 shadow-none"
                id="companyName"
                type="text"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="position">직무</FieldLabel>
              <Input
                className="border rounded-lg px-2 py-1 border-white-200 shadow-none"
                id="position"
                type="text"
                value={position}
                onChange={(event) => setPosition(event.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="position">지원한 날짜</FieldLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <ShadcnButton
                    className="justify-between border rounded-lg px-2 py-1 border-white-200 shadow-none font-normal cursor-pointer"
                    id="date"
                    variant="outline"
                  >
                    {date ? date.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon />
                  </ShadcnButton>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-auto overflow-hidden p-0"
                >
                  <Calendar
                    captionLayout="dropdown"
                    mode="single"
                    selected={date}
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
                    className="border rounded-lg px-2 py-1 border-white-200 shadow-none"
                    type="text"
                    value={stage.name}
                    onChange={(event) =>
                      handleStageNameChange(stage.order, event.target.value)
                    }
                  />
                  <ToggleGroup
                    type="single"
                    value={stage.status}
                    variant="outline"
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
                      className="border rounded-lg px-2 py-1 border-white-200 shadow-none font-normal"
                      value="nonpass"
                    >
                      불합격
                    </ToggleGroupItem>
                  </ToggleGroup>

                  {stages.length - 1 !== index ? (
                    <Button
                      className="size-8"
                      rightIcon={<MinusIcon className="text-gray-400 size-5" />}
                      round="circular"
                      size="sm"
                      variant="secondary"
                      onClick={(event) => handleDeleteStage(event, stage.order)}
                     />
                  ) : (
                    <Button
                      className="size-8"
                      rightIcon={<PlusIcon className="text-white-200 size-5" />}
                      round="circular"
                      size="sm"
                      variant="primary"
                      onClick={(event) => handleAddStage(event)}
                     />
                  )}
                </div>
              ))}
            </Field>

            <Field>
              <FieldLabel htmlFor="companyName">파일</FieldLabel>
              <Input
                multiple
                className="border rounded-lg px-2 py-1 border-white-200 shadow-none font-normal"
                id="fileUrl"
                type="file"
                onChange={handleFileSelect}
              />
              <div className="flex flex-col gap-2">
                {fileList.length > 0 && (
                  <ul className="rounded-lg divide-y divide-gray-200 flex flex-col gap-2">
                    {fileList.map((file) => (
                      <li className="flex justify-between border rounded-lg px-2 py-1 border-white-200 bg-white-100 shadow-none font-normal cursor-pointer">
                        <div className="flex items-center space-x-3 px-2 py-1 ">
                          <div>
                            <p className="text-sm font-sm text-gray-700">
                              {file}
                            </p>
                          </div>
                        </div>
                        <button
                          className="text-gray-300 hover:text-gray-400 transition-colors cursor-pointer"
                          type="button"
                          onClick={() => handleFileDelete(file)}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                            />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {files.length > 0 && (
                  <ul className="rounded-lg divide-y divide-gray-200 flex flex-col gap-2">
                    {files.map((file) => (
                      <li className="flex justify-between border rounded-lg px-2 py-1 border-white-200 bg-white-100 shadow-none font-normal cursor-pointer">
                        <div className="flex items-center space-x-3 px-2 py-1 ">
                          <div>
                            <p className="text-sm font-sm text-gray-700">
                              {file.name}
                            </p>
                          </div>
                        </div>
                        <button
                          className="text-gray-300 hover:text-gray-400 transition-colors cursor-pointer"
                          type="button"
                          onClick={() => handleFileDelete(file)}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                            />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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

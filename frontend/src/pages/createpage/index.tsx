import { Button } from "@/components/ui/button";
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

import { useState } from "react";
import { twMerge } from "tailwind-merge";

interface Stage {
  order: number;
  name: string;
  status: "pending" | "pass" | "nonpass";
}

const CreatePage = () => {
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

  const handleSubmit = () => {
    console.log({
      companyName,
      position,
      date,
      progressStatus,
      stages,
      contents,
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-120 flex-1">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-black-900">진행 일정 추가</h1>
        <button
          onClick={handleSubmit}
          className="bg-black-800 text-white-200 w-fit py-1.5 px-3 rounded-xl cursor-pointer ml-auto"
        >
          저장
        </button>
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
                  <Button
                    variant="outline"
                    id="date"
                    className="justify-between border rounded-lg px-2 py-1 border-white-200 shadow-none font-normal cursor-pointer"
                  >
                    {date ? date.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon />
                  </Button>
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
                <div className="flex gap-2">
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
                  <button
                    onClick={(event) =>
                      stages.length - 1 !== index
                        ? handleDeleteStage(event, stage.order)
                        : handleAddStage(event)
                    }
                    className={twMerge(
                      "shrink-0 text-white-200 rounded-full size-8 flex justify-center items-center cursor-pointer",
                      stages.length - 1 !== index
                        ? "bg-white-700 hover:bg-black-600"
                        : "bg-black-600 hover:bg-black-800"
                    )}
                  >
                    {stages.length - 1 !== index ? "-" : "+"}
                  </button>
                </div>
              ))}
            </Field>

            <Field>
              <FieldLabel htmlFor="contents">기타 내용</FieldLabel>
              <Input
                id="contents"
                type="text"
                value={contents}
                onChange={(event) => setContents(event.target.value)}
                className="border rounded-lg px-2 py-1 border-white-200 shadow-none"
              />
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
};

export default CreatePage;

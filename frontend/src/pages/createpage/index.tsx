import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

import { BlockNoteSchema, createCodeBlockSpec, defaultBlockSpecs } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDownIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { createJob, fetchJobDetail, type JobPayload, type Stage, updateJob, uploadFile } from '@/apis/http';
import Button from '@/components/Button';
import MinusIcon from '@/components/icons/MinusIcon';
import PlusIcon from '@/components/icons/PlusIcon';
import { Button as ShadcnButton } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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

const CreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const editor = useCreateBlockNote({ schema: createSchema() });

  const [companyName, setCompanyName] = useState<string>('');
  const [position, setPosition] = useState<string>('');
  const [contents, setContents] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [progressStatus, setProgressStatus] = useState('pending');
  const [stages, setStages] = useState<Omit<Stage, '_id'>[] | undefined>([
    {
      order: 1,
      name: '',
      status: 'pending',
    },
  ]);
  const [files, setFiles] = useState<File[]>([]); // Input으로 새로 추가된 파일들
  const [fileList, setFileList] = useState<string[]>([]); // 서버에서 받은 파일

  // 수정 모드일 때 기존 데이터 불러오기
  const { data: jobData, isLoading } = useQuery({
    queryKey: ['appliedJob', id],
    queryFn: () => fetchJobDetail(id!),
    enabled: !!id,
  });

  // 불러온 데이터로 폼 초기화
  useEffect(() => {
    if (jobData) {
      setCompanyName(jobData.companyName);
      setPosition(jobData.position);
      setDate(new Date(jobData.appliedDate));
      setStages(jobData.stages);
      setProgressStatus(jobData.progress);
      setFileList(jobData.fileUrl);
      const parsedBlocks = JSON.parse(jobData.contents);
      editor.replaceBlocks(editor.document, parsedBlocks);
    }
  }, [jobData, editor]);

  const handleAddStage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    setStages((prev = []) => [
      ...prev,
      {
        order: prev.length > 0 ? prev[prev.length - 1].order + 1 : 1,
        name: '',
        status: 'pending',
      },
    ]);
  };

  const handleDeleteStage = (event: React.MouseEvent<HTMLButtonElement>, order: number) => {
    event.preventDefault();
    setStages((prev = []) => prev.filter((stage) => stage.order !== order));
  };

  const handleStageNameChange = (order: number, nextName: string) => {
    setStages((prev) => prev?.map((stage) => (stage.order === order ? { ...stage, name: nextName } : stage)));
  };

  const handleStageStatusChange = (order: number, nextStatus: Stage['status']) => {
    setStages((prev) => prev?.map((stage) => (stage.order === order ? { ...stage, status: nextStatus } : stage)));
  };

  const onChange = () => {
    // 기본으로 제공되는 마크다운 변환 문법은 blocknote의 모든 기능을 지원하지 않아서 JSON으로 직렬화하여 저장
    const markdown = JSON.stringify(editor.document);
    setContents(markdown);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);

    setFiles((prev) => {
      const merged = [...prev, ...selected];

      // 파일 이름 + 용량 기준으로 중복 제거
      const unique = merged.filter(
        (file, index, array) => array.findIndex((f) => f.name === file.name && f.size === file.size) === index,
      );

      return unique;
    });
  };

  // 지원 정보 생성/수정 mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: JobPayload) => {
      // 1. 파일 업로드
      const uploadedFiles = await Promise.all(files.map(uploadFile));

      // 2. 업로드된 파일 URL을 포함한 최종 payload
      const finalPayload: JobPayload = {
        ...payload,
        fileUrl: [...fileList, ...uploadedFiles],
      };

      // 3. 생성 또는 수정
      if (id) {
        return updateJob({ id, payload: finalPayload });
      } else {
        return createJob(finalPayload);
      }
    },
    onSuccess: () => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['appliedJobs'] });
      queryClient.invalidateQueries({ queryKey: ['appliedJob', id] });

      alert('지원 내역이 성공적으로 저장되었습니다!');

      // 페이지 이동
      if (id) {
        navigate(`/${id}`);
      } else {
        navigate('/');
      }
    },
    onError: (error: unknown) => {
      console.error('저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    },
  });

  const handleSubmit = () => {
    const parsedDate = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          '0',
        )}-${String(date.getDate()).padStart(2, '0')}`
      : '';

    const payload: JobPayload = {
      companyName,
      position,
      appliedDate: parsedDate,
      stages: stages || [],
      contents,
      progress: progressStatus as JobPayload['progress'],
      fileUrl: [], // mutation 내부에서 처리
    };

    saveMutation.mutate(payload);
  };

  const handleFileDelete = (file: string | File) => {
    if (typeof file === 'string') {
      setFileList((prev) => prev.filter((item) => item !== file));
    }
    if (file instanceof File) {
      setFiles((prev) => prev.filter((item) => item !== file));
    }
  };

  // 수정 모드에서 데이터 로딩 중일 때
  if (id && isLoading) {
    return <div className='flex h-full items-center justify-center'>로딩 중...</div>;
  }

  return (
    <div className='flex flex-1 flex-col gap-6'>
      <div className='flex justify-between'>
        <h1 className='text-black-900 text-2xl font-bold'>진행 일정 추가</h1>
        <Button disabled={saveMutation.isPending} size='md' onClick={handleSubmit}>
          {saveMutation.isPending ? '저장 중...' : '저장하기'}
        </Button>
      </div>

      <form className='bg-white-100 flex w-full flex-col gap-4 rounded-2xl p-5'>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='companyName'>기업 이름</FieldLabel>
              <Input
                className='border-white-200 rounded-lg border px-2 py-1 shadow-none'
                id='companyName'
                type='text'
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor='position'>직무</FieldLabel>
              <Input
                className='border-white-200 rounded-lg border px-2 py-1 shadow-none'
                id='position'
                type='text'
                value={position}
                onChange={(event) => setPosition(event.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor='position'>지원한 날짜</FieldLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <ShadcnButton
                    className='border-white-200 cursor-pointer justify-between rounded-lg border px-2 py-1 font-normal shadow-none'
                    id='date'
                    variant='outline'
                  >
                    {date ? date.toLocaleDateString() : 'Select date'}
                    <ChevronDownIcon />
                  </ShadcnButton>
                </PopoverTrigger>
                <PopoverContent align='start' className='w-auto overflow-hidden p-0'>
                  <Calendar
                    captionLayout='dropdown'
                    mode='single'
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
              <FieldLabel htmlFor='progress'>진행 여부</FieldLabel>
              <Select value={progressStatus} onValueChange={setProgressStatus}>
                <SelectTrigger className='border-white-200 cursor-pointer rounded-lg border px-2 py-1 font-normal shadow-none'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='pending'>진행 예정</SelectItem>
                  <SelectItem value='in progress'>진행 중</SelectItem>
                  <SelectItem value='completed'>진행 종료</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor='stages'>채용 절차</FieldLabel>
              {stages?.map((stage, index) => (
                <div key={stage.order} className='flex items-center gap-2'>
                  <Input
                    className='border-white-200 rounded-lg border px-2 py-1 shadow-none'
                    type='text'
                    value={stage.name}
                    onChange={(event) => handleStageNameChange(stage.order, event.target.value)}
                  />
                  <ToggleGroup
                    type='single'
                    value={stage.status}
                    variant='outline'
                    onValueChange={(value) => value && handleStageStatusChange(stage.order, value as Stage['status'])}
                  >
                    <ToggleGroupItem
                      className='border-white-200 rounded-lg border px-2 py-1 font-normal shadow-none'
                      value='pending'
                    >
                      진행 전
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      className='border-white-200 rounded-lg border px-2 py-1 font-normal shadow-none'
                      value='pass'
                    >
                      합격
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      className='border-white-200 rounded-lg border px-2 py-1 font-normal shadow-none'
                      value='nonpass'
                    >
                      불합격
                    </ToggleGroupItem>
                  </ToggleGroup>

                  {stages.length - 1 !== index ? (
                    <Button
                      className='size-8'
                      rightIcon={<MinusIcon className='size-5 text-gray-400' />}
                      round='circular'
                      size='sm'
                      variant='secondary'
                      onClick={(event) => handleDeleteStage(event, stage.order)}
                    />
                  ) : (
                    <Button
                      className='size-8'
                      rightIcon={<PlusIcon className='text-white-200 size-5' />}
                      round='circular'
                      size='sm'
                      variant='primary'
                      onClick={(event) => handleAddStage(event)}
                    />
                  )}
                </div>
              ))}
            </Field>

            <Field>
              <FieldLabel htmlFor='companyName'>파일</FieldLabel>
              <Input
                multiple
                className='border-white-200 rounded-lg border px-2 py-1 font-normal shadow-none'
                id='fileUrl'
                type='file'
                onChange={handleFileSelect}
              />
              <div className='flex flex-col gap-2'>
                {fileList.length > 0 && (
                  <ul className='flex flex-col gap-2 divide-y divide-gray-200 rounded-lg'>
                    {fileList.map((file) => (
                      <li
                        key={file}
                        className='border-white-200 bg-white-100 flex cursor-pointer justify-between rounded-lg border px-2 py-1 font-normal shadow-none'
                      >
                        <div className='flex items-center space-x-3 px-2 py-1'>
                          <div>
                            <p className='font-sm text-sm text-gray-700'>{file}</p>
                          </div>
                        </div>
                        <button
                          className='cursor-pointer text-gray-300 transition-colors hover:text-gray-400'
                          type='button'
                          onClick={() => handleFileDelete(file)}
                        >
                          <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path
                              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                            />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {files.length > 0 && (
                  <ul className='flex flex-col gap-2 divide-y divide-gray-200 rounded-lg'>
                    {files.map((file) => (
                      <li
                        key={file.name}
                        className='border-white-200 bg-white-100 flex cursor-pointer justify-between rounded-lg border px-2 py-1 font-normal shadow-none'
                      >
                        <div className='flex items-center space-x-3 px-2 py-1'>
                          <div>
                            <p className='font-sm text-sm text-gray-700'>{file.name}</p>
                          </div>
                        </div>
                        <button
                          className='cursor-pointer text-gray-300 transition-colors hover:text-gray-400'
                          type='button'
                          onClick={() => handleFileDelete(file)}
                        >
                          <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path
                              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                              strokeLinecap='round'
                              strokeLinejoin='round'
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
              <FieldLabel htmlFor='contents'>기타 내용</FieldLabel>
              <BlockNoteView editor={editor} onChange={onChange} />
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
};

export default CreatePage;

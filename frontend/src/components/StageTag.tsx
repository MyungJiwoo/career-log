import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { twJoin } from 'tailwind-merge';

import { updateStageStatus } from '@/apis/http';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const VARIANT_STYLES = {
  size: {
    md: 'text-md',
    sm: 'text-sm',
  },
  status: {
    pending: 'bg-black-200 text-black-600',
    pass: 'bg-green-200 text-green-500',
    nonpass: 'bg-red-200 text-red-500',
  },
};

const STATUSES = ['pending', 'pass', 'nonpass'] as const;
type Status = (typeof STATUSES)[number];
const isStatus = (v: unknown): v is Status => typeof v === 'string' && (STATUSES as readonly string[]).includes(v);

interface StageTagProps {
  name: string;
  status?: Status;
  size?: 'md' | 'sm';
  jobId?: string;
  stageId?: string;
}

export default function StageTag({ name, status = 'pending', size = 'md', jobId, stageId }: StageTagProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // todo: 낙관적 업데이트 적용
  const { mutate } = useMutation({
    mutationFn: updateStageStatus,
    onSuccess: () => {
      // 'appliedJobs' 목록과 'statistics' 통계를 모두 다시 불러옴
      queryClient.invalidateQueries({ queryKey: ['appliedJobs'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      setOpen(false); // 팝업 닫기
    },
  });

  const handleChange = (value: string) => {
    if (isStatus(value) && jobId && stageId) {
      mutate({ jobId, stageId, status: value });
    }
  };

  const tagClassNames = twJoin(
    'w-fit py-1 px-3 whitespace-nowrap rounded-2xl cursor-pointer',
    size && VARIANT_STYLES.size[size],
    VARIANT_STYLES.status[status],
  );

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <p className={tagClassNames}>{name}</p>
        </PopoverTrigger>
        <PopoverContent align='start' className='flex w-auto flex-col gap-2 overflow-hidden p-4'>
          <p className='text-white-700 text-sm'>전형 결과</p>
          <ToggleGroup type='single' value={status} variant='outline' onValueChange={handleChange}>
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
        </PopoverContent>
      </Popover>
    </div>
  );
}

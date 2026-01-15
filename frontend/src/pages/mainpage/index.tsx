import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchAppliedJobs, fetchStatistics } from '@/apis/http';
import Button from '@/components/Button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import ApplicationStatusWidget from './components/ApplicationStatusWidget';
import ApplicationTableRow from './components/ApplicationTableRow';

interface Stage {
  order: number;
  name: string;
  status: 'pending' | 'pass' | 'nonpass';
  _id: string;
}

interface AppliedJob {
  number: number;
  companyName: string;
  position: string;
  appliedDate: string;
  stages: Stage[];
  contents: string;
  progress: 'pending' | 'in progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  _id: string;
}

interface Statistics {
  totalApplications: number;
  totalPassRate: number;
  totalDocumentApplications: number;
  documentPassRate: number;
  totalCodingTestAttempts: number;
  codingTestPassRate: number;
  totalAssignmentAttempts: number;
  assignmentPassRate: number;
  totalInterviewAttempts: number;
  interviewPassRate: number;
}

const MainPage = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<'in progress' | 'pending' | 'completed' | 'all'>('all');

  // 지원 현황 목록 조회
  const { data: jobs } = useQuery<AppliedJob[]>({
    queryKey: ['appliedJobs', progress],
    queryFn: () => fetchAppliedJobs(progress),
  });

  // 통계 데이터 조회
  const { data: statistics } = useQuery<Statistics>({
    queryKey: ['statistics'],
    queryFn: fetchStatistics,
  });

  const navigateToCreate = () => {
    navigate('/new');
  };

  return (
    <div className='flex flex-col gap-6'>
      <h1 className='text-black-900 text-2xl font-bold'>지원 현황 리포트</h1>

      {/* 지원 현황 통계 위젯 */}
      <div className='flex justify-between'>
        <ApplicationStatusWidget stats={`${statistics?.totalApplications ?? 0}개`} title='총 지원 횟수' />
        <ApplicationStatusWidget stats={`${statistics?.totalPassRate.toFixed(1) ?? 0}%`} title='총 합격률' />
        <ApplicationStatusWidget
          stats={`${statistics?.documentPassRate.toFixed(1) ?? 0}%`}
          title='서류 합격률'
          total={statistics?.totalDocumentApplications ?? 0}
          totalUnit='지원'
        />
        <ApplicationStatusWidget
          stats={`${statistics?.codingTestPassRate.toFixed(1) ?? 0}%`}
          title='코딩 테스트 합격률'
          total={statistics?.totalCodingTestAttempts ?? 0}
          totalUnit='진행'
        />
        <ApplicationStatusWidget
          stats={`${statistics?.assignmentPassRate.toFixed(1) ?? 0}%`}
          title='과제 테스트 합격률'
          total={statistics?.totalAssignmentAttempts ?? 0}
          totalUnit='진행'
        />
        <ApplicationStatusWidget
          stats={`${statistics?.interviewPassRate.toFixed(1) ?? 0}%`}
          title='면접 합격률'
          total={statistics?.totalInterviewAttempts ?? 0}
          totalUnit='진행'
        />
      </div>

      {/* 지원 현황 추가 버튼 */}
      <div className='flex justify-between'>
        <div className='flex justify-start gap-2'>
          <ToggleGroup
            spacing={2}
            type='single'
            value={progress}
            onValueChange={(value) => {
              if (value === 'all' || value === 'in progress' || value === 'pending' || value === 'completed')
                setProgress(value);
            }}
          >
            <ToggleGroupItem
              className='bg-white-300 text-black-800 data-[state=on]:bg-black-800 data-[state=on]:text-white-200 cursor-pointer rounded-xl'
              value='all'
            >
              전체
            </ToggleGroupItem>
            <ToggleGroupItem
              className='bg-white-300 text-black-800 data-[state=on]:bg-black-800 data-[state=on]:text-white-200 cursor-pointer rounded-xl'
              value='pending'
            >
              진행 예정
            </ToggleGroupItem>
            <ToggleGroupItem
              className='bg-white-300 text-black-800 data-[state=on]:bg-black-800 data-[state=on]:text-white-200 cursor-pointer rounded-xl'
              value='in progress'
            >
              진행 중
            </ToggleGroupItem>
            <ToggleGroupItem
              className='bg-white-300 text-black-800 data-[state=on]:bg-black-800 data-[state=on]:text-white-200 cursor-pointer rounded-xl'
              value='completed'
            >
              진행 종료
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <Button className='px-3' size='sm' onClick={navigateToCreate}>
          추가하기
        </Button>
      </div>

      {/* 지원 현황 표 */}
      <table className='bg-white-100 w-full table-fixed border-separate border-spacing-x-4 border-spacing-y-3 rounded-2xl p-4'>
        <thead className='text-black-600 sticky top-0 z-10'>
          <tr className='text-left'>
            <th className='w-[5%] text-sm font-semibold' scope='col'>
              번호
            </th>
            <th className='w-[20%] text-sm font-semibold' scope='col'>
              기업명
            </th>
            <th className='w-[12%] text-sm font-semibold' scope='col'>
              직무
            </th>
            <th className='w-[13%] text-sm font-semibold' scope='col'>
              진행 현황
            </th>
            <th className='w-[50%] text-sm font-semibold' scope='col'>
              채용 절차
            </th>
          </tr>
        </thead>

        <tbody className='text-black-900'>
          {jobs?.map((job, index) => (
            <ApplicationTableRow
              key={job._id}
              companyName={job.companyName}
              id={job._id}
              index={index + 1}
              number={job.number}
              position={job.position}
              progress={job.progress}
              stages={job.stages}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MainPage;

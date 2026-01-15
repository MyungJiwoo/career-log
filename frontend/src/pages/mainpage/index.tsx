import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchAppliedJobs, fetchStatistics, type PaginatedResponse } from '@/apis/http';
import Button from '@/components/Button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
  const [page, setPage] = useState<number>(1);

  // 지원 현황 목록 조회
  const { data: paginatedResponse } = useQuery<PaginatedResponse<AppliedJob>>({
    queryKey: ['appliedJobs', progress, page],
    queryFn: () => fetchAppliedJobs(progress, page, 20),
  });

  const jobs = paginatedResponse?.data;
  const totalPages = paginatedResponse?.totalPages ?? 0;
  const currentPage = paginatedResponse?.currentPage ?? 1;

  // 통계 데이터 조회
  const { data: statistics } = useQuery<Statistics>({
    queryKey: ['statistics'],
    queryFn: fetchStatistics,
  });

  const navigateToCreate = () => {
    navigate('/new');
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              if (value === 'all' || value === 'in progress' || value === 'pending' || value === 'completed') {
                setProgress(value);
                setPage(1);
              }
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

      {/* 페이지네이션 */}
      {totalPages > 0 && (
        <Pagination>
          <PaginationContent>
            {/* Previous 버튼 */}
            <PaginationItem>
              <PaginationPrevious
                aria-disabled={currentPage === 1}
                className='bg-white-200 hover:bg-white-300 h-7 w-7 cursor-pointer rounded-full p-0'
                style={{
                  pointerEvents: currentPage === 1 ? 'none' : 'auto',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
                onClick={() => handlePageChange(currentPage - 1)}
              />
            </PaginationItem>

            {/* 페이지 번호 */}
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  className={
                    pageNumber === currentPage
                      ? 'bg-black-800 text-white-200 hover:bg-white-300 h-7 w-7 cursor-pointer rounded-full p-0'
                      : 'bg-white-100 hover:bg-white-300 h-7 w-7 cursor-pointer rounded-full p-0'
                  }
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}

            {/* Next 버튼 */}
            <PaginationItem>
              <PaginationNext
                aria-disabled={currentPage === totalPages}
                className='bg-white-200 hover:bg-white-300 h-7 w-7 cursor-pointer rounded-full p-0'
                style={{
                  pointerEvents: currentPage === totalPages ? 'none' : 'auto',
                  opacity: currentPage === totalPages ? 0.2 : 1,
                }}
                onClick={() => handlePageChange(currentPage + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default MainPage;

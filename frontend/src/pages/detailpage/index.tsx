import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { type AppliedJob, deleteJob, fetchJobDetail } from '@/apis/http';
import Button from '@/components/Button';
import FileIcon from '@/components/icons/FileIcon';
import StageTag from '@/components/StageTag';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const DetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const editor = useCreateBlockNote();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // 지원 상세 정보 조회
  const {
    data: job,
    isLoading,
    isError,
  } = useQuery<AppliedJob>({
    queryKey: ['appliedJob', id],
    queryFn: () => fetchJobDetail(id!),
    enabled: !!id,
  });

  // 지원 정보 삭제
  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appliedJobs'] });
      navigate('/');
    },
    onError: (error: AxiosError) => {
      console.error('삭제 실패:', error.response?.data || error.message);
      alert('삭제 중 오류가 발생했습니다.');
    },
  });

  const navigateToEdit = (id: string) => {
    navigate(`/new/${id}`);
  };

  const confirmDelete = () => {
    if (id) {
      deleteMutation.mutate(id);
    }
  };

  const getFileNameFromUrl = (url: string) => {
    if (!url) return '';
    if (typeof url !== 'string') return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  useEffect(() => {
    if (!job?.contents) return;

    try {
      const parsedBlocks = JSON.parse(job.contents);
      editor.replaceBlocks(editor.document, parsedBlocks);
    } catch (error) {
      console.error('BlockNote parsing failed:', error);
    }
  }, [job, editor]);

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <p className='text-gray-500'>로딩 중...</p>
      </div>
    );
  }

  // 에러 상태 처리
  if (isError || !job) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <p className='text-red-500'>데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col'>
      <div className='bg-white-100 flex w-full flex-col gap-6 rounded-2xl p-8'>
        <div className='flex items-center justify-between'>
          <h1 className='text-black-900 text-3xl font-bold'>{job?.companyName}</h1>
          <div className='flex gap-4'>
            <Button
              className='min-h-fit px-3 py-2'
              size='md'
              variant='ghost'
              onClick={() => {
                if (id) navigateToEdit(id);
              }}
            >
              편집
            </Button>
            <Button className='min-h-fit px-3 py-2' size='md' variant='ghost' onClick={() => setDeleteModalOpen(true)}>
              삭제
            </Button>
          </div>
        </div>

        <div className='flex flex-col gap-6'>
          <div className='flex gap-12'>
            <div className='flex flex-col gap-1'>
              <p className='text-white-700 text-sm'>직무</p>
              <p className='text-black-900'> {job?.position}</p>
            </div>

            <div className='flex flex-col gap-1'>
              <p className='text-white-700 text-sm'>지원일</p>
              <p className='text-black-900'> {job?.appliedDate.slice(0, 10)}</p>
            </div>
          </div>

          <div className='flex flex-col gap-1.5'>
            <p className='text-white-700 text-sm'>채용 절차</p>
            <div className='flex gap-2'>
              {job?.stages.map((stage) => (
                <StageTag
                  key={stage._id}
                  jobId={id}
                  name={stage.name}
                  size='md'
                  stageId={stage._id}
                  status={stage.status}
                />
              ))}
            </div>
          </div>

          {job?.fileUrl && job?.fileUrl.length > 0 && (
            <div className='flex flex-col gap-1'>
              <p className='text-white-700 text-sm'>업로드 파일</p>
              {job?.fileUrl.map((url) => (
                <Button
                  key={url}
                  className='justify-start gap-2 border-gray-100 bg-gray-50 px-4'
                  leftIcon={<FileIcon className='size-4 text-gray-400' />}
                  round='rounded'
                  size='sm'
                  variant='outline'
                  onClick={() => window.open(url, '_blank')}
                >
                  {getFileNameFromUrl(url)}
                </Button>
              ))}
            </div>
          )}

          <div className='mt-10'>
            {/* <p className="text-sm text-white-700">메모</p> */}
            <BlockNoteView editable={false} editor={editor} />
          </div>
        </div>
      </div>

      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>삭제 후에는 복구할 수 없습니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button className='shadow-none' size='md' variant='ghost' onClick={() => setDeleteModalOpen(false)}>
                취소
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button className='shadow-none' size='md' variant='primary' onClick={confirmDelete}>
                삭제
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DetailPage;

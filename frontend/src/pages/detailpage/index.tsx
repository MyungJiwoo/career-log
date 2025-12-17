import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import axiosInstance from '@/apis/axiosInstance';
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
  id: string;
  fileUrl?: string[];
}

const DetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<AppliedJob | undefined | null>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const editor = useCreateBlockNote();

  const navigateToEdit = (id: string) => {
    navigate(`/new/${id}`);
  };

  const fetchDetails = async () => {
    try {
      const response = await axiosInstance.get(`/appliedJob/${id}`);
      setJob(response.data);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('불러오기 실패:', error.response?.data || error.message);
      alert('불러오기 중 오류가 발생했습니다.');
    }
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/appliedJob/${id}`);
      setJob(null);
      navigate('/');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('삭제 실패:', error.response?.data || error.message);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const getFileNameFromUrl = (url: string) => {
    if (!url) return '';
    if (typeof url !== 'string') return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
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
      console.error('BlockNote parsing failed:', error);
    }
  }, [job, editor]);

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
                <StageTag jobId={id} name={stage.name} size='md' stageId={stage._id} status={stage.status} />
              ))}
            </div>
          </div>

          {job?.fileUrl && job?.fileUrl.length > 0 && (
            <div className='flex flex-col gap-1'>
              <p className='text-white-700 text-sm'>업로드 파일</p>
              {job?.fileUrl.map((url, index) => (
                <Button
                  key={index}
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

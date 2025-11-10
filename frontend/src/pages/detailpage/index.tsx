const DetailPage = () => {
  return (
    <div className="flex flex-col flex-1">
      <div className="bg-white-100 rounded-2xl w-full p-8 gap-6 flex flex-col">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-black-900">기업 이름</h1>
          <button className="bg-white-100 text-white-700 w-fit py-1.5 px-3 rounded-xl cursor-pointer hover:bg-white-300">
            편집
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex gap-12">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-white-700">직무</p>
              <p className="text-black-900">인턴</p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm text-white-700">지원일</p>
              <p className="text-black-900">2025.11.11</p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-sm text-white-700">채용 절차</p>
            <div className="flex gap-2">
              <p className="w-fit py-1 px-3 rounded-2xl bg-black-200 text-black-600 whitespace-nowrap">
                서류
              </p>
              <p className="w-fit py-1 px-3 rounded-2xl bg-black-200 text-black-600 whitespace-nowrap">
                인적성 검사
              </p>
              <p className="w-fit py-1 px-3 rounded-2xl bg-black-200 text-black-600 whitespace-nowrap">
                코딩 테스트
              </p>
              <p className="w-fit py-1 px-3 rounded-2xl bg-black-200 text-black-600 whitespace-nowrap">
                서류
              </p>
              <p className="w-fit py-1 px-3 rounded-2xl bg-black-200 text-black-600 whitespace-nowrap">
                인적성 검사
              </p>
              <p className="w-fit py-1 px-3 rounded-2xl bg-black-200 text-black-600 whitespace-nowrap">
                코딩 테스트
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-white-700">메모</p>
            <div>이런 저런 이야기</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;

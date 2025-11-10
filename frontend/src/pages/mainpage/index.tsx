const MainPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-black-900">지원 현황 리포트</h1>

      {/* 지원 현황 통계 위젯 */}
      <div className="flex justify-between">
        <div className="w-36 h-36 rounded-2xl bg-white-100 flex flex-col justify-center items-center gap-2">
          <h4 className="text-sm text-black-900">총 지원 횟수</h4>
          <h3 className="text-black-900 font-bold text-3xl">70번</h3>
        </div>

        <div className="w-36 h-36 rounded-2xl bg-white-100 flex flex-col justify-center items-center gap-2">
          <h4 className="text-sm text-black-900">총 합격률</h4>
          <h3 className="text-black-900 font-bold text-3xl">70%</h3>
        </div>

        <div className="w-36 h-36 rounded-2xl bg-white-100 flex flex-col justify-center items-center gap-2">
          <h4 className="text-sm text-black-900">서류 합격률</h4>
          <h3 className="text-black-900 font-bold text-3xl">70%</h3>
          <p className="text-sm text-white-700">총 30회 지원</p>
        </div>

        <div className="w-36 h-36 rounded-2xl bg-white-100 flex flex-col justify-center items-center gap-2">
          <h4 className="text-sm text-black-900">코딩 테스트 합격률</h4>
          <h3 className="text-black-900 font-bold text-3xl">70%</h3>
          <p className="text-sm text-white-700">총 30회 진행</p>
        </div>

        <div className="w-36 h-36 rounded-2xl bg-white-100 flex flex-col justify-center items-center gap-2">
          <h4 className="text-sm text-black-900">과제 테스트 합격률</h4>
          <h3 className="text-black-900 font-bold text-3xl">70%</h3>
          <p className="text-sm text-white-700">총 30회 진행</p>
        </div>

        <div className="w-36 h-36 rounded-2xl bg-white-100 flex flex-col justify-center items-center gap-2">
          <h4 className="text-sm text-black-900">면접 합격률</h4>
          <h3 className="text-black-900 font-bold text-3xl">70%</h3>
          <p className="text-sm text-white-700">총 30회 진행</p>
        </div>
      </div>

      {/* 지원 현황 추가 버튼 */}
      <div className="flex justify-between">
        <div className="flex gap-2 justify-start">
          <button className="text-sm bg-black-600 text-white-200 w-fit py-1.5 px-3 rounded-xl cursor-pointer">
            진행 중
          </button>
          <button className="text-sm bg-white-300 text-black-800 w-fit py-1.5 px-3 rounded-xl cursor-pointer">
            진행 종료
          </button>
        </div>
        <button className="text-sm bg-black-800 text-white-200 w-fit py-1.5 px-3 rounded-xl cursor-pointer ml-auto">
          추가하기
        </button>
      </div>

      {/* 지원 현황 표 */}
      <table className="w-full table-fixed border-separate bg-white-100 rounded-2xl p-4 border-spacing-x-4 border-spacing-y-3">
        <thead className="sticky top-0 z-10 text-black-600">
          <tr className="text-left">
            <th scope="col" className="w-4 text-sm font-semibold">
              번호
            </th>
            <th scope="col" className="w-10 text-sm font-semibold">
              기업명
            </th>
            <th scope="col" className="w-8 text-sm font-semibold">
              직무
            </th>
            <th scope="col" className="w-8 text-sm font-semibold">
              지원일
            </th>
            <th scope="col" className="w-40 text-sm font-semibold">
              채용 절차
            </th>
          </tr>
        </thead>

        <tbody className="text-black-900">
          <tr className="">
            <td>1</td>
            <td>기업 이름</td>
            <td>인턴</td>
            <td>2025.11.11</td>
            <td>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-thin scrollbar-track-transparent">
                <p className="text-sm w-fit py-1 px-3 rounded-2xl bg-black-200 text-black-600 whitespace-nowrap">
                  서류
                </p>
                <p className="text-sm w-fit py-1 px-3 rounded-2xl bg-black-200 text-black-600 whitespace-nowrap">
                  인적성 검사
                </p>
                <p className="text-sm w-fit py-1 px-3 rounded-2xl bg-black-200 text-black-600 whitespace-nowrap">
                  코딩 테스트
                </p>
                <p className="text-sm w-fit py-1 px-3 rounded-2xl bg-black-200 text-black-600 whitespace-nowrap">
                  과제 테스트
                </p>
                <p className="text-sm w-fit py-1 px-3 rounded-2xl bg-black-200 text-black-600 whitespace-nowrap">
                  1차 면접
                </p>
                <p className="text-sm w-fit py-1 px-3 rounded-2xl bg-black-200 text-black-600 whitespace-nowrap">
                  2차 면접
                </p>
              </div>
            </td>
          </tr>
          <tr className="">
            <td>2</td>
            <td>기업 이름</td>
            <td>인턴</td>
            <td>2025.11.11</td>
            <td>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-thin scrollbar-track-transparent">
                <p className="text-sm w-fit py-1 px-3 rounded-2xl bg-black-200 text-black-600 whitespace-nowrap">
                  서류
                </p>
                <p className="text-sm w-fit py-1 px-3 rounded-2xl bg-black-200 text-black-600 whitespace-nowrap">
                  인적성 검사
                </p>
                <p className="text-sm w-fit py-1 px-3 rounded-2xl bg-black-200 text-black-600 whitespace-nowrap">
                  코딩 테스트
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MainPage;

const CreatePage = () => {
  return (
    <div className="flex flex-col gap-6 max-w-120 flex-1">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-black-900">진행 일정 추가</h1>
        <button className="bg-black-800 text-white-200 w-fit py-1.5 px-3 rounded-xl cursor-pointer ml-auto">
          저장
        </button>
      </div>

      <form className="bg-white-100 rounded-2xl w-full p-5 gap-4 flex flex-col">
        <label className="flex flex-col gap-2">
          기업명
          <input
            type="text"
            className="border rounded-lg px-2 py-1 border-white-200"
          />
        </label>

        <label className="flex flex-col gap-2">
          직무
          <input
            type="text"
            className="border rounded-lg px-2 py-1 border-white-200"
          />
        </label>

        <label className="flex flex-col gap-2">
          지원일
          <input
            type="text"
            className="border rounded-lg px-2 py-1 border-white-200"
          />
        </label>

        <label className="flex flex-col gap-2">
          채용 절차
          <input
            type="text"
            className="border rounded-lg px-2 py-1 border-white-200"
          />
        </label>

        <label className="flex flex-col gap-2">
          메모
          <input
            type="text"
            className="border rounded-lg px-2 py-1 border-white-200"
          />
        </label>
      </form>
    </div>
  );
};

export default CreatePage;

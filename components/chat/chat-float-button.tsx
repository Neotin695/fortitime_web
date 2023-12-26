import Message3FillIcon from "remixicon-react/Message3FillIcon";

export const ChatFloatButton = ({ onClick }: { onClick: () => void }) => (
  <div className="fixed md:right-4 bottom-7 right-2 z-10">
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-primary flex items-center justify-center md:w-[68px] md:h-[68px] w-14 h-14 aspect-square text-white drop-shadow-3xl outline-none focus-ring hover:brightness-90 transition-all active:translate-y-px"
    >
      <Message3FillIcon size={30} />
    </button>
  </div>
);

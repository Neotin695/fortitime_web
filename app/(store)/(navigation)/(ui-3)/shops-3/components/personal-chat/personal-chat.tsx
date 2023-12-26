"use client";

import { useState } from "react";
import { ChatFloatButton } from "@/components/chat/chat-float-button";
import { Drawer } from "@/components/drawer";
import dynamic from "next/dynamic";

const Chat = dynamic(() => import("@/components/chat"));

export const PersonalChat = ({ sellerId }: { sellerId?: number }) => {
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  return (
    <>
      <Drawer position="right" open={isChatDrawerOpen} onClose={() => setIsChatDrawerOpen(false)}>
        <Chat recieverId={sellerId} />
      </Drawer>
      <ChatFloatButton onClick={() => setIsChatDrawerOpen(true)} />
    </>
  );
};

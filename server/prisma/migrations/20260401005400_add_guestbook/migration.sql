-- CreateTable
CREATE TABLE "Guestbook" (
    "id" SERIAL NOT NULL,
    "nickname" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guestbook_pkey" PRIMARY KEY ("id")
);
